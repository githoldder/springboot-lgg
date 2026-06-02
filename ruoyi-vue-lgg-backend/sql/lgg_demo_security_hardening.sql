-- 绿果果演示账号安全加固脚本
-- 目的：避免使用公开默认弱口令触发浏览器泄露风险提示。
-- 注意：这里只保存 bcrypt 哈希，不保存演示明文密码。

SET NAMES utf8mb4;

UPDATE sys_user
SET password = '$2a$10$E.V2122pdVnGbORAhZLWW.W4yjTO19XK/m.lX5Q0izXH6LpP.tJ9.',
    pwd_update_date = NOW(),
    update_by = 'admin',
    update_time = NOW()
WHERE user_name = 'admin';
