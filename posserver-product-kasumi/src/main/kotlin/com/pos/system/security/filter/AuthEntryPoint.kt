package com.pos.system.security.filter

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets


@Component
class AuthEntryPoint : AuthenticationEntryPoint {

    override fun commence(request: HttpServletRequest?, response: HttpServletResponse,
                          authException: AuthenticationException?) {
        val exception = com.pos.system.model.others.Exception()
        exception.status = 401
        exception.error = "UnAuthorized"
        exception.message = "Incorrect authentication info"
        try {
            val mapper = ObjectMapper()
            val json: String = mapper.writeValueAsString(exception)
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = MediaType.APPLICATION_JSON_VALUE
            response.characterEncoding = StandardCharsets.UTF_8.toString()
            response.writer.write(json)
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }
}