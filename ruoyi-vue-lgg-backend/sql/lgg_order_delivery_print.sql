ALTER TABLE lgg_orders
    ADD COLUMN delivery_type varchar(20) NOT NULL DEFAULT 'DELIVERY' COMMENT '配送方式 DELIVERY配送到家 PICKUP到店自提' AFTER delivery_status,
    ADD COLUMN rider_id bigint NULL COMMENT '骑手ID' AFTER delivery_type,
    ADD COLUMN rider_name varchar(100) NULL COMMENT '骑手姓名' AFTER rider_id,
    ADD COLUMN rider_phone varchar(20) NULL COMMENT '骑手手机号' AFTER rider_name;
