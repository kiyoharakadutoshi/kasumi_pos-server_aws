package com.pos.system.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.model.dto.LoginRequest
import com.pos.system.model.others.Credential
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.Key
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

@Service
class JsonWebTokenService {
    private val logger: Logger = LoggerFactory.getLogger(JsonWebTokenService::class.java)

    // Generate from Encoders.BASE64.encode(Keys.secretKeyFor(SignatureAlgorithm.HS256).encoded)
    @Value("\${pos.app.jwtSecret}")
    lateinit var jwtSecret: String
    @Value("\${pos.app.jwtSecretDefault}")
    lateinit var jwtSecretDefault: String
    @Value("\${pos.app.jwtSecretWeb}")
    lateinit var jwtSecretWeb: String
    fun generateJwt(requestPosToken: LoginRequest?,
                    period: Long = 17,
                    key: Key? = null
    ): String? {
        return try {
            val now = LocalDateTime.now()
            val expirationDate: ZonedDateTime = now.plusYears(period).atZone(ZoneId.systemDefault())
            val creationTime = now.atZone(ZoneId.systemDefault())
            Jwts.builder()
                .setSubject("Auth")
                .setId(UUID.randomUUID().toString())
                .setExpiration(Date.from(expirationDate.toInstant()))
                .setNotBefore(Date.from(creationTime.toInstant()))
                .setIssuer("Luvina")
                .signWith(key ?: this.key, SignatureAlgorithm.HS256)
                .claim("payload", requestPosToken)
                .compact()
        } catch (e: Exception) {
            null
        }
    }

    val key: Key by lazy {
        val keyBytes = Decoders.BASE64.decode(jwtSecret)
        Keys.hmacShaKeyFor(keyBytes)
    }

    val defaultKey: Key by lazy {
        val keyBytes = Decoders.BASE64.decode(jwtSecretDefault)
        Keys.hmacShaKeyFor(keyBytes)
    }

//    val webKey: Key by lazy {
//        val keyBytes = Decoders.BASE64.decode(jwtSecretWeb)
//        Keys.hmacShaKeyFor(keyBytes)
//    }

    fun verifyJwt(jwt: String?, key: Key? = null): Boolean {
        try {
            Jwts.parserBuilder().setSigningKey(key ?: this.key).build().parse(jwt)
            return true
        } catch (e: Exception) {
            logger.error(e.message)
            return false
        }
    }

    fun decodeJwt(jwt: String?, key: Key? = null): Credential? {
        try {
            if (jwt == null) return null
            val body = Jwts.parserBuilder().setSigningKey(key ?: this.key).build()
                .parseClaimsJws(jwt).body
            val mapper = ObjectMapper()
            return mapper.convertValue(body, Credential::class.java)
        } catch (e: Exception) {
            logger.error(e.message)
            return null
        }
    }
}