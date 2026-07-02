package com.ruoyi.business.mapper;

import com.github.pagehelper.Page;
import com.ruoyi.business.dto.GoodsSalesDTO;
import com.ruoyi.business.dto.OrdersPageQueryDTO;
import com.ruoyi.business.entity.Orders;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface OrderMapper {

    /**
     * 插入订单数据
     * @param orders
     */
    void insert(Orders orders);

    Orders getByNumberAndUserId(String orderNumber, Long userId);

    /**
     * 修改订单信息
     * @param orders
     */
    void update(Orders orders);

    /**
     * 分页条件查询并按下单时间排序
     * @param ordersPageQueryDTO
     */
    Page<Orders> pageQuery(OrdersPageQueryDTO ordersPageQueryDTO);

    Orders getById(Long id);

    Integer countStatus(Integer status);

    List<Orders> getByStatusAndOrderTimeLT(Integer status, LocalDateTime orderTime);

    /**
     * 根据动态条件统计营业额数据
     * @param map
     * @return
     */
    Double sumByMap(Map map);

    /**
     * 根据动态条件统计订单数量
     * @param map
     * @return
     */
    Integer countByMap(Map map);

    /**
     * 统计指定时间区间内的销量排名前10
     * @param begin
     * @param end
     * @return
     */
    List<GoodsSalesDTO> getSalesTop10(LocalDateTime begin,LocalDateTime end);

    /**
     * 定时任务乐观锁条件更新订单状态
     */
    int updateStatusWithLock(@org.apache.ibatis.annotations.Param("id") Long id, 
                             @org.apache.ibatis.annotations.Param("fromStatus") Integer fromStatus, 
                             @org.apache.ibatis.annotations.Param("toStatus") Integer toStatus, 
                             @org.apache.ibatis.annotations.Param("cancelReason") String cancelReason, 
                             @org.apache.ibatis.annotations.Param("cancelTime") LocalDateTime cancelTime);

    /**
     * 根据订单号精确查询订单，用于支付回调，杜绝 LIKE 模糊匹配碰撞
     */
    @Select("select * from lgg_orders where number = #{number}")
    Orders getByNumber(@org.apache.ibatis.annotations.Param("number") String number);

    /**
     * 原子锁将订单的库存回滚状态由 fromStatus 修改为 toStatus，提供数据库行锁级并发防护
     */
    int updateStockRollbackStatusWithLock(@org.apache.ibatis.annotations.Param("id") Long id,
                                          @org.apache.ibatis.annotations.Param("fromStatus") Integer fromStatus,
                                          @org.apache.ibatis.annotations.Param("toStatus") Integer toStatus);
}
