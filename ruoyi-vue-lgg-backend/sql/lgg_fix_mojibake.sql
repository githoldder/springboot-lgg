-- 绿果果演示库乱码修复脚本
-- 修复原因：部分若依初始化数据以 UTF-8 字节被 latin1 误读后写入，导致页面菜单、标签、字典等显示 mojibake。
-- 策略：仅修复仍含 Latin-1 扩展字符的字段，避免误伤已正常的绿果果业务中文。

SET NAMES utf8mb4;

UPDATE employee
SET name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4)
WHERE name REGEXP '[À-ÿ]';

UPDATE sys_config
SET config_name = CONVERT(BINARY CONVERT(config_name USING latin1) USING utf8mb4)
WHERE config_name REGEXP '[À-ÿ]';

UPDATE sys_config
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_dept
SET dept_name = CONVERT(BINARY CONVERT(dept_name USING latin1) USING utf8mb4)
WHERE dept_name REGEXP '[À-ÿ]';

UPDATE sys_dept
SET leader = CONVERT(BINARY CONVERT(leader USING latin1) USING utf8mb4)
WHERE leader REGEXP '[À-ÿ]';

UPDATE sys_dict_data
SET dict_label = CONVERT(BINARY CONVERT(dict_label USING latin1) USING utf8mb4)
WHERE dict_label REGEXP '[À-ÿ]';

UPDATE sys_dict_data
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_dict_type
SET dict_name = CONVERT(BINARY CONVERT(dict_name USING latin1) USING utf8mb4)
WHERE dict_name REGEXP '[À-ÿ]';

UPDATE sys_dict_type
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_job
SET job_name = CONVERT(BINARY CONVERT(job_name USING latin1) USING utf8mb4)
WHERE job_name REGEXP '[À-ÿ]';

UPDATE sys_menu
SET menu_name = CONVERT(BINARY CONVERT(menu_name USING latin1) USING utf8mb4)
WHERE menu_name REGEXP '[À-ÿ]';

UPDATE sys_menu
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_notice
SET notice_title = CONVERT(BINARY CONVERT(notice_title USING latin1) USING utf8mb4)
WHERE notice_title REGEXP '[À-ÿ]';

UPDATE sys_notice
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_post
SET post_name = CONVERT(BINARY CONVERT(post_name USING latin1) USING utf8mb4)
WHERE post_name REGEXP '[À-ÿ]';

UPDATE sys_role
SET role_name = CONVERT(BINARY CONVERT(role_name USING latin1) USING utf8mb4)
WHERE role_name REGEXP '[À-ÿ]';

UPDATE sys_role
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

UPDATE sys_user
SET nick_name = CONVERT(BINARY CONVERT(nick_name USING latin1) USING utf8mb4)
WHERE nick_name REGEXP '[À-ÿ]';

UPDATE sys_user
SET remark = CONVERT(BINARY CONVERT(remark USING latin1) USING utf8mb4)
WHERE remark REGEXP '[À-ÿ]';

-- 演示环境隐藏若依默认官网外链，避免侧边栏出现模板入口。
UPDATE sys_menu
SET menu_name = '项目说明',
    path = '#',
    is_frame = 1,
    visible = '1',
    status = '1',
    remark = '演示环境隐藏默认官网入口'
WHERE menu_id = 4;
