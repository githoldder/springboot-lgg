package com.ruoyi.pay.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "lgg-business")
public interface OrderServiceClient {

    @RequestMapping("/notify/mockPaySuccess")
    void mockPaySuccess(@RequestParam("orderNumber") String orderNumber);
}
