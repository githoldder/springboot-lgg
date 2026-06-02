-- 绿果果业务菜单初始化脚本
-- 适用于 RuoYi-Vue 后台动态菜单。重复执行会先清理固定菜单 ID 后重建。

SET NAMES utf8mb4;

DELETE FROM sys_role_menu WHERE menu_id BETWEEN 2000 AND 2005;
DELETE FROM sys_menu WHERE menu_id BETWEEN 2000 AND 2005;

INSERT INTO sys_menu
(menu_id, menu_name, parent_id, order_num, path, component, query, route_name, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES
(2000, '绿果果业务', 0, 6, 'business', NULL, NULL, '', 1, 0, 'M', '0', '0', '', 'shopping', 'admin', NOW(), '', NULL, '绿果果业务目录'),
(2001, '分类管理', 2000, 1, 'category', 'business/category/index', NULL, '', 1, 0, 'C', '0', '0', 'business:category:list', 'tree', 'admin', NOW(), '', NULL, '水果及果篮分类管理'),
(2002, '水果管理', 2000, 2, 'fruit', 'business/fruit/index', NULL, '', 1, 0, 'C', '0', '0', 'business:fruit:list', 'shopping', 'admin', NOW(), '', NULL, '水果品种管理'),
(2003, '果篮套餐', 2000, 3, 'fruitBox', 'business/fruitBox/index', NULL, '', 1, 0, 'C', '0', '0', 'business:fruitBox:list', 'gift', 'admin', NOW(), '', NULL, '精选果篮套餐管理'),
(2004, '订单管理', 2000, 4, 'order', 'business/order/index', NULL, '', 1, 0, 'C', '0', '0', 'business:order:list', 'list', 'admin', NOW(), '', NULL, '水果订单管理'),
(2005, '店铺设置', 2000, 5, 'shop', 'business/shop/index', NULL, '', 1, 0, 'C', '0', '0', 'business:shop:status', 'guide', 'admin', NOW(), '', NULL, '店铺营业状态设置');

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, menu_id FROM sys_menu WHERE menu_id BETWEEN 2000 AND 2005;
