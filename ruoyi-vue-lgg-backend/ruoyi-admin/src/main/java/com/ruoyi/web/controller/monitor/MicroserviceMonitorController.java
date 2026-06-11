package com.ruoyi.web.controller.monitor;

import com.ruoyi.common.core.domain.AjaxResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 常工鲜生微服务健康监控。
 */
@RestController
@RequestMapping("/monitor/microservices")
public class MicroserviceMonitorController {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(1200))
            .build();

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @PreAuthorize("@ss.hasPermi('monitor:microservices:list')")
    @GetMapping("/status")
    public AjaxResult status() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("checkedAt", LocalDateTime.now());
        data.put("services", checkServices());
        data.put("dependencies", checkDependencies());
        data.put("routeTests", checkRoutes());
        return AjaxResult.success(data);
    }

    private List<Map<String, Object>> checkServices() {
        List<Map<String, Object>> services = new ArrayList<>();
        services.add(checkHttp("lgg-admin", "RuoYi 管理服务", "http://127.0.0.1:8081/actuator/health"));
        services.add(checkHttp("lgg-gateway", "Spring Cloud Gateway", "http://127.0.0.1:8090/actuator/health"));
        services.add(checkHttp("lgg-business", "水果业务服务", "http://127.0.0.1:8088/actuator/health"));
        services.add(checkHttp("lgg-pay", "模拟支付服务", "http://127.0.0.1:8085/actuator/health"));
        services.add(checkHttp("lgg-notice", "消息通知服务", "http://127.0.0.1:8086/actuator/health"));
        return services;
    }

    private List<Map<String, Object>> checkDependencies() {
        List<Map<String, Object>> dependencies = new ArrayList<>();
        dependencies.add(checkRedis());
        dependencies.add(checkTcp("rabbitmq", "RabbitMQ 消息队列", "127.0.0.1", 5672));
        dependencies.add(checkHttp("nacos", "Nacos 注册中心", "http://127.0.0.1:8848/nacos/v1/ns/service/list?pageNo=1&pageSize=20"));
        return dependencies;
    }

    private List<Map<String, Object>> checkRoutes() {
        List<Map<String, Object>> routes = new ArrayList<>();
        routes.add(checkHttp("gateway-shop-status", "网关到业务服务", "http://127.0.0.1:8090/user/shop/status"));
        routes.add(checkHttp("business-shop-status", "业务服务直连", "http://127.0.0.1:8088/user/shop/status"));
        return routes;
    }

    private Map<String, Object> checkHttp(String name, String label, String url) {
        long start = System.currentTimeMillis();
        Map<String, Object> item = baseItem(name, label, url);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMillis(1800))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            item.put("httpStatus", response.statusCode());
            item.put("healthy", response.statusCode() >= 200 && response.statusCode() < 500);
            item.put("message", shrink(response.body()));
        } catch (Exception ex) {
            item.put("healthy", false);
            item.put("message", ex.getClass().getSimpleName() + ": " + ex.getMessage());
        }
        item.put("latencyMs", System.currentTimeMillis() - start);
        return item;
    }

    private Map<String, Object> checkRedis() {
        long start = System.currentTimeMillis();
        Map<String, Object> item = baseItem("redis", "Redis 缓存", "redis://127.0.0.1:6379/0");
        try {
            String pong = stringRedisTemplate.getConnectionFactory().getConnection().ping();
            item.put("healthy", "PONG".equalsIgnoreCase(pong));
            item.put("message", pong);
        } catch (Exception ex) {
            item.put("healthy", false);
            item.put("message", ex.getClass().getSimpleName() + ": " + ex.getMessage());
        }
        item.put("latencyMs", System.currentTimeMillis() - start);
        return item;
    }

    private Map<String, Object> checkTcp(String name, String label, String host, int port) {
        long start = System.currentTimeMillis();
        Map<String, Object> item = baseItem(name, label, host + ":" + port);
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 1200);
            item.put("healthy", true);
            item.put("message", "TCP connected");
        } catch (IOException ex) {
            item.put("healthy", false);
            item.put("message", ex.getClass().getSimpleName() + ": " + ex.getMessage());
        }
        item.put("latencyMs", System.currentTimeMillis() - start);
        return item;
    }

    private Map<String, Object> baseItem(String name, String label, String endpoint) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("label", label);
        item.put("endpoint", endpoint);
        item.put("healthy", false);
        item.put("message", "");
        item.put("latencyMs", 0);
        return item;
    }

    private String shrink(String body) {
        if (body == null) {
            return "";
        }
        String compact = body.replaceAll("\\s+", " ").trim();
        return compact.length() > 180 ? compact.substring(0, 180) + "..." : compact;
    }
}
