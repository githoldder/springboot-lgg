package com.ruoyi.pay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
    org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration.class
})
public class RuoYiPayApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiPayApplication.class, args);
    }
}
