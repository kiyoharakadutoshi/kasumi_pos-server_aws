package com.pos.system.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.common.util.CachedBodyHttpServletRequest
import com.pos.system.common.util.Constants
import com.pos.system.common.util.Util
import com.pos.system.exception.UnAuthorized
import com.pos.system.model.dto.DataToken
import com.pos.system.model.dto.LoginRequest
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.security.servlet.PathRequest
import org.springframework.context.ApplicationContext
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.OrRequestMatcher
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import java.io.IOException


@Component
class JwtTokenFilter(val tokenProvider: JsonWebTokenService,
                     val userDetailsService: UserDetailsService2,
                     val applicationContext: ApplicationContext) :
    OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(this.javaClass)
    private val orRequestMatcher = OrRequestMatcher(
        Constants.ENDPOINTS_PUBLIC.map { AntPathRequestMatcher(it) }
            + PathRequest.toStaticResources().atCommonLocations())
    private val loginMatcher = OrRequestMatcher(AntPathRequestMatcher("pos/v1/login"), AntPathRequestMatcher("pos/v1/pos-token"))

    @Throws(IOException::class, ServletException::class)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain
    ) {
        var servletRequest = request
        val uri = request.requestURI
        if (orRequestMatcher.matches(servletRequest)) {
            chain.doFilter(servletRequest, response)
            return
        }
        val isMethodOption = request.method == "OPTIONS" || uri.contains("public/photo") || uri.contains("detail/update")
        val jwt = if (isMethodOption) Constants.HARD_TOKEN else getJwtFromRequest(request)
        val key = if (loginMatcher.matches(servletRequest)) tokenProvider.defaultKey else tokenProvider.key
        if (StringUtils.hasText(jwt) && tokenProvider.verifyJwt(jwt, key)) {
            if (SecurityContextHolder.getContext().authentication == null) {
                val user = tokenProvider.decodeJwt(jwt, key)?.let {
                    val payload = it.payload
                    if (uri.contains("pos-token")
                            || uri.contains("log")
                            || (uri.contains("check-update")
                                    && payload?.isAccountDefault() == true) || isMethodOption)
                    {
                        DataToken(payload!!)
                    } else {
                        userDetailsService.loadUserByUsername(it.payload?.companyCode, it.payload?.storeCode)
                        DataToken(payload!!)
                    }
                } ?: throw UnAuthorized()
                val authentication =
                    UsernamePasswordAuthenticationToken(user, null, user.authorities)
                SecurityContextHolder.getContext().authentication = authentication
            }
        } else {
            val isMethodOption =  request.method.contains("Option") // TODO sau này nghiên cứ có nên sử dụng hay không
            // yeu cau dung request tu version cu thi hoat dong
            var payload = Util.decodeJWT(jwt)
            if ((uri.contains("check-update") && (CachedBodyHttpServletRequest(request).let {servlet ->
                        servletRequest = servlet
                        val result = allowUpdateAppIfOldVersion(servlet)
                        if (result != null) {
                            payload = result
                            true
                        } else false
                    }))|| uri.contains("log") || payload != null || isMethodOption) {
                // support old version app pos
                val user = DataToken(payload)
                val authentication =
                        UsernamePasswordAuthenticationToken(user, null, user.authorities)
                SecurityContextHolder.getContext().authentication = authentication
            } else {
                throw UnAuthorized()
            }
//          SecurityContextHolder.getContext().authentication = null
        }
        chain.doFilter(servletRequest, response)
    }

    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION)
        return if (bearerToken != null && bearerToken.length > 7 && bearerToken.startsWith("Bearer")) {
            bearerToken.substring(7)
        } else null
    }

    private fun allowUpdateAppIfOldVersion(request: CachedBodyHttpServletRequest): LoginRequest? {
        return try {
            val body = request.body
            val model = ObjectMapper().readValue(body, LoginRequest::class.java)
            if (model.appVersion <= "231204-01") {
                model.setValueDefault()
                model
            }
            else null
        } catch (e: Exception) {
            null
        }
    }
}
