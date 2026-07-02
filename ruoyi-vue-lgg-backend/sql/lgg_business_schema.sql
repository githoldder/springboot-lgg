USE `lgg_ruoyi`;

-- 1. 地址簿
DROP TABLE IF EXISTS `lgg_address_book`;
CREATE TABLE `lgg_address_book` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint NOT NULL COMMENT '用户id',
  `consignee` varchar(100) DEFAULT NULL COMMENT '收货人',
  `sex` varchar(10) DEFAULT NULL COMMENT '性别',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `province_code` varchar(20) DEFAULT NULL COMMENT '省级区划编号',
  `province_name` varchar(100) DEFAULT NULL COMMENT '省级名称',
  `city_code` varchar(20) DEFAULT NULL COMMENT '市级区划编号',
  `city_name` varchar(100) DEFAULT NULL COMMENT '市级名称',
  `district_code` varchar(20) DEFAULT NULL COMMENT '区级区划编号',
  `district_name` varchar(100) DEFAULT NULL COMMENT '区级名称',
  `detail` varchar(500) DEFAULT NULL COMMENT '详细地址',
  `label` varchar(100) DEFAULT NULL COMMENT '标签',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '默认 0 否 1是',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地址簿';

-- 2. 水果/果篮分类表
DROP TABLE IF EXISTS `lgg_category`;
CREATE TABLE `lgg_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` int DEFAULT NULL COMMENT '类型 1 水果单品分类 2 果篮套餐分类',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `sort` int NOT NULL DEFAULT '0' COMMENT '顺序',
  `status` int DEFAULT NULL COMMENT '分类状态 0:禁用，1:启用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `create_user` bigint DEFAULT NULL COMMENT '创建人',
  `update_user` bigint DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水果及果篮分类';

