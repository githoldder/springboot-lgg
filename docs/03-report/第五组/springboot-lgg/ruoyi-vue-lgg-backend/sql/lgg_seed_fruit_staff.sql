USE `lgg_ruoyi`;

-- GreenFruit demo seed data. Safe to run repeatedly before a presentation.

CREATE TABLE IF NOT EXISTS `employee` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '姓名',
  `username` varchar(32) COLLATE utf8_bin NOT NULL COMMENT '用户名',
  `password` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '密码',
  `phone` varchar(11) COLLATE utf8_bin NOT NULL COMMENT '手机号',
  `sex` varchar(2) COLLATE utf8_bin NOT NULL COMMENT '性别',
  `id_number` varchar(18) COLLATE utf8_bin NOT NULL COMMENT '身份证号',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 0:禁用，1:启用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `create_user` bigint DEFAULT NULL COMMENT '创建人',
  `update_user` bigint DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin COMMENT='员工信息';

INSERT INTO `lgg_category` (`id`, `type`, `name`, `sort`, `status`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
(10, 1, '时令鲜果', 1, 1, NOW(), NOW(), 1, 1),
(11, 1, '鲜切果杯', 2, 1, NOW(), NOW(), 1, 1),
(12, 2, '果篮套餐', 3, 1, NOW(), NOW(), 1, 1),
(13, 1, '鲜榨饮品', 4, 1, NOW(), NOW(), 1, 1),
(14, 1, '进口精选', 5, 1, NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE
  `type` = VALUES(`type`),
  `sort` = VALUES(`sort`),
  `status` = VALUES(`status`),
  `update_time` = NOW(),
  `update_user` = VALUES(`update_user`);

INSERT INTO `lgg_fruit` (`id`, `name`, `category_id`, `price`, `image`, `description`, `status`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
(101, '阿克苏冰糖心苹果(500g)', 10, 8.80, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800', '脆甜多汁，冷链到店，适合每日补充维C', 1, NOW(), NOW(), 1, 1),
(102, '泰国金枕榴莲果肉(300g)', 14, 69.90, 'https://images.unsplash.com/photo-1620646146961-cb1610ca1439?w=800', '自然解冻即食，奶香浓郁', 1, NOW(), NOW(), 1, 1),
(103, '精品红颜草莓(250g)', 10, 18.00, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800', '当天分拣，颗颗红润，酸甜平衡', 1, NOW(), NOW(), 1, 1),
(104, '海南贵妃芒果(500g)', 10, 12.50, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800', '皮薄核小，果香清甜', 1, NOW(), NOW(), 1, 1),
(105, '智利进口车厘子(500g)', 14, 49.90, 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800', '大颗饱满，脆甜爆汁', 1, NOW(), NOW(), 1, 1),
(106, '阳光玫瑰青提(500g)', 14, 29.90, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800', '清香脆甜，果粒紧实', 1, NOW(), NOW(), 1, 1),
(111, '鲜切西瓜拼盘(300g)', 11, 9.90, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', '现切现装，冰爽多汁', 1, NOW(), NOW(), 1, 1),
(112, '鲜切蜜瓜拼盘(300g)', 11, 12.00, 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=800', '香甜爽口，办公室下午茶优选', 1, NOW(), NOW(), 1, 1),
(113, '缤纷家庭分享果切(600g)', 11, 25.00, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800', '多种果切组合，清爽不腻', 1, NOW(), NOW(), 1, 1),
(131, '鲜榨橙汁(350ml)', 13, 12.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800', '鲜橙现榨，不加糖', 1, NOW(), NOW(), 1, 1),
(132, '椰青鲜椰水(350ml)', 13, 15.00, 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?w=800', '清甜解渴，低负担', 1, NOW(), NOW(), 1, 1),
(133, '冰爽西瓜汁(350ml)', 13, 10.00, 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800', '现榨西瓜汁，夏日清爽款', 1, NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE
  `category_id` = VALUES(`category_id`),
  `price` = VALUES(`price`),
  `image` = VALUES(`image`),
  `description` = VALUES(`description`),
  `status` = VALUES(`status`),
  `update_time` = NOW(),
  `update_user` = VALUES(`update_user`);

INSERT INTO `lgg_fruit_flavor` (`id`, `fruit_id`, `name`, `value`) VALUES
(1, 101, '包装', '["精装","简装"]'),
(2, 102, '熟度', '["即食","冷藏慢熟"]'),
(3, 111, '温度', '["常温","冰镇"]'),
(4, 131, '加冰', '["去冰","正常冰"]'),
(5, 131, '甜度', '["原味","加蜂蜜"]'),
(6, 106, '颗粒', '["精选大粒","家庭实惠装"]')
ON DUPLICATE KEY UPDATE
  `fruit_id` = VALUES(`fruit_id`),
  `name` = VALUES(`name`),
  `value` = VALUES(`value`);

INSERT INTO `lgg_fruit_box` (`id`, `category_id`, `name`, `price`, `status`, `description`, `image`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
(201, 12, '元气满满单人果切果汁餐', 19.90, 1, '鲜切西瓜拼盘 + 鲜榨橙汁，轻负担补能', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800', NOW(), NOW(), 1, 1),
(202, 12, '温馨家庭幸福果篮', 88.00, 1, '苹果、芒果、草莓、车厘子组合，适合家庭分享', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800', NOW(), NOW(), 1, 1),
(203, 12, '尊贵商务送礼果篮', 168.00, 1, '榴莲、车厘子、芒果高端组合，附精美礼盒', 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800', NOW(), NOW(), 1, 1),
(204, 12, '轻食下午茶鲜果盒', 39.90, 1, '阳光玫瑰、草莓、蜜瓜与椰水组合', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE
  `category_id` = VALUES(`category_id`),
  `price` = VALUES(`price`),
  `status` = VALUES(`status`),
  `description` = VALUES(`description`),
  `image` = VALUES(`image`),
  `update_time` = NOW(),
  `update_user` = VALUES(`update_user`);

INSERT INTO `lgg_fruit_box_item` (`id`, `fruit_box_id`, `fruit_id`, `name`, `price`, `copies`) VALUES
(1, 201, 111, '鲜切西瓜拼盘(300g)', 9.90, 1),
(2, 201, 131, '鲜榨橙汁(350ml)', 12.00, 1),
(3, 202, 101, '阿克苏冰糖心苹果(500g)', 8.80, 2),
(4, 202, 103, '精品红颜草莓(250g)', 18.00, 1),
(5, 202, 104, '海南贵妃芒果(500g)', 12.50, 1),
(6, 202, 105, '智利进口车厘子(500g)', 49.90, 1),
(7, 203, 102, '泰国金枕榴莲果肉(300g)', 69.90, 2),
(8, 203, 105, '智利进口车厘子(500g)', 49.90, 1),
(9, 203, 104, '海南贵妃芒果(500g)', 12.50, 2),
(10, 204, 106, '阳光玫瑰青提(500g)', 29.90, 1),
(11, 204, 103, '精品红颜草莓(250g)', 18.00, 1),
(12, 204, 132, '椰青鲜椰水(350ml)', 15.00, 1)
ON DUPLICATE KEY UPDATE
  `fruit_box_id` = VALUES(`fruit_box_id`),
  `fruit_id` = VALUES(`fruit_id`),
  `name` = VALUES(`name`),
  `price` = VALUES(`price`),
  `copies` = VALUES(`copies`);

INSERT INTO `employee` (`id`, `name`, `username`, `password`, `phone`, `sex`, `id_number`, `status`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
(1, '门店管理员', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '13812312312', '1', '110101199001010047', 1, NOW(), NOW(), 1, 1),
(2, '果品采购员', 'buyer', 'e10adc3949ba59abbe56e057f20f883e', '13812312313', '1', '110101199202020058', 1, NOW(), NOW(), 1, 1),
(3, '分拣打包员', 'packer', 'e10adc3949ba59abbe56e057f20f883e', '13812312314', '2', '110101199303030069', 1, NOW(), NOW(), 1, 1),
(4, '骑手调度员', 'dispatcher', 'e10adc3949ba59abbe56e057f20f883e', '13812312315', '1', '110101199404040070', 1, NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `phone` = VALUES(`phone`),
  `sex` = VALUES(`sex`),
  `id_number` = VALUES(`id_number`),
  `status` = VALUES(`status`),
  `update_time` = NOW(),
  `update_user` = VALUES(`update_user`);

INSERT INTO `sys_user` (`user_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `pwd_update_date`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES
(11, 103, 'buyer', '果品采购员', '00', 'buyer@greenfruit.local', '13812312313', '0', '', '$2a$10$E.V2122pdVnGbORAhZLWW.W4yjTO19XK/m.lX5Q0izXH6LpP.tJ9.', '0', '0', '127.0.0.1', NOW(), NOW(), 'admin', NOW(), '', NULL, '绿果果演示员工'),
(12, 105, 'packer', '分拣打包员', '00', 'packer@greenfruit.local', '13812312314', '1', '', '$2a$10$E.V2122pdVnGbORAhZLWW.W4yjTO19XK/m.lX5Q0izXH6LpP.tJ9.', '0', '0', '127.0.0.1', NOW(), NOW(), 'admin', NOW(), '', NULL, '绿果果演示员工'),
(13, 107, 'dispatcher', '骑手调度员', '00', 'dispatcher@greenfruit.local', '13812312315', '0', '', '$2a$10$E.V2122pdVnGbORAhZLWW.W4yjTO19XK/m.lX5Q0izXH6LpP.tJ9.', '0', '0', '127.0.0.1', NOW(), NOW(), 'admin', NOW(), '', NULL, '绿果果演示员工')
ON DUPLICATE KEY UPDATE
  `dept_id` = VALUES(`dept_id`),
  `nick_name` = VALUES(`nick_name`),
  `email` = VALUES(`email`),
  `phonenumber` = VALUES(`phonenumber`),
  `sex` = VALUES(`sex`),
  `status` = VALUES(`status`),
  `del_flag` = VALUES(`del_flag`),
  `update_time` = NOW(),
  `remark` = VALUES(`remark`);

INSERT IGNORE INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(11, 2),
(12, 2),
(13, 2);

INSERT IGNORE INTO `sys_user_post` (`user_id`, `post_id`) VALUES
(11, 4),
(12, 4),
(13, 4);

INSERT INTO `lgg_user` (`id`, `openid`, `name`, `phone`, `sex`, `id_number`, `avatar`, `create_time`) VALUES
(1, 'mock-openid-greenfruit-001', '小程序演示用户', '13800138000', '2', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', NOW())
ON DUPLICATE KEY UPDATE
  `openid` = VALUES(`openid`),
  `name` = VALUES(`name`),
  `phone` = VALUES(`phone`),
  `sex` = VALUES(`sex`),
  `avatar` = VALUES(`avatar`);

INSERT INTO `lgg_address_book` (`id`, `user_id`, `consignee`, `sex`, `phone`, `province_code`, `province_name`, `city_code`, `city_name`, `district_code`, `district_name`, `detail`, `label`, `is_default`) VALUES
(1, 1, '测试收货人', '2', '13800138000', '110000', '北京市', '110100', '北京市', '110105', '朝阳区', '生鲜路8号 绿果果演示小区', '家', 1)
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `consignee` = VALUES(`consignee`),
  `phone` = VALUES(`phone`),
  `province_name` = VALUES(`province_name`),
  `city_name` = VALUES(`city_name`),
  `district_name` = VALUES(`district_name`),
  `detail` = VALUES(`detail`),
  `label` = VALUES(`label`),
  `is_default` = VALUES(`is_default`);

SELECT 'GreenFruit seed data ready' AS message;
SELECT COUNT(*) AS fruit_count FROM `lgg_fruit`;
SELECT COUNT(*) AS fruit_box_count FROM `lgg_fruit_box`;
SELECT COUNT(*) AS employee_count FROM `employee`;
