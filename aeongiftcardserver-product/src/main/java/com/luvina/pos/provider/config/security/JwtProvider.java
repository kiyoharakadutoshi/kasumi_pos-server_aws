package com.luvina.pos.provider.config.security;


import com.luvina.pos.provider.config.security.app.AppUserDetail;
import com.luvina.pos.provider.dto.app.AppUserDto;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import static com.luvina.pos.provider.constant.AuthenticationConstant.*;

@Component
@Slf4j
public class JwtProvider {

    @Value("${security.jwt.app-token-expiration:0}")
    private long appTokenExpiration;

    @Value("${security.jwt.app-token-key}")
    private String jwtKey;

    @Value("${security.jwt.default-token}")
    private String defaultToken;

    private static final String AUTH_SUBJECT = "Auth";

    public boolean isDefaultToken(String token){
        return defaultToken.equals(token);
    }


    public AppUserDetail getPosTokenDetail(String token) {
        AppUserDetail appUserDetail = new AppUserDetail();
        Claims claims = extractAllClaims(token);
        Map<String, Object> subPayload = claims.get(TOKEN_PARAM_SUB_PAYLOAD, Map.class);
        appUserDetail.setCompanyCode((String) subPayload.get(TOKEN_PARAM_COMPANY_CODE));
        appUserDetail.setStoreCode((String) subPayload.get(TOKEN_PARAM_STORE_CODE));
        appUserDetail.setInstoreCode((String) subPayload.get(TOKEN_PARAM_INSTORE_CODE));
        appUserDetail.setOsType((String) subPayload.get(TOKEN_PARAM_OS_TYPE));
        appUserDetail.setOsVersion((String) subPayload.get(TOKEN_PARAM_OS_VERSION));
        appUserDetail.setAppVersion((String) subPayload.get(TOKEN_PARAM_APP_VERSION));
        return appUserDetail;
    }

    public String createPosTokenForApp(AppUserDto appUserDto) {
        Map<String, Object> extractClaims = new LinkedHashMap<>();
        extractClaims.put(CLIENT_TYPE_KEY, TYPE_TOKEN_POS_MACHINE);
        Map<String, Object> subClaims = new LinkedHashMap<>();
        subClaims.put(TOKEN_PARAM_COMPANY_CODE, appUserDto.getCompanyCode());
        subClaims.put(TOKEN_PARAM_STORE_CODE, appUserDto.getStoreCode());
        subClaims.put(TOKEN_PARAM_INSTORE_CODE, appUserDto.getInstoreCode());
        subClaims.put(TOKEN_PARAM_EMPLOYEE_CODE, "");
        subClaims.put(TOKEN_PARAM_OS_TYPE, appUserDto.getOsType());
        subClaims.put(TOKEN_PARAM_OS_VERSION, appUserDto.getOsVersion());
        subClaims.put(TOKEN_PARAM_APP_VERSION, appUserDto.getAppVersion());
        subClaims.put(TOKEN_PARAM_MAC_ADDRESS, "");
        subClaims.put(TOKEN_PARAM_IP_ADDRESS, "");
        extractClaims.put(TOKEN_PARAM_SUB_PAYLOAD, subClaims);
        return buildToken(extractClaims, AUTH_SUBJECT);
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private String buildToken(
            Map<String, Object> extractClaims,
            String username
    ) {
        Date now = new Date(System.currentTimeMillis());
        Date expiration = new Date(now.getTime() + appTokenExpiration);
        return Jwts
                .builder()
                .setSubject(username)
                .setId(UUID.randomUUID().toString())
                .setExpiration(expiration)
                .setIssuedAt(now)
                .setIssuer("pos")
                .addClaims(extractClaims)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private String buildToken(
            Long jwtExpiration,
            String username
    ) {
        Map<String, Object> extractClaims = Map.of(CLIENT_TYPE_KEY, TYPE_TOKEN_USER);
        Date now = new Date(System.currentTimeMillis());
        Date expiration = new Date(now.getTime() + jwtExpiration);
        return Jwts
                .builder()
                .setClaims(extractClaims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Key key = getSignInKey();
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }

    public Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaims(String jwt, Function<Claims, T> claimsTFunction) {
        Claims claims = extractAllClaims(jwt);
        return claimsTFunction.apply(claims);
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
