package com.ruoyi.business.mapper;

import com.ruoyi.business.entity.OrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OrderDetailMapper {
    /**
     * 批量插入订单明细数据
     * @param orderDetailList
     */
    void insertBatch(List<OrderDetail> orderDetailList);

    /**
     * 根据订单id查询订单明细
     * @param orderId
     * @return
     */
    @Select("select id, name, image, order_id, fruit_id as dish_id, fruit_box_id as setmeal_id, fruit_flavor, number, amount from lgg_order_detail where order_id = #{orderId}")
    List<OrderDetail> getByOrderId(Long orderId);
}
