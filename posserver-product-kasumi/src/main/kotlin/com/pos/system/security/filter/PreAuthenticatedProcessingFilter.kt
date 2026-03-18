package com.pos.system.security.filter

import com.pos.system.exception.UnAuthorized
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter

class PreAuthenticatedProcessingFilter : AbstractPreAuthenticatedProcessingFilter() {

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val res = request as HttpServletRequest
        val requestUrl = res.requestURL.toString()
        println("requestUrl = " + requestUrl)
        if (requestUrl.contains("/websocket")) {
//            throw UnAuthorized()
        }
        //TODO LOGIN API
//        if (res.servletPath.contains("/api/v1/auth")) {
            chain.doFilter(request, response)
//        } else {
//            super.doFilter(request, response, chain)
//        }

    }

    override fun getPreAuthenticatedPrincipal(httpServletRequest: HttpServletRequest): Any {
        return ""
    }

    override fun getPreAuthenticatedCredentials(httpServletRequest: HttpServletRequest): Any {
        try {
            val authHeader = httpServletRequest.getHeader("Authorization")
            return authHeader.substring(7)
        } catch (e: Exception) {
            throw UnAuthorized()
        }
    }
}