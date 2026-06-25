package com.ruoyi.business.controller.admin;

import com.ruoyi.business.entity.ShoppingCart;
import com.ruoyi.business.mapper.ShoppingCartMapper;
import com.ruoyi.business.result.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 管理端购物车看板
 */
@RestController
@RequestMapping("/admin/shoppingCart")
@Api(tags = "管理端购物车相关接口")
@Slf4j
public class AdminShoppingCartController {

    @Autowired
    private ShoppingCartMapper shoppingCartMapper;

    @GetMapping("/list")
    @ApiOperation("查看全部购物车")
    public Result<List<ShoppingCart>> list() {
        log.info("管理端查看全部购物车");
        return Result.success(shoppingCartMapper.list(new ShoppingCart()));
    }
}
