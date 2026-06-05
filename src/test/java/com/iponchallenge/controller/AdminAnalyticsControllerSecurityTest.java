package com.iponchallenge.controller;

import com.iponchallenge.config.JwtUtils;
import com.iponchallenge.config.SecurityConfig;
import com.iponchallenge.dto.AdminAnalyticsResponse;
import com.iponchallenge.security.JwtAuthenticationFilter;
import com.iponchallenge.service.AdminAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies role-based access control on the admin analytics endpoint end-to-end
 * through the real {@link SecurityConfig} filter chain:
 *  - anonymous   -> 401 Unauthorized
 *  - STUDENT     -> 403 Forbidden
 *  - ADMIN       -> 200 OK
 *
 * This guards the guarantee that a regular user can never reach admin data, even
 * by calling the API directly.
 */
@WebMvcTest(AdminAnalyticsController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AdminAnalyticsControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private AdminAnalyticsService adminAnalyticsService;

    // Collaborators required to build the real security filter chain.
    @MockBean private JwtUtils jwtUtils;
    @MockBean private UserDetailsService userDetailsService;

    @Test
    void anonymousUser_isUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/analytics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void regularUser_isForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/analytics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminUser_canAccess() throws Exception {
        when(adminAnalyticsService.getAnalytics())
                .thenReturn(AdminAnalyticsResponse.builder().totalUsers(7).build());

        mockMvc.perform(get("/api/admin/analytics"))
                .andExpect(status().isOk());
    }
}
