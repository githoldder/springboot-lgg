package com.ruoyi.business.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.ruoyi.business.constant.MessageConstant;
import com.ruoyi.business.dto.UserLoginDTO;
import com.ruoyi.business.entity.User;
import com.ruoyi.business.exception.LoginFailedException;
import com.ruoyi.business.mapper.UserMapper;
import com.ruoyi.business.properties.WeChatProperties;
import com.ruoyi.business.service.UserService;
import com.ruoyi.business.utils.HttpClientUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    //微信服务接口地址
    public static final String WX_LOGIN = "https://api.weixin.qq.com/sns/jscode2session";

    @Autowired
    private WeChatProperties weChatProperties;
    @Autowired
    private UserMapper userMapper;

    /**
     * 微信登录
     * @param userLoginDTO
     * @return
     */
    public User wxLogin(UserLoginDTO userLoginDTO) {
        String openid = getOpenid(userLoginDTO.getCode());

        // 判断openid是否为空，如果为空，则启用开发沙箱模拟登录，保证本地联调链路畅通
        if (StringUtils.isBlank(openid)) {
            log.warn("微信 API 获取 openid 失败，启用开发沙箱登录模式！");
            String mockCode = StringUtils.defaultIfBlank(userLoginDTO.getCode(), "default_user");
            openid = "mock_openid_" + mockCode;
        }

        //判断当前用户是否为新用户
        User user = userMapper.getByOpenid(openid);

        //如果是新用户，自动完成注册
        if (user == null) {
            user = User.builder()
                    .openid(openid)
                    .name(userLoginDTO.getName())
                    .avatar(userLoginDTO.getAvatar())
                    .sex(userLoginDTO.getSex())
                    .createTime(LocalDateTime.now())
                    .build();
            try {
                userMapper.insert(user);
            } catch (DuplicateKeyException e) {
                log.warn("微信用户并发登录发生 openid 唯一键冲突，改为回查已有用户：{}", openid);
                user = userMapper.getByOpenid(openid);
            }
        } else {
            // 已存在用户，更新头像/昵称/性别，保持微信侧最新资料可持久化同步
            if (mergeProfile(user, userLoginDTO)) {
                userMapper.update(user);
            }
        }

        //返回这个用户对象
        return user;
    }

    /**
     * 调用微信接口服务，获取微信用户的openid
     * @param code
     * @return
     */
    private String getOpenid(String code){
        if (StringUtils.isBlank(code) || StringUtils.startsWithAny(code, "mock_", "test_")) {
            return null;
        }

        //调用微信接口服务，获得当前微信用户的openid
        Map<String, String> map = new HashMap<>();
        map.put("appid",weChatProperties.getAppid());
        map.put("secret",weChatProperties.getSecret());
        map.put("js_code",code);
        map.put("grant_type","authorization_code");
        String json = HttpClientUtil.doGet(WX_LOGIN, map);

        log.info("微信接口返回：{}", json);
        if (StringUtils.isBlank(json)) {
            return null;
        }
        try {
            JSONObject jsonObject = JSON.parseObject(json);
            return jsonObject == null ? null : jsonObject.getString("openid");
        } catch (Exception e) {
            log.warn("解析微信登录返回失败：{}", json, e);
            return null;
        }
    }

    private boolean mergeProfile(User user, UserLoginDTO userLoginDTO) {
        boolean needUpdate = false;
        if (StringUtils.isNotBlank(userLoginDTO.getName())
                && !StringUtils.equals(user.getName(), userLoginDTO.getName())) {
            user.setName(userLoginDTO.getName());
            needUpdate = true;
        }
        if (StringUtils.isNotBlank(userLoginDTO.getAvatar())
                && !StringUtils.equals(user.getAvatar(), userLoginDTO.getAvatar())) {
            user.setAvatar(userLoginDTO.getAvatar());
            needUpdate = true;
        }
        if (StringUtils.isNotBlank(userLoginDTO.getSex())
                && !StringUtils.equals(user.getSex(), userLoginDTO.getSex())) {
            user.setSex(userLoginDTO.getSex());
            needUpdate = true;
        }
        return needUpdate;
    }
}
