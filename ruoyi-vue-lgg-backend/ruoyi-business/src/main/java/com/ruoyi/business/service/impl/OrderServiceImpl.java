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
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.concurrent.TimeUnit;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 常工鲜生订单业务层实现
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

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private RedisTemplate redisTemplate;

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

        // 2. 计算购物车总金额
        BigDecimal total = cartList.stream()
                .map(item -> item.getAmount().multiply(BigDecimal.valueOf(item.getNumber())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 创建订单主表数据并插入
        Orders orders = new Orders();
        BeanUtils.copyProperties(ordersSubmitDTO, orders);
        orders.setOrderTime(LocalDateTime.now());
        orders.setPayStatus(Orders.UN_PAID);
        orders.setStatus(Orders.PENDING_PAYMENT);
        orders.setNumber(String.valueOf(System.currentTimeMillis())); // 简易生成订单号
        orders.setPhone(addressBook.getPhone());
        orders.setConsignee(addressBook.getConsignee());
        orders.setUserId(userId);
        orders.setAddress(safe(addressBook.getProvinceName()) + safe(addressBook.getCityName())
                + safe(addressBook.getDistrictName()) + safe(addressBook.getDetail()));
        orders.setDeliveryType(ordersSubmitDTO.getDeliveryType() == null || ordersSubmitDTO.getDeliveryType().isEmpty()
                ? "DELIVERY"
                : ordersSubmitDTO.getDeliveryType());
        orders.setUserName(addressBook.getConsignee());
        // 设置默认值：配送状态、打包费、餐具数量、餐具服务状态
        if (orders.getDeliveryStatus() == null) orders.setDeliveryStatus(1);
        if (orders.getPackAmount() == null) orders.setPackAmount(0);
        if (orders.getTablewareNumber() == null) orders.setTablewareNumber(0);
        if (orders.getTablewareStatus() == null) orders.setTablewareStatus(1);
        // 强行使用后端购物车实算总金额覆盖外部传入值，防御金额篡改漏洞
        orders.setAmount(total);
        // 设定预计送达时间为下单时间往后推 60 分钟
        orders.setEstimatedDeliveryTime(orders.getOrderTime().plusMinutes(60));
        orders.setOvertimeStatus(0); // 初始化超时标记为 正常(0)
        
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
     * 支付确认：演示环境由前端支付成功后调用；真实环境应由微信支付回调驱动。
     */
    @Transactional
    public OrderVO confirmPayment(String orderNumber) {
        Long userId = BaseContext.getCurrentId();
        Orders orders = orderMapper.getByNumberAndUserId(orderNumber, userId);
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        if (!orders.getStatus().equals(Orders.PENDING_PAYMENT)) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
        paySuccessWithValidatedOrder(orders);

        return details(orders.getId());
    }

    /**
     * 支付成功，修改订单状态并向后台推送消息
     */
    @Transactional
    public void paySuccess(String outTradeNo) {
        // 只按精确订单号查询，决不进行 ID 的 fallback 模糊降级，防主键碰撞
        OrdersPageQueryDTO query = new OrdersPageQueryDTO();
        query.setNumber(outTradeNo);
        List<Orders> list = orderMapper.pageQuery(query);
        Orders orders = null;
        if (list != null && !list.isEmpty()) {
            orders = list.get(0);
        }
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        paySuccessWithValidatedOrder(orders);
    }

    /**
     * 精确封装已校验订单的支付成功处理逻辑，包括库存扣减、状态修改与 WebSocket 广播
     */
    private void paySuccessWithValidatedOrder(Orders orders) {
        if (orders != null && orders.getStatus().equals(Orders.PENDING_PAYMENT)) {
            // 批量条件扣减库存，防超卖
            List<OrderDetail> details = orderDetailMapper.getByOrderId(orders.getId());
            if (details != null) {
                for (OrderDetail detail : details) {
                    int rows = dishMapper.decreaseStock(detail.getDishId(), detail.getNumber());
                    if (rows == 0) {
                        throw new OrderBusinessException("商品库存不足，支付回调失败！商品ID：" + detail.getDishId());
                    }
                }
            }

            // 2. 修改订单状态 (流转为 待接单/待包装，已支付)
            orders.setStatus(Orders.TO_BE_CONFIRMED);
            orders.setPayStatus(Orders.PAID);
            orders.setCheckoutTime(LocalDateTime.now());
            orders.setStockRollbackStatus(0); // 初始化回滚标记为 0
            orderMapper.update(orders);

            // 3. 微信小程序来单提醒：通过 WebSocket 向后台推送语音播报提醒
            Map<String, Object> map = new HashMap<>();
            map.put("type", 1); // 1表示来单提醒，2表示催单提醒
            map.put("orderId", orders.getId());
            map.put("content", "您有新的常工鲜生订单，请及时接单！订单号：" + orders.getNumber());
            
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
    @Transactional
    public void userCancelById(Long id) throws Exception {
        Orders orders = orderMapper.getById(id);
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        // 校验归属权，防止平行越权取消他人订单
        if (!orders.getUserId().equals(BaseContext.getCurrentId())) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
        // 如果处于派送或已完成等状态不能取消
        if (orders.getStatus() > 2) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
        
        // 若已付款或处于待接单状态，自动回补商品库存
        if (orders.getPayStatus().equals(Orders.PAID) || orders.getStatus().equals(Orders.TO_BE_CONFIRMED)) {
            rollbackStock(orders.getId());
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
        Orders orders = orderMapper.getById(id);
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        // 校验归属权，防止平行越权读取他人订单商品明细
        if (!orders.getUserId().equals(BaseContext.getCurrentId())) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
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
                
                // 动态判定未送达且已超时的订单
                if (orders.getEstimatedDeliveryTime() != null && orders.getActualDeliveryTime() == null) {
                    if (LocalDateTime.now().isAfter(orders.getEstimatedDeliveryTime())) {
                        orderVO.setOvertimeStatus(1);
                    }
                }
                
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
    @Transactional
    public void rejection(OrdersRejectionDTO ordersRejectionDTO) throws Exception {
        Orders orders = orderMapper.getById(ordersRejectionDTO.getId());
        if (orders != null) {
            // 商家拒单，回补库存
            rollbackStock(orders.getId());

            orders.setStatus(Orders.CANCELLED);
            orders.setCancelReason(ordersRejectionDTO.getRejectionReason());
            orders.setCancelTime(LocalDateTime.now());
            orderMapper.update(orders);
        }
    }

    /**
     * 商家取消订单
     */
    @Transactional
    public void cancel(OrdersCancelDTO ordersCancelDTO) throws Exception {
        Orders orders = orderMapper.getById(ordersCancelDTO.getId());
        if (orders != null) {
            // 商家取消订单，若是已支付订单，回补库存
            if (orders.getPayStatus().equals(Orders.PAID)) {
                rollbackStock(orders.getId());
            }

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
     * 指派骑手并进入配送中
     */
    public void assignRider(OrdersAssignRiderDTO ordersAssignRiderDTO) {
        Orders orders = orderMapper.getById(ordersAssignRiderDTO.getOrderId());
        if (orders == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        if (!Orders.CONFIRMED.equals(orders.getStatus()) && !Orders.TO_BE_CONFIRMED.equals(orders.getStatus())) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }
        orders.setRiderId(ordersAssignRiderDTO.getRiderId());
        orders.setRiderName(ordersAssignRiderDTO.getRiderName());
        orders.setRiderPhone(ordersAssignRiderDTO.getRiderPhone());
        orders.setStatus(Orders.DELIVERY_IN_PROGRESS);
        orderMapper.update(orders);
    }

    /**
     * 完成订单
     */
    public void complete(Long id) {
        Orders orders = orderMapper.getById(id);
        if (orders != null && (orders.getStatus().equals(Orders.DELIVERY_IN_PROGRESS)
                || ("PICKUP".equals(orders.getDeliveryType()) && orders.getStatus().equals(Orders.CONFIRMED)))) {
            orders.setStatus(Orders.COMPLETED);
            orders.setDeliveryTime(LocalDateTime.now());
            orders.setActualDeliveryTime(LocalDateTime.now());
            // 如果实际送达时间超过预计送达时间，则标记为超时状态 1，否则为 0
            if (orders.getEstimatedDeliveryTime() != null && orders.getActualDeliveryTime().isAfter(orders.getEstimatedDeliveryTime())) {
                orders.setOvertimeStatus(1);
            } else {
                orders.setOvertimeStatus(0);
            }
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

        // 校验催单归属权，防横向平行越权
        if (!orders.getUserId().equals(BaseContext.getCurrentId())) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }

        // 状态校验：只有已支付且处于 2待接单 3已接单 4派送中 状态的订单才能催单
        if (!orders.getPayStatus().equals(Orders.PAID) || orders.getStatus() < 2 || orders.getStatus() > 4) {
            throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
        }

        // Redis 限流防刷锁，TTL 60 秒
        String redisKey = "lgg:order:reminder:lock:" + id;
        Boolean success = redisTemplate.opsForValue().setIfAbsent(redisKey, "locked", 60, TimeUnit.SECONDS);
        if (success == null || !success) {
            throw new OrderBusinessException("催单过于频繁，请60秒后再试！");
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

    public String printReceipt(Long id) {
        OrderVO order = details(id);
        if (order == null) {
            throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
        }
        StringBuilder items = new StringBuilder();
        if (order.getOrderDetailList() != null) {
            for (OrderDetail detail : order.getOrderDetailList()) {
                items.append("<tr><td>")
                        .append(escape(detail.getName()))
                        .append("</td><td>x")
                        .append(detail.getNumber())
                        .append("</td><td>￥")
                        .append(detail.getAmount())
                        .append("</td></tr>");
            }
        }
        return "<!doctype html><html><head><meta charset=\"utf-8\"><title>订单小票</title>"
                + "<style>body{font-family:Arial,'Microsoft YaHei',sans-serif;width:280px;margin:0 auto;color:#111}"
                + "h1{font-size:20px;text-align:center;margin:16px 0 8px}.muted{color:#666;font-size:12px}"
                + "table{width:100%;border-collapse:collapse;font-size:13px}td{padding:4px 0;border-bottom:1px dashed #ddd}"
                + ".total{font-size:18px;font-weight:bold;text-align:right;margin-top:10px}.line{border-top:1px dashed #111;margin:10px 0}"
                + ".btn{position:fixed;right:16px;top:16px} @media print{.btn{display:none}body{width:58mm}}</style></head><body>"
                + "<button class=\"btn\" onclick=\"window.print()\">打印小票</button>"
                + "<h1>常工鲜生</h1><div class=\"muted\">订单号：" + escape(order.getNumber()) + "</div>"
                + "<div class=\"muted\">下单时间：" + order.getOrderTime() + "</div><div class=\"line\"></div>"
                + "<table>" + items + "</table>"
                + "<div class=\"total\">合计 ￥" + order.getAmount() + "</div><div class=\"line\"></div>"
                + "<div>配送方式：" + ("PICKUP".equals(order.getDeliveryType()) ? "到店自提" : "配送到家") + "</div>"
                + "<div>收货人：" + escape(order.getConsignee()) + " " + escape(order.getPhone()) + "</div>"
                + "<div>地址：" + escape(order.getAddress()) + "</div>"
                + "<div>骑手：" + escape(order.getRiderName()) + " " + escape(order.getRiderPhone()) + "</div>"
                + "<div class=\"muted\">请核对商品后出库，祝您生意兴隆。</div></body></html>";
    }

    public void exportOrders(HttpServletResponse response, OrdersPageQueryDTO ordersPageQueryDTO) {
        List<Orders> ordersList = orderMapper.pageQuery(ordersPageQueryDTO);
        StringBuilder builder = new StringBuilder("\uFEFF");
        builder.append("订单号,收货人,手机号,配送方式,骑手,金额,状态,下单时间\n");
        if (ordersList != null) {
            for (Orders order : ordersList) {
                builder.append(csv(order.getNumber())).append(',')
                        .append(csv(order.getConsignee())).append(',')
                        .append(csv(order.getPhone())).append(',')
                        .append(csv("PICKUP".equals(order.getDeliveryType()) ? "到店自提" : "配送到家")).append(',')
                        .append(csv(order.getRiderName())).append(',')
                        .append(order.getAmount()).append(',')
                        .append(csv(statusText(order.getStatus()))).append(',')
                        .append(csv(formatTime(order.getOrderTime()))).append('\n');
            }
        }
        try {
            String fileName = URLEncoder.encode("常工鲜生订单记录.xls", StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/vnd.ms-excel;charset=utf-8");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);
            response.getOutputStream().write(builder.toString().getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new RuntimeException("导出订单记录失败", e);
        }
    }

    private String statusText(Integer status) {
        if (Orders.PENDING_PAYMENT.equals(status)) return "待付款";
        if (Orders.TO_BE_CONFIRMED.equals(status)) return "待接单";
        if (Orders.CONFIRMED.equals(status)) return "已接单";
        if (Orders.DELIVERY_IN_PROGRESS.equals(status)) return "派送中";
        if (Orders.COMPLETED.equals(status)) return "已完成";
        if (Orders.CANCELLED.equals(status)) return "已取消";
        return "未知";
    }

    private String formatTime(LocalDateTime time) {
        return time == null ? "" : time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void rollbackStock(Long orderId) {
        Orders orders = orderMapper.getById(orderId);
        if (orders != null && orders.getPayStatus().equals(Orders.PAID) && (orders.getStockRollbackStatus() == null || orders.getStockRollbackStatus() == 0)) {
            List<OrderDetail> details = orderDetailMapper.getByOrderId(orderId);
            if (details != null) {
                for (OrderDetail detail : details) {
                    dishMapper.increaseStock(detail.getDishId(), detail.getNumber());
                }
            }
            // 标记库存已回补，确保幂等防御
            orders.setStockRollbackStatus(1);
            orderMapper.update(orders);
        }
    }
}
