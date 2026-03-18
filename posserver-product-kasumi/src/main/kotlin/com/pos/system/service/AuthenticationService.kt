package com.pos.system.service

import com.pos.system.security.role.UserAuthority
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.stereotype.Service
import java.util.*

@Service
class AuthenticationService : AuthenticationUserDetailsService<PreAuthenticatedAuthenticationToken> {

    @Autowired
    lateinit var jsonWebTokenService: JsonWebTokenService

    @Throws(UsernameNotFoundException::class)
    override fun loadUserDetails(token: PreAuthenticatedAuthenticationToken): UserDetails {
        val credentials = token.credentials.toString()
//        if (credentials.isEmpty()) {
//            throw BadCredentialsException("Bad credential")
//        }
//        if (!jsonWebTokenService.verifyJwt(credentials)) {
//            throw BadCredentialsException("Bad credential")
//        }
//        val credential = jsonWebTokenService.decodeJwt(credentials)
//        val userId = credential?.userId
//        val userUuid = credential?.uuid
//        if (userId == null || userUuid == null) {
//            throw BadCredentialsException("Bad credential")
//        }
//        userService.getUserByIdAndUserUuid(userId, userUuid) ?: throw UsernameNotFoundException("Not found user")
        val authorities = HashSet<GrantedAuthority>()
        authorities.add(UserAuthority())
//        return User(userUuid, "", authorities)
        return User(UUID.randomUUID().toString(), "", authorities)
    }
}


