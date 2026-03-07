package com.pos.system.service

import com.pos.system.exception.UnAuthorized
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService

interface UserDetailsService2: UserDetailsService {

    @Throws(UnAuthorized::class)
    fun loadUserByUsername(company: String?, store: String?): UserDetails

}