package com.ruoyi.business.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class ShoppingCartDTO implements Serializable {

    private Long dishId;
    private Long setmealId;
    private String dishFlavor;
    private Integer number;
    private java.math.BigDecimal amount;
    private String name;
    private String image;

}
