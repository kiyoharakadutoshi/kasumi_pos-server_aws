package com.pos.system.common.config

import com.pos.system.common.util.Constants
import com.pos.system.security.filter.AuthEntryPoint
import com.pos.system.service.JwtTokenFilter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.security.servlet.PathRequest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
class WebSecurityConfig {

    @Autowired
    lateinit var authConfig: AuthenticationConfiguration

    @Autowired
    lateinit var jwtTokenFilter: JwtTokenFilter

    @Bean
    @Throws(Exception::class)
    fun authenticationManager(): AuthenticationManager {
        return authConfig.authenticationManager
    }

    @Bean
    @Throws(Exception::class)
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests { requests ->
            requests
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                .requestMatchers(*Constants.ENDPOINTS_PUBLIC)
                    .permitAll()
                    .anyRequest()
                    .authenticated()
        }.formLogin { it.disable() }
         .logout { it.disable() }
         .csrf { it.disable() }
            .cors { it.disable() }
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
//            .authenticationProvider(authenticationProvider())
//            .addFilter(preAuthenticatedProcessingFilter())
         .exceptionHandling {
             it.authenticationEntryPoint(AuthEntryPoint())
         }
        return http.build()
    }

    @Bean
    fun corsFilter(): CorsFilter {
        val source = UrlBasedCorsConfigurationSource()
        val config = CorsConfiguration()
        config.allowCredentials = true
        config.addAllowedHeader("*")
        config.addAllowedMethod("*")
        if (Constants.IS_CROSS_ALLOW) {
            config.addAllowedOriginPattern("*")
        } else {
            config.addAllowedOrigin("*")
        }
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }
}