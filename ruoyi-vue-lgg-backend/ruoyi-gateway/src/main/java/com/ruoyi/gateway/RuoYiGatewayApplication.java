package com.ruoyi.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class RuoYiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiGatewayApplication.class, args);
    }
}
