-- Sprint06: ensure one WeChat openid maps to one persisted C-end user.
ALTER TABLE `lgg_user`
  ADD UNIQUE KEY `uk_lgg_user_openid` (`openid`);
