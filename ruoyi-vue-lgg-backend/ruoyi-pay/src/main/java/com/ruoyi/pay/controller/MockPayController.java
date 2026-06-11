package com.ruoyi.pay.controller;

import com.ruoyi.pay.service.MockPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pay")
public class MockPayController {

    @Autowired
    private MockPayService mockPayService;

    @PostMapping("/mock")
    public Map<String, Object> pay(@RequestParam("orderNumber") String orderNumber) {
        mockPayService.pay(orderNumber);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("msg", "success");
        return result;
    }
}
