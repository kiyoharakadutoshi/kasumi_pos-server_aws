package com.luvina.pos.provider.config.security.app;

import com.luvina.pos.provider.config.security.JwtProvider;
import com.luvina.pos.provider.exception.AuthException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAppAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private static final List<String> PRIORITY_URLS = List.of(
            "/status-update",
            "/app/log",
            "/app/check-update",
            "/app/download",
            "/app/log-file",
            "/pos-token"
    );
    private static final List<String> PRIVATE_URLS = List.of(
            "/api/v1/app/batch/settlement"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String url = request.getRequestURL().toString();
        String jwtToken;

        boolean isPrioritizeUrl = PRIORITY_URLS.stream()
                .anyMatch(url::endsWith);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if(isPrioritizeUrl){
                throw new AuthException();
            }
            filterChain.doFilter(request, response);
            return;
        }

        if (PRIVATE_URLS.stream().anyMatch(item -> item.equals(request.getServletPath()))
                && !"127.0.0.1".equals(request.getServletPath())) {
                throw new AuthException();
        }


        jwtToken = authHeader.substring(7);

        if (isPrioritizeUrl && jwtProvider.isDefaultToken(jwtToken)) {
            if (!jwtProvider.isDefaultToken(jwtToken)) {
                throw new AuthException("token default not match");
            }
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtProvider.validateJwtToken(jwtToken)) {
            AppUserDetail appUserDetail = jwtProvider.getPosTokenDetail(jwtToken);
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    appUserDetail,
                    null,
                    null
            );
            token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(token);
            filterChain.doFilter(request, response);
        } else {
            throw new AuthException();
        }

    }

}
