package com.ruoyi.business.config;

import com.ruoyi.business.interceptor.JwtTokenAdminInterceptor;
import com.ruoyi.business.interceptor.JwtTokenUserInterceptor;
import com.ruoyi.business.json.JacksonObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.List;
import java.util.ArrayList;
import java.nio.charset.StandardCharsets;

/**
 * 绿果果业务模块 Web MVC 拦截器配置
 */
@Configuration
@Slf4j
public class BusinessWebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private JwtTokenAdminInterceptor jwtTokenAdminInterceptor;

    @Autowired
    private JwtTokenUserInterceptor jwtTokenUserInterceptor;

    /**
     * 注册自定义拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("开始注册绿果果业务拦截器...");
        
        // 1. 后台管理员拦截器 (排除登录路径)
        registry.addInterceptor(jwtTokenAdminInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/employee/login");

        // 2. C端用户小程序拦截器 (排除登录、店铺状态、以及下载路径)
        registry.addInterceptor(jwtTokenUserInterceptor)
                .addPathPatterns("/user/**")
                .excludePathPatterns("/user/user/login")
                .excludePathPatterns("/user/shop/status")
                .excludePathPatterns("/user/common/download");
    }

    /**
     * 扩展Spring MVC框架的消息转化器
     */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        log.info("扩展绿果果业务消息转换器...");
        // 创建一个消息转换器对象
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        // 需要为消息转换器设置一个对象转换器，对象转换器可以将Java对象序列化为json数据
        converter.setObjectMapper(new JacksonObjectMapper());
        // 强行指定支持的媒体类型为 UTF-8 JSON，防止乱码
        List<MediaType> mediaTypes = new ArrayList<>();
        mediaTypes.add(new MediaType("application", "json", StandardCharsets.UTF_8));
        converter.setSupportedMediaTypes(mediaTypes);
        // 将自己的消息转化器加入容器中并置于最前
        converters.add(0, converter);
    }
}
