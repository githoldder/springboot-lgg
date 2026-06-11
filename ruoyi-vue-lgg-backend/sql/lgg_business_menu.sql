-- 常工鲜生业务菜单初始化脚本
-- 适用于 RuoYi-Vue 后台动态菜单。重复执行会先清理固定菜单 ID 后重建。

SET NAMES utf8mb4;

UPDATE sys_dept SET dept_name = '常工鲜生', leader = '门店管理员', phone = '13812312312', email = 'ops@cg-fresh.local' WHERE dept_id = 100;
UPDATE sys_dept SET dept_name = '运营中心' WHERE dept_id = 101;
UPDATE sys_dept SET dept_name = '履约配送中心' WHERE dept_id = 102;
UPDATE sys_dept SET dept_name = '商品运营组' WHERE dept_id = 103;
UPDATE sys_dept SET dept_name = '市场增长组' WHERE dept_id = 104;
UPDATE sys_dept SET dept_name = '分拣测试组' WHERE dept_id = 105;
UPDATE sys_dept SET dept_name = '财务结算组' WHERE dept_id = 106;
UPDATE sys_dept SET dept_name = '平台运维组' WHERE dept_id = 107;

UPDATE sys_user SET nick_name = '常工鲜生管理员', dept_id = 100, email = 'admin@cg-fresh.local', phonenumber = '13812312312' WHERE user_id = 1;
UPDATE sys_user SET nick_name = '运营演示账号', dept_id = 101, email = 'ops@cg-fresh.local', phonenumber = '13812312313' WHERE user_id = 2;

UPDATE sys_menu SET visible = '0' WHERE menu_id IN (1, 2);
UPDATE sys_menu SET visible = '0' WHERE parent_id IN (1, 2);
UPDATE sys_menu SET visible = '1' WHERE menu_id IN (3, 4);
UPDATE sys_menu SET visible = '1' WHERE parent_id = 3;
UPDATE sys_menu SET visible = '1' WHERE menu_name IN ('系统接口', '代码生成', '表单构建');
UPDATE sys_notice SET notice_title = '常工鲜生演示系统初始化完成', notice_content = '业务运营、接口调试、支付闭环演示模块已就绪。' WHERE notice_id IN (1, 2, 3);

DELETE FROM sys_role_menu WHERE menu_id BETWEEN 2000 AND 2199;
DELETE FROM sys_menu WHERE menu_id BETWEEN 2000 AND 2199;

INSERT INTO sys_menu
(menu_id, menu_name, parent_id, order_num, path, component, query, route_name, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES
(2000, '业务板块', 0, 1, 'business', NULL, NULL, '', 1, 0, 'M', '0', '0', '', 'shopping', 'admin', NOW(), '', NULL, '常工鲜生业务目录'),
(2001, '营业额看板', 2000, 1, 'revenue', 'business/revenue/index', NULL, '', 1, 0, 'C', '0', '0', 'business:revenue:list', 'dashboard', 'admin', NOW(), '', NULL, '营业额、订单、热销水果统计'),
(2002, '骑手管理', 2000, 2, 'rider', 'business/rider/index', NULL, '', 1, 0, 'C', '0', '0', 'business:rider:list', 'peoples', 'admin', NOW(), '', NULL, '骑手调度人员管理'),
(2003, '水果管理', 2000, 3, 'fruit', 'business/fruit/index', NULL, '', 1, 0, 'C', '0', '0', 'business:fruit:list', 'shopping', 'admin', NOW(), '', NULL, '水果品种管理'),
(2004, '分类管理', 2000, 4, 'category', 'business/category/index', NULL, '', 1, 0, 'C', '0', '0', 'business:category:list', 'tree', 'admin', NOW(), '', NULL, '水果及果篮分类管理'),
(2005, '套餐管理', 2000, 5, 'fruitBox', 'business/fruitBox/index', NULL, '', 1, 0, 'C', '0', '0', 'business:fruitBox:list', 'component', 'admin', NOW(), '', NULL, '精选果篮套餐管理'),
(2006, '订单管理', 2000, 6, 'order', 'business/order/index', NULL, '', 1, 0, 'C', '0', '0', 'business:order:list', 'list', 'admin', NOW(), '', NULL, '水果订单管理'),
(2007, '员工管理', 2000, 7, 'employee', 'business/employee/index', NULL, '', 1, 0, 'C', '0', '0', 'business:employee:list', 'user', 'admin', NOW(), '', NULL, '门店员工管理'),
(2101, '微服务健康', 2, 6, 'microservices', 'monitor/microservices/index', NULL, '', 1, 0, 'C', '0', '0', 'monitor:microservices:list', 'monitor', 'admin', NOW(), '', NULL, 'Nacos、Gateway、业务、支付、通知等健康检测');

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM sys_role r
CROSS JOIN sys_menu m
WHERE r.role_id IN (1, 2)
  AND m.menu_id BETWEEN 2000 AND 2199;
