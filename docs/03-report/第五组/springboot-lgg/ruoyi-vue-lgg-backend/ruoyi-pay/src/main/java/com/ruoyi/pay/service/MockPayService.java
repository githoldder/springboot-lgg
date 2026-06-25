package com.ruoyi.pay.service;

import com.ruoyi.pay.config.RabbitConfig;
import com.ruoyi.pay.feign.OrderServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MockPayService {

    private static final Logger log = LoggerFactory.getLogger(MockPayService.class);

    @Autowired
    private OrderServiceClient orderServiceClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void pay(String orderNumber) {
        log.info("Processing mock payment for order: {}", orderNumber);

        // 1. Feign call to update order status in business module
        orderServiceClient.mockPaySuccess(orderNumber);
        log.info("Order status updated successfully via Feign for order: {}", orderNumber);

        // 2. Publish event to RabbitMQ
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY, orderNumber);
        log.info("Payment success event published to RabbitMQ for order: {}", orderNumber);
    }
}
