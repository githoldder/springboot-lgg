package com.ruoyi.business;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}, excludeName = {"com.alibaba.cloud.nacos.endpoint.NacosDiscoveryEndpointAutoConfiguration"}, scanBasePackages = {"com.ruoyi"})
public class RuoYiBusinessApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiBusinessApplication.class, args);
    }
}
