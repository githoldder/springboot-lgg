package com.ruoyi.notice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "pay.exchange";
    public static final String QUEUE_NAME = "pay.success.queue";
    public static final String ROUTING_KEY = "pay.success";

    @Bean
    public TopicExchange payExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue paySuccessQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public Binding paySuccessBinding(Queue paySuccessQueue, TopicExchange payExchange) {
        return BindingBuilder.bind(paySuccessQueue).to(payExchange).with(ROUTING_KEY);
    }
}
