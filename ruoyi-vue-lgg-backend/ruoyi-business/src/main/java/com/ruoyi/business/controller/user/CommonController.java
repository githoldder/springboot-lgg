package com.ruoyi.business.controller.user;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController("userCommonController")
@RequestMapping("/user/common")
@Api(tags = "C端通用接口")
@Slf4j
public class CommonController {

    @GetMapping("/download")
    @ApiOperation("图片下载")
    public void download(@RequestParam String name, HttpServletResponse response) throws IOException {
        log.info("图片下载：{}", name);
        
        // 如果 name 是完整 URL，提取文件名
        String fileName = name;
        if (name.contains("/")) {
            fileName = name.substring(name.lastIndexOf("/") + 1);
        }
        
        response.sendRedirect("/images/" + fileName);
    }
}
