package com.ruoyi.business.task;

import com.ruoyi.business.entity.Orders;
import com.ruoyi.business.mapper.OrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时任务类，定时处理订单状态
 */
@Component
@Slf4j
public class OrderTask {

    @Autowired
    private OrderMapper orderMapper;

    /**
     * 处理超时订单的方法
     */
    @Scheduled(cron = "0 * * * * ? ") //每分钟触发一次
    public void processTimeoutOrder(){
        log.info("定时处理超时订单：{}", LocalDateTime.now());

        LocalDateTime time = LocalDateTime.now().plusMinutes(-15);

        // select * from lgg_orders where status = ? and order_time < (当前时间 - 15分钟)
        List<Orders> ordersList = orderMapper.getByStatusAndOrderTimeLT(Orders.PENDING_PAYMENT, time);

        if(ordersList != null && ordersList.size() > 0){
            for (Orders orders : ordersList) {
                int rows = orderMapper.updateStatusWithLock(
                    orders.getId(), 
                    Orders.PENDING_PAYMENT, 
                    Orders.CANCELLED, 
                    "订单超时，自动取消", 
                    LocalDateTime.now()
                );
                if (rows == 1) {
                    log.info("超时未支付订单自动关单成功，订单ID：{}", orders.getId());
                }
            }
        }
    }

    /**
     * 定时处理派送超时订单预警，配送超过 24 小时只记录警告日志，不再强行流转为已完成
     */
    @Scheduled(cron = "0 0 1 * * ?") //每天凌晨1点触发一次
    public void processDeliveryOrder(){
        log.info("定时扫描配送中的超时订单：{}", LocalDateTime.now());

        // 基于进入派送中的时间超过 24 小时（1440 分钟）进行超时预警过滤
        LocalDateTime time = LocalDateTime.now().plusMinutes(-1440);

        List<Orders> ordersList = orderMapper.getDeliveryTimeoutOrders(time);

        if(ordersList != null && ordersList.size() > 0){
            for (Orders orders : ordersList) {
                log.warn("发现配送超时的订单，已持续处于派送中状态超过24小时，进行预警！订单ID：{}，订单号：{}", 
                         orders.getId(), orders.getNumber());
            }
        }
    }
}