INSERT INTO `lgg_category` VALUES (10, 1, '新鲜水果', 1, 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_category` VALUES (11, 1, '精选果切', 2, 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_category` VALUES (12, 2, '精选果篮', 3, 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_category` VALUES (13, 1, '果汁饮品', 4, 1, NOW(), NOW(), 1, 1);

-- 3. 水果商品表 (原菜品表)
DROP TABLE IF EXISTS `lgg_fruit`;
CREATE TABLE `lgg_fruit` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) NOT NULL COMMENT '水果名称',
  `category_id` bigint NOT NULL COMMENT '分类id',
  `price` decimal(10,2) DEFAULT NULL COMMENT '单价',
  `image` varchar(500) DEFAULT NULL COMMENT '图片',
  `description` varchar(500) DEFAULT NULL COMMENT '描述信息',
  `status` int DEFAULT '1' COMMENT '0 停售 1 起售',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `create_user` bigint DEFAULT NULL COMMENT '创建人',
  `update_user` bigint DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_fruit_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水果商品表';

INSERT INTO `lgg_fruit` VALUES (101, '阿克苏苹果(500g)', 10, 8.80, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/apple.png', '香甜爽脆，果肉饱满', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (102, '泰国金枕榴莲(2.5kg)', 10, 158.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/durian.png', '果肉丰满，浓郁香甜', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (103, '精品红颜草莓(250g)', 10, 18.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/strawberry.png', '色泽红润，鲜甜多汁', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (104, '海南贵妃芒果(500g)', 10, 12.50, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/mango.png', '皮薄核小，肉质细腻', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (105, '智利进口车厘子(500g)', 10, 49.90, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/cherry.png', '脆甜多汁，饱满圆润', 1, NOW(), NOW(), 1, 1);

INSERT INTO `lgg_fruit` VALUES (111, '鲜切西瓜拼盘(300g)', 11, 9.90, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/watermelon_cut.png', '冰爽多汁，夏季首选', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (112, '鲜切哈密瓜拼盘(300g)', 11, 12.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/melon_cut.png', '蜜甜爽口，脆嫩多汁', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (113, '缤纷家庭分享果切(600g)', 11, 25.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/mixed_cut.png', '多种水果组合，营养丰富', 1, NOW(), NOW(), 1, 1);

INSERT INTO `lgg_fruit` VALUES (131, '鲜榨橙汁(350ml)', 13, 12.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/orange_juice.png', '100%纯鲜榨，无添加', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (132, '鲜榨椰子汁(350ml)', 13, 15.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/coconut_juice.png', '甘甜清爽，解暑神器', 1, NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit` VALUES (133, '冰爽西瓜汁(350ml)', 13, 10.00, 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/watermelon_juice.png', '现榨西瓜汁，清爽甜蜜', 1, NOW(), NOW(), 1, 1);

-- 4. 水果规格口感属性表 (原口味表)
DROP TABLE IF EXISTS `lgg_fruit_flavor`;
CREATE TABLE `lgg_fruit_flavor` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `fruit_id` bigint NOT NULL COMMENT '水果id',
  `name` varchar(100) DEFAULT NULL COMMENT '属性名称',
  `value` varchar(500) DEFAULT NULL COMMENT '属性数据list',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水果属性关系表';

INSERT INTO `lgg_fruit_flavor` VALUES (1, 101, '规格', '["精装","简装"]');
INSERT INTO `lgg_fruit_flavor` VALUES (2, 102, '熟度', '["即食","放2天熟"]');
INSERT INTO `lgg_fruit_flavor` VALUES (3, 111, '冰度', '["常温","冰镇"]');
INSERT INTO `lgg_fruit_flavor` VALUES (4, 131, '加冰', '["去冰","正常冰"]');
INSERT INTO `lgg_fruit_flavor` VALUES (5, 131, '甜度', '["原味","加蜂蜜"]');

-- 5. 果篮套餐表
DROP TABLE IF EXISTS `lgg_fruit_box`;
CREATE TABLE `lgg_fruit_box` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `category_id` bigint NOT NULL COMMENT '分类id',
  `name` varchar(100) NOT NULL COMMENT '果篮名称',
  `price` decimal(10,2) NOT NULL COMMENT '果篮价格',
  `status` int DEFAULT '1' COMMENT '售卖状态 0:停售 1:起售',
  `description` varchar(500) DEFAULT NULL COMMENT '描述信息',
  `image` varchar(500) DEFAULT NULL COMMENT '图片',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `create_user` bigint DEFAULT NULL COMMENT '创建人',
  `update_user` bigint DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_fruit_box_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='精选果篮表';

INSERT INTO `lgg_fruit_box` VALUES (201, 12, '元气满满单人果切果汁餐', 19.90, 1, '一盒鲜切西瓜 + 一瓶鲜榨橙汁，超值组合', 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/single_set.png', NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit_box` VALUES (202, 12, '温馨家庭幸福果篮', 88.00, 1, '阿克苏苹果*4 + 贵妃芒果*2 + 红颜草莓一盒 + 车厘子一盒', 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/family_basket.png', NOW(), NOW(), 1, 1);
INSERT INTO `lgg_fruit_box` VALUES (203, 12, '尊贵商务送礼果篮', 168.00, 1, '泰国金枕榴莲*1 + 智利车厘子一盒 + 贵妃芒果*4，高端精美礼盒包装', 'https://sky-itcast.oss-cn-beijing.aliyuncs.com/business_basket.png', NOW(), NOW(), 1, 1);

-- 6. 果篮内含水果关联表
DROP TABLE IF EXISTS `lgg_fruit_box_item`;
CREATE TABLE `lgg_fruit_box_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `fruit_box_id` bigint DEFAULT NULL COMMENT '果篮id',
  `fruit_id` bigint DEFAULT NULL COMMENT '水果id',
  `name` varchar(100) DEFAULT NULL COMMENT '水果名称（冗余字段）',
  `price` decimal(10,2) DEFAULT NULL COMMENT '水果单价（冗余字段）',
  `copies` int DEFAULT NULL COMMENT '水果份数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='果篮商品关系表';

INSERT INTO `lgg_fruit_box_item` VALUES (1, 201, 111, '鲜切西瓜拼盘(300g)', 9.90, 1);
INSERT INTO `lgg_fruit_box_item` VALUES (2, 201, 131, '鲜榨橙汁(350ml)', 12.00, 1);

INSERT INTO `lgg_fruit_box_item` VALUES (3, 202, 101, '阿克苏苹果(500g)', 8.80, 2);
INSERT INTO `lgg_fruit_box_item` VALUES (4, 202, 103, '精品红颜草莓(250g)', 18.00, 1);
INSERT INTO `lgg_fruit_box_item` VALUES (5, 202, 104, '海南贵妃芒果(500g)', 12.50, 1);
INSERT INTO `lgg_fruit_box_item` VALUES (6, 202, 105, '智利进口车厘子(500g)', 49.90, 1);

INSERT INTO `lgg_fruit_box_item` VALUES (7, 203, 102, '泰国金枕榴莲(约2.5kg)', 158.00, 1);
INSERT INTO `lgg_fruit_box_item` VALUES (8, 203, 105, '智利进口车厘子(500g)', 49.90, 1);
INSERT INTO `lgg_fruit_box_item` VALUES (9, 203, 104, '海南贵妃芒果(500g)', 12.50, 2);

-- 7. 购物车表
DROP TABLE IF EXISTS `lgg_shopping_cart`;
CREATE TABLE `lgg_shopping_cart` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) DEFAULT NULL COMMENT '商品名称',
  `image` varchar(500) DEFAULT NULL COMMENT '图片',
  `user_id` bigint NOT NULL COMMENT 'C端用户ID',
  `fruit_id` bigint DEFAULT NULL COMMENT '水果id',
  `fruit_box_id` bigint DEFAULT NULL COMMENT '果篮id',
  `fruit_flavor` varchar(255) DEFAULT NULL COMMENT '属性规格',
  `number` int NOT NULL DEFAULT '1' COMMENT '数量',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- 8. 订单主表
DROP TABLE IF EXISTS `lgg_orders`;
CREATE TABLE `lgg_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `number` varchar(100) DEFAULT NULL COMMENT '订单号',
  `status` int NOT NULL DEFAULT '1' COMMENT '订单状态 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消 7退款',
  `user_id` bigint NOT NULL COMMENT '下单用户',
  `address_book_id` bigint NOT NULL COMMENT '地址id',
  `order_time` datetime NOT NULL COMMENT '下单时间',
  `checkout_time` datetime DEFAULT NULL COMMENT '结账时间',
  `pay_method` int NOT NULL DEFAULT '1' COMMENT '支付方式 1微信,2支付宝',
  `pay_status` tinyint NOT NULL DEFAULT '0' COMMENT '支付状态 0未支付 1已支付 2退款',
  `amount` decimal(10,2) NOT NULL COMMENT '实收金额',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `address` varchar(500) DEFAULT NULL COMMENT '地址',
  `user_name` varchar(100) DEFAULT NULL COMMENT '用户名称',
  `consignee` varchar(100) DEFAULT NULL COMMENT '收货人',
  `cancel_reason` varchar(255) DEFAULT NULL COMMENT '订单取消原因',
  `rejection_reason` varchar(255) DEFAULT NULL COMMENT '订单拒绝原因',
  `cancel_time` datetime DEFAULT NULL COMMENT '订单取消时间',
  `estimated_delivery_time` datetime DEFAULT NULL COMMENT '预计送达时间',
  `delivery_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '配送状态 1立即送出 0选择具体时间',
  `delivery_time` datetime DEFAULT NULL COMMENT '送达时间',
  `pack_amount` int DEFAULT NULL COMMENT '包装费',
  `tableware_number` int DEFAULT NULL COMMENT '果叉纸巾数量',
  `tableware_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '包装服务状态 1默认提供 0特殊要求',
  `overtime_status` tinyint NOT NULL DEFAULT '0' COMMENT '超时标记 0正常 1已超时',
  `actual_delivery_time` datetime DEFAULT NULL COMMENT '实际送达完成时间',
  `stock_rollback_status` tinyint NOT NULL DEFAULT '0' COMMENT '库存回滚标记 0未回滚 1已回滚',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lgg_orders_number` (`number`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 9. 订单明细表
DROP TABLE IF EXISTS `lgg_order_detail`;
CREATE TABLE `lgg_order_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) DEFAULT NULL COMMENT '名字',
  `image` varchar(500) DEFAULT NULL COMMENT '图片',
  `order_id` bigint NOT NULL COMMENT '订单id',
  `fruit_id` bigint DEFAULT NULL COMMENT '水果id',
  `fruit_box_id` bigint DEFAULT NULL COMMENT '果篮id',
  `fruit_flavor` varchar(255) DEFAULT NULL COMMENT '规格口感属性',
  `number` int NOT NULL DEFAULT '1' COMMENT '数量',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- 10. C端用户信息表
DROP TABLE IF EXISTS `lgg_user`;
CREATE TABLE `lgg_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `openid` varchar(100) DEFAULT NULL COMMENT '微信用户唯一标识',
  `name` varchar(100) DEFAULT NULL COMMENT '姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `sex` varchar(10) DEFAULT NULL COMMENT '性别',
  `id_number` varchar(30) DEFAULT NULL COMMENT '身份证号',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像',
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信C端用户信息表';
