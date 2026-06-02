package com.ruoyi.business.service;

import com.ruoyi.business.dto.UserLoginDTO;
import com.ruoyi.business.entity.User;

public interface UserService {

    /**
     * 微信登录
     * @param userLoginDTO
     * @return
     */
    User wxLogin(UserLoginDTO userLoginDTO);
}
