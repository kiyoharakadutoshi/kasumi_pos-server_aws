package com.luvina.pos.provider.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.domain.master.User;
import com.luvina.pos.provider.dto.app.AppUserDto;
import com.luvina.pos.provider.dto.app.PosInfoDto;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Base64;
import java.util.Map;

public class AuthUtil {

    private AuthUtil() {
    }

    /**
     * Get Current User
     *
     * @return User
     */
    public static AppUserDto getCurrentUser() {
        AppUserDto appUserDto = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            appUserDto = "anonymousUser".equals(principal) ? null : (AppUserDto) principal;
        }
        return appUserDto;
    }

    private static final ObjectMapper mapper = new ObjectMapper();

    public static PosInfoDto parsePosInfo(String token) {
        try {
            String payload = token.split("\\.")[1];
            String json = new String(Base64.getUrlDecoder().decode(payload));
            JsonNode node = mapper.readTree(json);
            JsonNode payloadNode = node.get("payload");
            String company  = payloadNode.get("company_code").asText();
            String store    = payloadNode.get("store_code").asText();
            String instore  = payloadNode.get("instore_code").asText();

            return new PosInfoDto(company, store, instore);
        } catch (Exception e) {
            return new PosInfoDto(CommonConstants.COMPANY_CODE_DEFAULT,
                    CommonConstants.STORE_CODE_DEFAULT,
                    CommonConstants.INSTORE_CODE_DEFAULT);
        }
    }
}
