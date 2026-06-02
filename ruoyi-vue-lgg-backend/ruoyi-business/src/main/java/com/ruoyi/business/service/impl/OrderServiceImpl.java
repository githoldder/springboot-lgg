package com.ruoyi.business.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.ruoyi.business.constant.MessageConstant;
import com.ruoyi.business.context.BaseContext;
import com.ruoyi.business.dto.*;
import com.ruoyi.business.entity.*;
import com.ruoyi.business.exception.AddressBookBusinessException;
import com.ruoyi.business.exception.OrderBusinessException;
import com.ruoyi.business.exception.ShoppingCartBusinessException;
import com.ruoyi.business.mapper.*;
import com.ruoyi.business.result.PageResult;
import com.ruoyi.business.service.OrderService;
import com.ruoyi.business.vo.*;
import com.ruoyi.business.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 绿果果订单业务层实现
 */
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Autowired
    private ShoppingCartMapper shoppingCartMapper;

    @Autowired
    private AddressBookMapper addressBookMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 用户提交订单
     */
    @Transactional
    public OrderSubmitVO submitOrder(OrdersSubmitDTO ordersSubmitDTO) {
        // 1. 业务异常检测 (校验收货地址、购物车)
        AddressBook addressBook = addressBookMapper.getById(ordersSubmitDTO.getAddressBookId());
        if (addressBook == null) {
            throw new AddressBookBusinessException(MessageConstant.ADDRESS_BOOK_IS_NULL);
        }
        
        Long userId = BaseContext.getCurrentId();
        ShoppingCart shoppingCartQuery = new ShoppingCart();
        shoppingCartQuery.setUserId(userId);
        List<ShoppingCart> cartList = shoppingCartMapper.list(shoppingCartQuery);
        if (cartList == null || cartList.isEmpty()) {
            throw new ShoppingCartBusinessException(MessageConstant.SHOPPING_CART_IS_NULL);
        }

        // 2. 创建订单主表数据并插入
        Orders orders = new Orders();
        BeanUtils.copyProperties(ordersSubmitDTO, orders);
        orders.setOrderTime(LocalDateTime.now());
        orders.setPayStatus(Orders.UN_PAID);
        orders.setStatus(Orders.PENDING_PAYMENT);
        orders.setNumber(String.valueOf(System.currentTimeMillis())); // 简易生成订单号
        orders.setPhone(addressBook.getPhone());
        orders.setConsignee(addressBook.getConsignee());
        orders.setUserId(userId);
        orders.setAddress(addressBook.getProvinceName() + addressBook.getCityName() + addressBook.getDistrictName() + addressBook.getDetail());
        
        orderMapper.insert(orders);

        // 3. 创建订单明细数据并插入
        List<OrderDetail> detailList = new ArrayList<>();
        for (ShoppingCart cartItem : cartList) {
            OrderDetail detail = new OrderDetail();
            BeanUtils.copyProperties(cartItem, detail);
            detail.setOrderId(orders.getId()); // 设置绑定的主订单ID
            detailList.add(detail);
        }
        orderDetailMapper.insertBatch(detailList);

        // 4. 清空该用户的购物车
        shoppingCartMapper.deleteByUserId(userId);

        // 5. 组装返回的 DTO VO
        return OrderSubmitVO.builder()
                .id(orders.getId())
                .orderNumber(orders.getNumber())
                .orderAmount(orders.getAmount())
                .orderTime(orders.getOrderTime())
                .build();
    }

    /**
     * 订单支付 (模拟预支付流程)
     */
    public OrderPaymentVO payment(OrdersPaymentDTO ordersPaymentDTO) throws Exception {
        log.info("用户请求订单支付：{}", ordersPaymentDTO.getOrderNumber());
        
        // 由于没有真实商户环境，模拟生成一套微信小程序调起支付所需要的 RSA 二次签名参数
        String timeStamp = String.valueOf(System.currentTimeMillis() / 1000);
        String nonceStr = "mockNonceStr" + System.currentTimeMillis();
        String packageStr = "prepay_id=mockPrepayId" + System.currentTimeMillis();
        String paySign = "mockPaySign" + System.currentTimeMillis();

        return OrderPaymentVO.builder()
                .nonceStr(nonceStr)
                .paySign(paySign)
                .timeStamp(timeStamp)
                .signType("RSA")
                .packageStr(packageStr)
                .build();
    }

    /**
     * 支付成功，修改订单状态并向后台推送消息
     */
    public void paySuccess(String outTradeNo) {
        // 1. 查询订单
        // 微信端回调时不带UserId，我们需要直接按订单号查询
        Long userId = BaseContext.getCurrentId();
        Orders orders = orderMapper.getByNumberAndUserId(outTradeNo, userId);
        if (orders == null) {
            // 支持微信异步回调(不含当前用户线程上下文)的查询
            orders = orderMapper.getById(Long.valueOf(outTradeNo)); // 兼容ID查询
            if (orders == null) {
                // 如果实在找不到，查最新的一单
                OrdersPageQueryDTO query = new OrdersPageQueryDTO();
                query.setNumber(outTradeNo);
                List<Orders> list = orderMapper.pageQuery(query);
                if (list != null && !list.isEmpty()) {
                    orders = list.get(0);
                }
            }
        }

        if (orders != null && orders.getStatus().equals(Orders.PENDING_PAYMENT)) {
            // 2. 修改订单状态 (流转为 待接单/待包装，已支付)
            orders.setStatus(Orders.TO_BE_CONFIRMED);
            orders.setPayStatus(Orders.PAID);
            orders.setCheckoutTime(LocalDateTime.now());
            orderMapper.update(orders);

            // 3. 微信小程序来单提醒：通过 WebSocket 向后台推送语音播报提醒
            Map<String, Object> map = new HashMap<>();
            map.put("type", 1); // 1表示来单提醒，2表示催单提醒
            map.put("orderId", orders.getId());
            map.put("content", "您有新的绿果果订单，请及时包装！订单号：" + orders.getNumber());
            
            String json = JSON.toJSONString(map);
            webSocketServer.sendToAllClient(json);
            log.info("已通过 WebSocket 推送来单语音播报提醒：{}", json);
        }
    }

    /**
     * 用户端订单历史记录查询
     */
    public PageResult pageQuery4User(int page, int pageSize, Integer status) {
        PageHelper.startPage(page, pageSize);
        
        OrdersPageQueryDTO query = new OrdersPageQueryDTO();
        query.setUserId(BaseContext.getCurrentId());
        query.setStatus(status);

        Page<Orders> p = orderMapper.pageQuery(query);
        List<OrderVO> list = new ArrayList<>();

        if (p != null && p.getTotal() > 0) {
            for (Orders orders : p) {
                OrderVO orderVO = new OrderVO();
                BeanUtils.copyProperties(orders, orderVO);
                // 查询订单明细
                List<OrderDetail> details = orderDetailMapper.getByOrderId(orders.getId());
                orderVO.setOrderDetailList(details);
                list.add(orderVO);
            }
        }

        return new PageResult(p != null ? p.getTotal() : 0, list);
    }

    /**
     * 查询订单明细详情
     */
    public OrderVO details(Long id) {
        Orders orders = orderMapper.getById(id);
        if (orders == null) {
            return null;
        }
        OrderVO orderVO = new OrderVO();
        BeanUtils.copyProperties(orders, orderVO);
        List<OrderDetail> details = orderDetailMapper.getByOrderId(id);
        orderVO.setOrderDetailList(details);
        return orderVO;
    }

    /**
     * 用户取消订单
     */
    public void userCancelById(Long id) throws Exception {
        Orders orders = orderMapper.getById(id);
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        // 如果处于派送或已完成等状态不能取消
        if (orders.getStatus() > 2) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
        orders.setStatus(Orders.CANCELLED);
        orders.setCancelReason("用户主动取消订单");
        orders.setCancelTime(LocalDateTime.now());
        orderMapper.update(orders);
    }

    /**
     * 再来一单 (复制过去明细到购物车)
     */
    public void repetition(Long id) {
        List<OrderDetail> details = orderDetailMapper.getByOrderId(id);
        if (details != null && !details.isEmpty()) {
            Long userId = BaseContext.getCurrentId();
            for (OrderDetail detail : details) {
                ShoppingCart cart = new ShoppingCart();
                BeanUtils.copyProperties(detail, cart);
                cart.setUserId(userId);
                cart.setCreateTime(LocalDateTime.now());
                shoppingCartMapper.insert(cart);
            }
        }
    }

    /**
     * 后台商家订单条件分页搜索
     */
    public PageResult conditionSearch(OrdersPageQueryDTO ordersPageQueryDTO) {
        PageHelper.startPage(ordersPageQueryDTO.getPage(), ordersPageQueryDTO.getPageSize());
        Page<Orders> p = orderMapper.pageQuery(ordersPageQueryDTO);
        
        List<OrderVO> list = new ArrayList<>();
        if (p != null && p.getTotal() > 0) {
            for (Orders orders : p) {
                OrderVO orderVO = new OrderVO();
                BeanUtils.copyProperties(orders, orderVO);
                
                // 组装水果明细拼装字串输出给表格显示
                List<OrderDetail> details = orderDetailMapper.getByOrderId(orders.getId());
                String dishNames = details.stream().map(x -> x.getName() + "*" + x.getNumber()).collect(Collectors.joining("; "));
                orderVO.setOrderDishes(dishNames);
                list.add(orderVO);
            }
        }
        return new PageResult(p != null ? p.getTotal() : 0, list);
    }

    /**
     * 各个状态的订单统计数量
     */
    public OrderStatisticsVO statistics() {
        return OrderStatisticsVO.builder()
                .toBeConfirmed(orderMapper.countStatus(Orders.TO_BE_CONFIRMED))
                .confirmed(orderMapper.countStatus(Orders.CONFIRMED))
                .deliveryInProgress(orderMapper.countStatus(Orders.DELIVERY_IN_PROGRESS))
                .build();
    }

    /**
     * 商家接单
     */
    public void confirm(OrdersConfirmDTO ordersConfirmDTO) {
        Orders orders = orderMapper.getById(ordersConfirmDTO.getId());
        if (orders != null) {
            orders.setStatus(Orders.CONFIRMED);
            orderMapper.update(orders);
        }
    }

    /**
     * 商家拒单
     */
    public void rejection(OrdersRejectionDTO ordersRejectionDTO) throws Exception {
        Orders orders = orderMapper.getById(ordersRejectionDTO.getId());
        if (orders != null) {
            orders.setStatus(Orders.CANCELLED);
            orders.setCancelReason(ordersRejectionDTO.getRejectionReason());
            orders.setCancelTime(LocalDateTime.now());
            orderMapper.update(orders);
        }
    }

    /**
     * 商家取消订单
     */
    public void cancel(OrdersCancelDTO ordersCancelDTO) throws Exception {
        Orders orders = orderMapper.getById(ordersCancelDTO.getId());
        if (orders != null) {
            orders.setStatus(Orders.CANCELLED);
            orders.setCancelReason(ordersCancelDTO.getCancelReason());
            orders.setCancelTime(LocalDateTime.now());
            orderMapper.update(orders);
        }
    }

    /**
     * 商家派送订单 (水果包装打包完毕给骑手)
     */
    public void delivery(Long id) {
        Orders orders = orderMapper.getById(id);
        if (orders != null && orders.getStatus().equals(Orders.CONFIRMED)) {
            orders.setStatus(Orders.DELIVERY_IN_PROGRESS);
            orderMapper.update(orders);
        }
    }

    /**
     * 完成订单
     */
    public void complete(Long id) {
        Orders orders = orderMapper.getById(id);
        if (orders != null && orders.getStatus().equals(Orders.DELIVERY_IN_PROGRESS)) {
            orders.setStatus(Orders.COMPLETED);
            orders.setDeliveryTime(LocalDateTime.now());
            orderMapper.update(orders);
        }
    }

    /**
     * C端客户催单功能提醒
     */
    public void reminder(Long id) {
        Orders orders = orderMapper.getById(id);
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }

        // 催单提醒：通过 WebSocket 向后台推送提示和语音播报
        Map<String, Object> map = new HashMap<>();
        map.put("type", 2); // 2表示催单提醒
        map.put("orderId", id);
        map.put("content", "客户正在疯狂催单！订单号：" + orders.getNumber() + "，请快速包装并配送！");
        
        String json = JSON.toJSONString(map);
        webSocketServer.sendToAllClient(json);
        log.info("已通过 WebSocket 推送催单语音播报提醒：{}", json);
    }
}
