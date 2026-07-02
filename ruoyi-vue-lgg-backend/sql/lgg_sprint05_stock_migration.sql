USE lgg_ruoyi;

-- 1. 幂等新增 lgg_fruit 商品库存列
DELIMITER //
CREATE PROCEDURE AddStockColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = 'lgg_ruoyi' AND table_name = 'lgg_fruit' AND column_name = 'stock'
    ) THEN
        ALTER TABLE lgg_fruit ADD COLUMN stock INT NOT NULL DEFAULT 9999;
    END IF;
END //
DELIMITER ;
CALL AddStockColumn();
DROP PROCEDURE AddStockColumn;

-- 2. 幂等新增 lgg_orders 时效与库存回补幂等列
DELIMITER //
CREATE PROCEDURE AddOrderColumns()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = 'lgg_ruoyi' AND table_name = 'lgg_orders' AND column_name = 'estimated_delivery_time'
    ) THEN
        ALTER TABLE lgg_orders ADD COLUMN estimated_delivery_time DATETIME DEFAULT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = 'lgg_ruoyi' AND table_name = 'lgg_orders' AND column_name = 'overtime_status'
    ) THEN
        ALTER TABLE lgg_orders ADD COLUMN overtime_status TINYINT NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = 'lgg_ruoyi' AND table_name = 'lgg_orders' AND column_name = 'actual_delivery_time'
    ) THEN
        ALTER TABLE lgg_orders ADD COLUMN actual_delivery_time DATETIME DEFAULT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = 'lgg_ruoyi' AND table_name = 'lgg_orders' AND column_name = 'stock_rollback_status'
    ) THEN
        ALTER TABLE lgg_orders ADD COLUMN stock_rollback_status TINYINT NOT NULL DEFAULT 0;
    END IF;
END //
DELIMITER ;
CALL AddOrderColumns();
DROP PROCEDURE AddOrderColumns;
