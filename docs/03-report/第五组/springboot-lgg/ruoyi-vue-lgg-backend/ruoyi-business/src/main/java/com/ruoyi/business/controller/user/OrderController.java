package com.ruoyi.business.controller.user;

import com.ruoyi.business.dto.OrdersPaymentDTO;
import com.ruoyi.business.dto.OrdersSubmitDTO;
import com.ruoyi.business.result.PageResult;
import com.ruoyi.business.result.Result;
import com.ruoyi.business.service.OrderService;
import com.ruoyi.business.vo.OrderPaymentVO;
import com.ruoyi.business.vo.OrderSubmitVO;
import com.ruoyi.business.vo.OrderVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController("userOrderController")
@RequestMapping("/user/order")
@Api(tags = "用户端订单相关接口")
@Slf4j
public class OrderController {
    @Autowired
    private OrderService orderService;
    /**
     * 用户下单
     * @param ordersSubmitDTO
     * @return
     */
    @PostMapping("/submit")
    @ApiOperation("用户下单")
    public Result<OrderSubmitVO> submit(@RequestBody OrdersSubmitDTO ordersSubmitDTO){
        log.info("用户下单,参数为:{}",ordersSubmitDTO);
        OrderSubmitVO ordersSubmitVO= orderService.submitOrder(ordersSubmitDTO);
        return Result.success(ordersSubmitVO);
    }
    /**
     * 订单支付
     * @param ordersPaymentDTO
     * @return
     */
    @PutMapping("/payment")
    @ApiOperation("订单支付")
    public Result<OrderPaymentVO> payment(@RequestBody OrdersPaymentDTO ordersPaymentDTO) throws Exception {
        log.info("订单支付：{}", ordersPaymentDTO);
        OrderPaymentVO orderPaymentVO = orderService.payment(ordersPaymentDTO);
        log.info("生成预支付交易单：{}", orderPaymentVO);

        return Result.success(orderPaymentVO);
    }

    /**
     * 支付结果确认
     */
    @PutMapping("/payment/confirm")
    @ApiOperation("支付结果确认")
    public Result<OrderVO> confirmPayment(@RequestBody(required = false) OrdersPaymentDTO ordersPaymentDTO, String orderNumber) {
        if (ordersPaymentDTO == null) {
            ordersPaymentDTO = new OrdersPaymentDTO();
            ordersPaymentDTO.setOrderNumber(orderNumber);
        }
        log.info("确认支付结果：{}", ordersPaymentDTO);
        OrderVO orderVO = orderService.confirmPayment(ordersPaymentDTO.getOrderNumber());
        return Result.success(orderVO);
    }
    /**
     * 历史订单查询
     *
     * @param page
     * @param pageSize
     * @param status   订单状态 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消
     * @return
     */
    @GetMapping("/historyOrders")
    @ApiOperation("历史订单查询")
    public Result<PageResult> page(int page, int pageSize, Integer status) {
        PageResult pageResult = orderService.pageQuery4User(page, pageSize, status);
        return Result.success(pageResult);
    }
    /**
     * 查询订单详情
     *
     * @param id
     * @return
     */
    @GetMapping("/orderDetail/{id}")
    @ApiOperation("查询订单详情")
    public Result<OrderVO> details(@PathVariable("id") Long id) {
        OrderVO orderVO = orderService.details(id);
        return Result.success(orderVO);
    }
    /**
     * 用户取消订单
     *
     * @return
     */
    @PutMapping("/cancel/{id}")
    @ApiOperation("取消订单")
    public Result cancel(@PathVariable("id") Long id) throws Exception {
        orderService.userCancelById(id);
        return Result.success();
    }
    /**
     * 再来一单
     *
     * @param id
     * @return
     */
    @PostMapping("/repetition/{id}")
    @ApiOperation("再来一单")
    public Result repetition(@PathVariable Long id) {
        orderService.repetition(id);
        return Result.success();
    }

    /**
     * 客户催单
     * @param id
     * @return
     */
    @GetMapping("/reminder/{id}")
    @ApiOperation("客户催单")
    public Result reminder(@PathVariable("id") Long id){
        orderService.reminder(id);
        return Result.success();
    }
}
