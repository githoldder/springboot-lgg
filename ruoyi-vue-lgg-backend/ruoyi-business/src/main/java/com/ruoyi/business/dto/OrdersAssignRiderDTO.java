package com.ruoyi.business.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class OrdersAssignRiderDTO implements Serializable {
    private Long orderId;
    private Long riderId;
    private String riderName;
    private String riderPhone;
}
