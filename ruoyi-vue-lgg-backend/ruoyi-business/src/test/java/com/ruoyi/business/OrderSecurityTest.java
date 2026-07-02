package com.ruoyi.business;

import com.ruoyi.business.constant.MessageConstant;
import com.ruoyi.business.context.BaseContext;
import com.ruoyi.business.dto.OrdersSubmitDTO;
import com.ruoyi.business.entity.AddressBook;
import com.ruoyi.business.entity.Orders;
import com.ruoyi.business.entity.ShoppingCart;
import com.ruoyi.business.entity.OrderDetail;
import com.ruoyi.business.exception.OrderBusinessException;
import com.ruoyi.business.mapper.*;
import com.ruoyi.business.service.impl.OrderServiceImpl;
import com.ruoyi.business.vo.OrderSubmitVO;
import com.ruoyi.business.vo.OrderVO;
import com.ruoyi.business.dto.OrdersPageQueryDTO;
import com.ruoyi.business.result.PageResult;
import java.time.LocalDateTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.ruoyi.business.websocket.WebSocketServer;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderSecurityTest {

    @InjectMocks
    private OrderServiceImpl orderService;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderDetailMapper orderDetailMapper;

    @Mock
    private ShoppingCartMapper shoppingCartMapper;

    @Mock
    private AddressBookMapper addressBookMapper;

    @Mock
    private DishMapper dishMapper;

    @Mock
    private WebSocketServer webSocketServer;

    @Mock
    private RedisTemplate redisTemplate;

    @Mock
    private ValueOperations valueOperations;

    @BeforeEach
    public void setUp() {
        BaseContext.setCurrentId(1L); // 默认操作用户为 1L
    }

    @AfterEach
    public void tearDown() {
        BaseContext.removeCurrentId();
    }

    /**
     * S05-T01-STEP01: 校验金额防篡改逻辑
     */
    @Test
    public void testSubmitOrderAmountTamperProtection() {
        // 1. 模拟参数与依赖
        OrdersSubmitDTO submitDTO = new OrdersSubmitDTO();
        submitDTO.setAddressBookId(10L);
        submitDTO.setAmount(new BigDecimal("0.01")); // 恶意篡改的前端极低支付金额

        AddressBook mockAddress = new AddressBook();
        mockAddress.setId(10L);
        mockAddress.setConsignee("曹磊");
        mockAddress.setPhone("13888888888");
        mockAddress.setProvinceName("江苏省");
        mockAddress.setCityName("常州市");
        mockAddress.setDistrictName("新北区");
        mockAddress.setDetail("常州工学院");

        List<ShoppingCart> mockCart = new ArrayList<>();
        ShoppingCart cartItem = new ShoppingCart();
        cartItem.setId(1L);
        cartItem.setAmount(new BigDecimal("15.00"));
        cartItem.setNumber(2); // 15元 * 2件 = 30元 (购物车实算总价)
        mockCart.add(cartItem);

        when(addressBookMapper.getById(10L)).thenReturn(mockAddress);
        when(shoppingCartMapper.list(any())).thenReturn(mockCart);

        // 2. 执行下单
        OrderSubmitVO submitVO = orderService.submitOrder(submitDTO);

        // 3. 断言核对
        assertNotNull(submitVO);
        // 核心验证：即使传入 amount=0.01，后端必须强行计算并覆写为真实总金额 30.00
        assertEquals(new BigDecimal("30.00"), submitVO.getOrderAmount());
        
        // 验证订单实体最终入库的金额也是 30.00
        verify(orderMapper).insert(argThat(orders -> 
            orders.getAmount().compareTo(new BigDecimal("30.00")) == 0
        ));
    }

    /**
     * S05-T01-STEP02: 校验平行越权取消订单拦截逻辑
     */
    @Test
    public void testUserCancelByIdCrossUserPrevention() throws Exception {
        // 1. 模拟一个属于用户 100L 的订单
        Orders mockOrder = new Orders();
        mockOrder.setId(99L);
        mockOrder.setUserId(100L);
        mockOrder.setStatus(1); // 待支付

        when(orderMapper.getById(99L)).thenReturn(mockOrder);

        // 2. 将当前操作上下文设为用户 200L (越权操作人)
        BaseContext.setCurrentId(200L);

        // 3. 执行取消并断言异常抛出
        OrderBusinessException exception = assertThrows(OrderBusinessException.class, () -> {
            orderService.userCancelById(99L);
        });

        // 断言错误提示是订单状态错误（防止嗅探泄露信息）或业务拦截
        assertEquals(MessageConstant.ORDER_STATUS_ERROR, exception.getMessage());
        
        // 验证更新逻辑未被触发，订单依然安全
        verify(orderMapper, never()).update(any());
    }

    /**
     * S05-T01-STEP03: 校验再来一单平行越权读取明细拦截
     */
    @Test
    public void testRepetitionCrossUserPrevention() {
        // 1. 模拟一个属于用户 100L 的订单
        Orders mockOrder = new Orders();
        mockOrder.setId(99L);
        mockOrder.setUserId(100L);

        when(orderMapper.getById(99L)).thenReturn(mockOrder);

        // 2. 将当前操作人设为 200L (越权读取人)
        BaseContext.setCurrentId(200L);

        // 3. 执行再来一单并断言异常
        OrderBusinessException exception = assertThrows(OrderBusinessException.class, () -> {
            orderService.repetition(99L);
        });

        assertEquals(MessageConstant.ORDER_STATUS_ERROR, exception.getMessage());

        // 确认不会读取明细并插入购物车
        verify(orderDetailMapper, never()).getByOrderId(any());
        verify(shoppingCartMapper, never()).insert(any());
    }

    /**
     * S05-T02: 校验支付确认后库存条件扣减成功
     */
    @Test
    public void testConfirmPaymentStockDecreaseSuccessfully() {
        Orders orders = new Orders();
        orders.setId(101L);
        orders.setNumber("O101");
        orders.setStatus(Orders.PENDING_PAYMENT);

        OrderDetail detail = new OrderDetail();
        detail.setDishId(5L);
        detail.setNumber(2);
        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);

        // 模拟已存在订单，按订单号获取
        when(orderMapper.getByNumberAndUserId("O101", 1L)).thenReturn(orders);
        when(orderDetailMapper.getByOrderId(101L)).thenReturn(details);
        // 模拟库存扣减成功，返回影响行数 1
        when(dishMapper.decreaseStock(5L, 2)).thenReturn(1);
        when(orderMapper.markPaymentSuccessWithLock(eq(101L), eq(Orders.PENDING_PAYMENT), eq(Orders.UN_PAID),
                eq(Orders.TO_BE_CONFIRMED), eq(Orders.PAID), any(), eq(0))).thenReturn(1);

        orderService.confirmPayment("O101");

        // 验证状态成功变更为待接单
        assertEquals(Orders.TO_BE_CONFIRMED, orders.getStatus());
        assertEquals(Orders.PAID, orders.getPayStatus());
        verify(orderMapper).markPaymentSuccessWithLock(eq(101L), eq(Orders.PENDING_PAYMENT), eq(Orders.UN_PAID),
                eq(Orders.TO_BE_CONFIRMED), eq(Orders.PAID), any(), eq(0));
        verify(dishMapper).decreaseStock(5L, 2);
    }

    /**
     * S05-T02: 校验库存不足时，支付确认拦截并抛出异常，防超卖
     */
    @Test
    public void testConfirmPaymentStockInsufficientThrowsException() {
        Orders orders = new Orders();
        orders.setId(102L);
        orders.setNumber("O102");
        orders.setStatus(Orders.PENDING_PAYMENT);
        orders.setPayStatus(Orders.UN_PAID);

        OrderDetail detail = new OrderDetail();
        detail.setDishId(6L);
        detail.setNumber(3);
        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);

        when(orderMapper.getByNumberAndUserId("O102", 1L)).thenReturn(orders);
        when(orderDetailMapper.getByOrderId(102L)).thenReturn(details);
        // 模拟库存不足，返回影响行数 0
        when(dishMapper.decreaseStock(6L, 3)).thenReturn(0);
        when(orderMapper.markPaymentSuccessWithLock(eq(102L), eq(Orders.PENDING_PAYMENT), eq(Orders.UN_PAID),
                eq(Orders.TO_BE_CONFIRMED), eq(Orders.PAID), any(), eq(0))).thenReturn(1);

        // 验证抛出业务异常
        assertThrows(OrderBusinessException.class, () -> {
            orderService.confirmPayment("O102");
        });

        // 验证状态仍然是未支付待付款，防超卖
        assertEquals(Orders.PENDING_PAYMENT, orders.getStatus());
        assertEquals(Orders.UN_PAID, orders.getPayStatus());
    }

    /**
     * S05-T02-PATCH: 校验回调接口精确按订单号 getByNumber 查询
     */
    @Test
    public void testPaySuccessCallbackQueryPrecisely() {
        Orders orders = new Orders();
        orders.setId(108L);
        orders.setNumber("O108");
        orders.setStatus(Orders.PENDING_PAYMENT);

        OrderDetail detail = new OrderDetail();
        detail.setDishId(9L);
        detail.setNumber(1);
        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);

        when(orderMapper.getByNumber("O108")).thenReturn(orders);
        when(orderDetailMapper.getByOrderId(108L)).thenReturn(details);
        when(dishMapper.decreaseStock(9L, 1)).thenReturn(1);
        when(orderMapper.markPaymentSuccessWithLock(eq(108L), eq(Orders.PENDING_PAYMENT), eq(Orders.UN_PAID),
                eq(Orders.TO_BE_CONFIRMED), eq(Orders.PAID), any(), eq(0))).thenReturn(1);

        orderService.paySuccess("O108");

        assertEquals(Orders.TO_BE_CONFIRMED, orders.getStatus());
        verify(orderMapper).getByNumber("O108");
    }

    /**
     * S05-T02-PATCH: 校验重复支付回调抢不到状态锁时不会二次扣减库存
     */
    @Test
    public void testPaySuccessDuplicateCallbackDoesNotDecreaseStockAgain() {
        Orders orders = new Orders();
        orders.setId(111L);
        orders.setNumber("O111");
        orders.setStatus(Orders.PENDING_PAYMENT);

        when(orderMapper.getByNumber("O111")).thenReturn(orders);
        when(orderMapper.markPaymentSuccessWithLock(eq(111L), eq(Orders.PENDING_PAYMENT), eq(Orders.UN_PAID),
                eq(Orders.TO_BE_CONFIRMED), eq(Orders.PAID), any(), eq(0))).thenReturn(0);

        orderService.paySuccess("O111");

        verify(orderDetailMapper, never()).getByOrderId(any());
        verify(dishMapper, never()).decreaseStock(any(), any());
        verify(webSocketServer, never()).sendToAllClient(any());
    }

    /**
     * S05-T02: 校验取消订单后，已支付订单成功回补库存
     */
    @Test
    public void testCancelOrderRollbackStockSuccessfully() throws Exception {
        Orders orders = new Orders();
        orders.setId(103L);
        orders.setUserId(1L);
        orders.setPayStatus(Orders.PAID);
        orders.setStatus(Orders.TO_BE_CONFIRMED); // 已支付待接单

        OrderDetail detail = new OrderDetail();
        detail.setDishId(7L);
        detail.setNumber(1);
        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);

        when(orderMapper.getById(103L)).thenReturn(orders);
        when(orderDetailMapper.getByOrderId(103L)).thenReturn(details);
        when(orderMapper.updateStockRollbackStatusWithLock(eq(103L), eq(0), eq(1))).thenReturn(1);

        orderService.userCancelById(103L);

        // 验证订单成功取消
        assertEquals(Orders.CANCELLED, orders.getStatus());
        verify(orderMapper).update(argThat(updated -> updated.getStockRollbackStatus() == null));
        // 验证库存回补接口被触发
        verify(dishMapper).increaseStock(7L, 1);
    }

    /**
     * S05-T02-PATCH: 校验越权支付确认防御
     */
    @Test
    public void testConfirmPaymentCrossUserPrevention() {
        // 模拟一个待付款且归属于用户 100L 的订单
        Orders orders = new Orders();
        orders.setId(104L);
        orders.setNumber("O104");
        orders.setUserId(100L);
        orders.setStatus(Orders.PENDING_PAYMENT);

        // 操作上下文置为用户 200L (越权操作人)
        BaseContext.setCurrentId(200L);

        // 验证抛出业务异常 (查不到或无权操作)
        assertThrows(OrderBusinessException.class, () -> {
            orderService.confirmPayment("O104");
        });
    }

    /**
     * S05-T02-PATCH: 校验越权催单防御
     */
    @Test
    public void testReminderCrossUserPrevention() {
        Orders orders = new Orders();
        orders.setId(105L);
        orders.setUserId(100L);

        when(orderMapper.getById(105L)).thenReturn(orders);

        // 操作上下文设为 200L (越权催单人)
        BaseContext.setCurrentId(200L);

        assertThrows(OrderBusinessException.class, () -> {
            orderService.reminder(105L);
        });
    }

    /**
     * S05-T03: 校验催单限流防刷拦截
     */
    @Test
    public void testReminderRateLimitingFilter() {
        Orders orders = new Orders();
        orders.setId(109L);
        orders.setUserId(1L);
        orders.setStatus(Orders.TO_BE_CONFIRMED); // 待接单
        orders.setPayStatus(Orders.PAID);
        orders.setNumber("O109");

        when(orderMapper.getById(109L)).thenReturn(orders);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        // 第一次调用，setIfAbsent 返回 true (加锁成功)
        when(valueOperations.setIfAbsent(any(), any(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        orderService.reminder(109L);

        // 第二次调用，setIfAbsent 返回 false (加锁失败，被限流)
        when(valueOperations.setIfAbsent(any(), any(), anyLong(), any(TimeUnit.class))).thenReturn(false);
        assertThrows(OrderBusinessException.class, () -> {
            orderService.reminder(109L);
        });
    }

    /**
     * S05-T03: 校验无效订单状态催单被拦截
     */
    @Test
    public void testReminderInvalidOrderStatusException() {
        Orders orders = new Orders();
        orders.setId(110L);
        orders.setUserId(1L);
        orders.setStatus(Orders.PENDING_PAYMENT); // 待付款状态不能催单
        orders.setPayStatus(Orders.UN_PAID);

        when(orderMapper.getById(110L)).thenReturn(orders);

        assertThrows(OrderBusinessException.class, () -> {
            orderService.reminder(110L);
        });
    }

    /**
     * S05-T02-PATCH: 校验已支付订单二次取消时，库存回补幂等防御 (仅回补一次)
     */
    @Test
    public void testRollbackStockDoublePrevention() throws Exception {
        Orders orders = new Orders();
        orders.setId(106L);
        orders.setUserId(1L);
        orders.setPayStatus(Orders.PAID);
        orders.setStatus(Orders.TO_BE_CONFIRMED);
        orders.setStockRollbackStatus(0); // 初始化为 0

        OrderDetail detail = new OrderDetail();
        detail.setDishId(8L);
        detail.setNumber(2);
        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);

        // 第一次取消动作，乐观锁更新成功，返回 1
        when(orderMapper.getById(106L)).thenReturn(orders);
        when(orderDetailMapper.getByOrderId(106L)).thenReturn(details);
        when(orderMapper.updateStockRollbackStatusWithLock(106L, 0, 1)).thenReturn(1);

        orderService.userCancelById(106L);

        // 校验库存已回补
        verify(dishMapper, times(1)).increaseStock(8L, 2);

        // 模拟第二次并发重入动作
        orders.setStatus(Orders.TO_BE_CONFIRMED); // 再次设回可取消状态做模拟
        orders.setStockRollbackStatus(1); // 模拟状态已被锁定为 1

        orderService.userCancelById(106L);

        // 校验虽然再次取消，但 increaseStock 没有被执行第二次（依旧是 times(1)）
        verify(dishMapper, times(1)).increaseStock(8L, 2);
    }

    /**
     * S05-T02-PATCH: 校验未付款订单取消，绝对禁止回滚商品库存，防虚增
     */
    @Test
    public void testUnpaidOrderCancelDoesNotRollbackStock() throws Exception {
        Orders orders = new Orders();
        orders.setId(107L);
        orders.setUserId(1L);
        orders.setPayStatus(Orders.UN_PAID); // 未付款
        orders.setStatus(Orders.PENDING_PAYMENT);

        when(orderMapper.getById(107L)).thenReturn(orders);

        orderService.userCancelById(107L);

        // 验证订单本身已经变成了取消状态
        assertEquals(Orders.CANCELLED, orders.getStatus());
        // 验证 increaseStock 绝对没有被触发过
        verify(dishMapper, never()).increaseStock(any(), any());
    }

    /**
     * S05-T04: 校验下单时预计送达时间与超时状态正确初始化
     */
    @Test
    public void testSubmitOrderEstimatedDeliveryTimeInitialization() {
        OrdersSubmitDTO submitDTO = new OrdersSubmitDTO();
        submitDTO.setAddressBookId(10L);
        submitDTO.setAmount(new BigDecimal("10.00"));

        AddressBook mockAddress = new AddressBook();
        mockAddress.setId(10L);
        mockAddress.setConsignee("曹磊");

        List<ShoppingCart> mockCart = new ArrayList<>();
        ShoppingCart cartItem = new ShoppingCart();
        cartItem.setId(1L);
        cartItem.setAmount(new BigDecimal("5.00"));
        cartItem.setNumber(2);
        mockCart.add(cartItem);

        when(addressBookMapper.getById(10L)).thenReturn(mockAddress);
        when(shoppingCartMapper.list(any())).thenReturn(mockCart);

        orderService.submitOrder(submitDTO);

        // 验证数据库插入的订单包含正确的预计送达时间 (下单时间 + 60分钟)
        verify(orderMapper).insert(argThat(orders -> 
            orders.getEstimatedDeliveryTime() != null && 
            orders.getEstimatedDeliveryTime().isAfter(orders.getOrderTime()) &&
            orders.getOvertimeStatus() == 0
        ));
    }

    /**
     * S05-T04: 校验条件查询动态计算超时标记
     */
    @Test
    public void testConditionSearchDynamicOvertimeCalculation() {
        Orders mockOrder = new Orders();
        mockOrder.setId(201L);
        mockOrder.setStatus(Orders.TO_BE_CONFIRMED);
        mockOrder.setEstimatedDeliveryTime(LocalDateTime.now().minusMinutes(10)); // 预计送达是 10分钟前 (已超时)
        mockOrder.setActualDeliveryTime(null); // 尚未送达

        com.github.pagehelper.Page<Orders> pageList = new com.github.pagehelper.Page<>();
        pageList.add(mockOrder);
        pageList.setTotal(1);

        OrdersPageQueryDTO queryDTO = new OrdersPageQueryDTO();
        queryDTO.setPage(1);
        queryDTO.setPageSize(10);

        when(orderMapper.pageQuery(queryDTO)).thenReturn(pageList);
        when(orderDetailMapper.getByOrderId(201L)).thenReturn(new ArrayList<>());

        PageResult result = orderService.conditionSearch(queryDTO);

        assertNotNull(result);
        List<OrderVO> list = (List<OrderVO>) result.getRecords();
        assertEquals(1, list.size());
        // 核心验证：应动态被识别并标记为 1 (超时)
        assertEquals(1, list.get(0).getOvertimeStatus());
    }

    /**
     * S05-T04: 校验订单完成时实际送达时间与物理超时判定
     */
    @Test
    public void testOrderCompleteOvertimeStatusCalculation() {
        Orders mockOrder = new Orders();
        mockOrder.setId(202L);
        mockOrder.setStatus(Orders.DELIVERY_IN_PROGRESS);
        mockOrder.setEstimatedDeliveryTime(LocalDateTime.now().minusMinutes(5)); // 预计送达是5分钟前
        mockOrder.setActualDeliveryTime(null);

        when(orderMapper.getById(202L)).thenReturn(mockOrder);

        orderService.complete(202L);

        // 验证状态变更为已完成，且实际送达时间被记录，且 overtimeStatus 物理写入数据库为 1 (超时)
        assertEquals(Orders.COMPLETED, mockOrder.getStatus());
        assertNotNull(mockOrder.getActualDeliveryTime());
        assertEquals(1, mockOrder.getOvertimeStatus());
        verify(orderMapper).update(mockOrder);
    }

    /**
     * S05-T05: 校验定时任务超时关单与状态锁防并发
     */
    @Test
    public void testProcessTimeoutOrderWithLockSuccess() {
        Orders orders = new Orders();
        orders.setId(301L);
        orders.setStatus(Orders.PENDING_PAYMENT);

        List<Orders> list = new ArrayList<>();
        list.add(orders);

        // 模拟查出超时订单
        when(orderMapper.getByStatusAndOrderTimeLT(any(), any())).thenReturn(list);
        
        // 模拟第一次乐观锁更新成功，返回 1
        when(orderMapper.updateStatusWithLock(eq(301L), eq(Orders.PENDING_PAYMENT), eq(Orders.CANCELLED), anyString(), any()))
            .thenReturn(1);

        // 实例化 OrderTask
        com.ruoyi.business.task.OrderTask orderTask = new com.ruoyi.business.task.OrderTask();
        try {
            java.lang.reflect.Field mapperField = com.ruoyi.business.task.OrderTask.class.getDeclaredField("orderMapper");
            mapperField.setAccessible(true);
            mapperField.set(orderTask, orderMapper);
        } catch (Exception e) {
            fail(e.getMessage());
        }

        orderTask.processTimeoutOrder();

        // 验证乐观锁更新被正常执行
        verify(orderMapper).updateStatusWithLock(eq(301L), eq(Orders.PENDING_PAYMENT), eq(Orders.CANCELLED), anyString(), any());
    }

    /**
     * S05-T04-PATCH: 校验动态超时列表高亮排除非有效订单 (如 CANCELLED/PENDING_PAYMENT)
     */
    @Test
    public void testConditionSearchExcludeInactiveOrders() {
        Orders mockOrder = new Orders();
        mockOrder.setId(203L);
        mockOrder.setStatus(Orders.CANCELLED); // 已取消订单
        mockOrder.setEstimatedDeliveryTime(LocalDateTime.now().minusMinutes(10)); // 已超时
        mockOrder.setActualDeliveryTime(null);

        com.github.pagehelper.Page<Orders> pageList = new com.github.pagehelper.Page<>();
        pageList.add(mockOrder);
        pageList.setTotal(1);

        OrdersPageQueryDTO queryDTO = new OrdersPageQueryDTO();
        queryDTO.setPage(1);
        queryDTO.setPageSize(10);

        when(orderMapper.pageQuery(queryDTO)).thenReturn(pageList);
        when(orderDetailMapper.getByOrderId(203L)).thenReturn(new ArrayList<>());

        PageResult result = orderService.conditionSearch(queryDTO);

        assertNotNull(result);
        List<OrderVO> list = (List<OrderVO>) result.getRecords();
        assertEquals(1, list.size());
        // 核心验证：由于已取消，不应当设红高亮为 1，应为 0 (被排除)
        assertEquals(0, list.get(0).getOvertimeStatus());
    }

    /**
     * S05-T06-PATCH: 校验超时派送订单每天凌晨定时器仅输出日志，不强制修改状态
     */
    @Test
    public void testProcessDeliveryOrderOvertimeOnlyWarning() {
        Orders orders = new Orders();
        orders.setId(401L);
        orders.setNumber("O401");
        orders.setStatus(Orders.DELIVERY_IN_PROGRESS);

        List<Orders> list = new ArrayList<>();
        list.add(orders);

        when(orderMapper.getDeliveryTimeoutOrders(any())).thenReturn(list);

        com.ruoyi.business.task.OrderTask orderTask = new com.ruoyi.business.task.OrderTask();
        try {
            java.lang.reflect.Field mapperField = com.ruoyi.business.task.OrderTask.class.getDeclaredField("orderMapper");
            mapperField.setAccessible(true);
            mapperField.set(orderTask, orderMapper);
        } catch (Exception e) {
            fail(e.getMessage());
        }

        orderTask.processDeliveryOrder();

        // 验证没有触发任何 orders 状态的修改或 update 行为
        assertEquals(Orders.DELIVERY_IN_PROGRESS, orders.getStatus());
        verify(orderMapper).getDeliveryTimeoutOrders(any());
        verify(orderMapper, never()).update(any());
    }
}
