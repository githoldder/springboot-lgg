package com.ruoyi.notice.consumer;

import com.alibaba.fastjson2.JSON;
import com.ruoyi.notice.websocket.WebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaySuccessConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaySuccessConsumer.class);

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "pay.success.queue", durable = "true"),
            exchange = @Exchange(value = "pay.exchange", type = "topic"),
            key = "pay.success"
    ))
    public void consumePaySuccess(String orderNumber) {
        log.info("Consumed payment success message from queue for orderNumber: {}", orderNumber);

        Map<String, Object> map = new HashMap<>();
        map.put("type", 1);
        map.put("orderId", null);
        map.put("content", "您有新的常工鲜生订单，请及时包装！订单号：" + orderNumber);

        String json = JSON.toJSONString(map);
        log.info("Broadcasting payment alert via WebSocket: {}", json);
        WebSocketServer.sendToAllClients(json);
    }
}
