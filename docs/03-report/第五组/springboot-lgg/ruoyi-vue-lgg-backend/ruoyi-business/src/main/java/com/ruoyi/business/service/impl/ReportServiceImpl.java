package com.ruoyi.business.service.impl;

import com.ruoyi.business.dto.GoodsSalesDTO;
import com.ruoyi.business.entity.Orders;
import com.ruoyi.business.mapper.OrderMapper;
import com.ruoyi.business.mapper.UserMapper;
import com.ruoyi.business.service.ReportService;
import com.ruoyi.business.vo.OrderReportVO;
import com.ruoyi.business.vo.SalesTop10ReportVO;
import com.ruoyi.business.vo.TurnoverReportVO;
import com.ruoyi.business.vo.UserReportVO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 常工鲜生运营数据统计分析层实现
 */
@Service
@Slf4j
public class ReportServiceImpl implements ReportService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 营业额统计
     */
    public TurnoverReportVO getTurnoverStatistics(LocalDate begin, LocalDate end) {
        List<LocalDate> dateList = new ArrayList<>();
        LocalDate temp = begin;
        while (!temp.isAfter(end)) {
            dateList.add(temp);
            temp = temp.plusDays(1);
        }

        List<Double> turnoverList = new ArrayList<>();
        for (LocalDate date : dateList) {
            LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);
            
            Map<String, Object> map = new HashMap<>();
            map.put("begin", beginTime);
            map.put("end", endTime);
            map.put("status", Orders.COMPLETED); // 仅统计已完成订单金额
            
            Double turnover = orderMapper.sumByMap(map);
            turnoverList.add(turnover == null ? 0.0 : turnover);
        }

        return TurnoverReportVO.builder()
                .dateList(StringUtils.join(dateList, ","))
                .turnoverList(StringUtils.join(turnoverList, ","))
                .build();
    }

    /**
     * 用户统计
     */
    public UserReportVO getUserStatistics(LocalDate begin, LocalDate end) {
        List<LocalDate> dateList = new ArrayList<>();
        LocalDate temp = begin;
        while (!temp.isAfter(end)) {
            dateList.add(temp);
            temp = temp.plusDays(1);
        }

        List<Integer> newUserList = new ArrayList<>();
        List<Integer> totalUserList = new ArrayList<>();

        for (LocalDate date : dateList) {
            LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);

            Map<String, Object> map = new HashMap<>();
            map.put("end", endTime);
            Integer totalUser = userMapper.countByMap(map);
            totalUserList.add(totalUser == null ? 0 : totalUser);

            map.put("begin", beginTime);
            Integer newUser = userMapper.countByMap(map);
            newUserList.add(newUser == null ? 0 : newUser);
        }

        return UserReportVO.builder()
                .dateList(StringUtils.join(dateList, ","))
                .newUserList(StringUtils.join(newUserList, ","))
                .totalUserList(StringUtils.join(totalUserList, ","))
                .build();
    }

    /**
     * 订单数据统计
     */
    public OrderReportVO getOrderStatistics(LocalDate begin, LocalDate end) {
        List<LocalDate> dateList = new ArrayList<>();
        LocalDate temp = begin;
        while (!temp.isAfter(end)) {
            dateList.add(temp);
            temp = temp.plusDays(1);
        }

        List<Integer> orderCountList = new ArrayList<>();
        List<Integer> validOrderCountList = new ArrayList<>();

        for (LocalDate date : dateList) {
            LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);

            Map<String, Object> map = new HashMap<>();
            map.put("begin", beginTime);
            map.put("end", endTime);
            
            // 每日订单总数
            Integer orderCount = orderMapper.countByMap(map);
            orderCountList.add(orderCount == null ? 0 : orderCount);

            // 每日有效订单数
            map.put("status", Orders.COMPLETED);
            Integer validOrderCount = orderMapper.countByMap(map);
            validOrderCountList.add(validOrderCount == null ? 0 : validOrderCount);
        }

        // 计算订单总数、有效订单数及订单完成率
        int totalOrders = orderCountList.stream().mapToInt(Integer::intValue).sum();
        int validOrders = validOrderCountList.stream().mapToInt(Integer::intValue).sum();
        double orderCompletionRate = totalOrders == 0 ? 0.0 : (double) validOrders / totalOrders;

        return OrderReportVO.builder()
                .dateList(StringUtils.join(dateList, ","))
                .orderCountList(StringUtils.join(orderCountList, ","))
                .validOrderCountList(StringUtils.join(validOrderCountList, ","))
                .totalOrderCount(totalOrders)
                .validOrderCount(validOrders)
                .orderCompletionRate(orderCompletionRate)
                .build();
    }

    /**
     * 销量排名前 10 的商品统计
     */
    public SalesTop10ReportVO getSalesTop10(LocalDate begin, LocalDate end) {
        LocalDateTime beginTime = LocalDateTime.of(begin, LocalTime.MIN);
        LocalDateTime endTime = LocalDateTime.of(end, LocalTime.MAX);

        List<GoodsSalesDTO> salesTop10 = orderMapper.getSalesTop10(beginTime, endTime);
        
        List<String> nameList = salesTop10.stream().map(GoodsSalesDTO::getName).collect(Collectors.toList());
        List<Integer> numberList = salesTop10.stream().map(GoodsSalesDTO::getNumber).collect(Collectors.toList());

        return SalesTop10ReportVO.builder()
                .nameList(StringUtils.join(nameList, ","))
                .numberList(StringUtils.join(numberList, ","))
                .build();
    }

    public void exportBusinessData(HttpServletResponse response) {
        log.info("开始准备导出常工鲜生生鲜零售运营数据...");
        try {
            LocalDate end = LocalDate.now();
            LocalDate begin = end.minusDays(6);
            TurnoverReportVO turnoverReportVO = getTurnoverStatistics(begin, end);
            OrderReportVO orderReportVO = getOrderStatistics(begin, end);
            SalesTop10ReportVO salesTop10ReportVO = getSalesTop10(begin, end);

            StringBuilder builder = new StringBuilder();
            builder.append("常工鲜生运营数据报表\n");
            builder.append("统计周期,").append(begin).append(" 至 ").append(end).append("\n\n");
            builder.append("日期,营业额,订单总数,有效订单数\n");

            String[] dates = turnoverReportVO.getDateList().split(",");
            String[] turnovers = turnoverReportVO.getTurnoverList().split(",");
            String[] orderCounts = orderReportVO.getOrderCountList().split(",");
            String[] validOrderCounts = orderReportVO.getValidOrderCountList().split(",");
            for (int i = 0; i < dates.length; i++) {
                builder.append(dates[i]).append(",")
                        .append(valueAt(turnovers, i)).append(",")
                        .append(valueAt(orderCounts, i)).append(",")
                        .append(valueAt(validOrderCounts, i)).append("\n");
            }

            builder.append("\n汇总指标,数值\n");
            builder.append("订单总数,").append(orderReportVO.getTotalOrderCount()).append("\n");
            builder.append("有效订单数,").append(orderReportVO.getValidOrderCount()).append("\n");
            builder.append("订单完成率,").append(orderReportVO.getOrderCompletionRate()).append("\n\n");

            builder.append("热销商品,销量\n");
            String[] names = salesTop10ReportVO.getNameList().split(",");
            String[] numbers = salesTop10ReportVO.getNumberList().split(",");
            for (int i = 0; i < names.length; i++) {
                if (names[i].isBlank()) {
                    continue;
                }
                builder.append(names[i]).append(",").append(valueAt(numbers, i)).append("\n");
            }

            response.setStatus(200);
            response.setContentType("application/vnd.ms-excel;charset=utf-8");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-disposition", "attachment;filename=CGFreshBusinessReport.xls");
            response.getOutputStream().write(0xEF);
            response.getOutputStream().write(0xBB);
            response.getOutputStream().write(0xBF);
            response.getOutputStream().write(builder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            response.flushBuffer();
        } catch (Exception e) {
            log.error("报表导出异常", e);
        }
    }

    private String valueAt(String[] values, int index) {
        return index < values.length ? values[index] : "0";
    }
}
