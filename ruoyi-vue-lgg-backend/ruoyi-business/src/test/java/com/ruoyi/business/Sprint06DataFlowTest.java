package com.ruoyi.business;

import com.ruoyi.business.dto.UserLoginDTO;
import com.ruoyi.business.entity.Orders;
import com.ruoyi.business.entity.User;
import com.ruoyi.business.mapper.OrderMapper;
import com.ruoyi.business.mapper.UserMapper;
import com.ruoyi.business.properties.WeChatProperties;
import com.ruoyi.business.service.impl.ReportServiceImpl;
import com.ruoyi.business.service.impl.UserServiceImpl;
import com.ruoyi.business.vo.TurnoverReportVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class Sprint06DataFlowTest {

    @InjectMocks
    private UserServiceImpl userService;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private WeChatProperties weChatProperties;

    @Test
    public void testMockWechatLoginPersistsRealUserProfile() {
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setCode("mock_sprint06_caolei");
        loginDTO.setName("曹磊");
        loginDTO.setAvatar("https://example.test/avatar/caolei.png");
        loginDTO.setSex("1");

        User user = userService.wxLogin(loginDTO);

        assertEquals("mock_openid_mock_sprint06_caolei", user.getOpenid());
        assertEquals("曹磊", user.getName());
        assertEquals("https://example.test/avatar/caolei.png", user.getAvatar());
        assertEquals("1", user.getSex());
        verify(userMapper).insert(argThat(saved ->
                "mock_openid_mock_sprint06_caolei".equals(saved.getOpenid())
                        && "曹磊".equals(saved.getName())
                        && saved.getCreateTime() != null
        ));
    }

    @Test
    public void testExistingWechatUserProfileIsUpdatedAndReused() {
        User existing = User.builder()
                .id(88L)
                .openid("mock_openid_mock_sprint06_existing")
                .name("旧昵称")
                .avatar("old-avatar")
                .sex("0")
                .build();
        when(userMapper.getByOpenid("mock_openid_mock_sprint06_existing")).thenReturn(existing);

        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setCode("mock_sprint06_existing");
        loginDTO.setName("曹磊");
        loginDTO.setAvatar("new-avatar");
        loginDTO.setSex("1");

        User user = userService.wxLogin(loginDTO);

        assertSame(existing, user);
        assertEquals("曹磊", user.getName());
        assertEquals("new-avatar", user.getAvatar());
        assertEquals("1", user.getSex());
        verify(userMapper).update(existing);
    }

    @Test
    public void testConcurrentWechatLoginUniqueOpenidFallsBackToExistingUser() {
        User existing = User.builder()
                .id(99L)
                .openid("mock_openid_mock_sprint06_race")
                .name("并发用户")
                .build();
        when(userMapper.getByOpenid("mock_openid_mock_sprint06_race")).thenReturn(null, existing);
        doThrow(new DuplicateKeyException("uk_lgg_user_openid"))
                .when(userMapper)
                .insert(argThat(saved -> "mock_openid_mock_sprint06_race".equals(saved.getOpenid())));

        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setCode("mock_sprint06_race");
        loginDTO.setName("并发用户");

        User user = userService.wxLogin(loginDTO);

        assertSame(existing, user);
    }

    @Test
    public void testTurnoverEchartsReadsCompletedOrdersOnly() {
        when(orderMapper.sumByMap(argThat(map -> Orders.COMPLETED.equals(map.get("status")))))
                .thenReturn(66.60);

        TurnoverReportVO report = reportService.getTurnoverStatistics(
                LocalDate.of(2026, 7, 7),
                LocalDate.of(2026, 7, 7)
        );

        assertEquals("2026-07-07", report.getDateList());
        assertEquals("66.6", report.getTurnoverList());
        verify(orderMapper).sumByMap(argThat(map -> {
            Map<?, ?> query = (Map<?, ?>) map;
            return Orders.COMPLETED.equals(query.get("status"))
                    && query.get("begin") != null
                    && query.get("end") != null;
        }));
    }
}
