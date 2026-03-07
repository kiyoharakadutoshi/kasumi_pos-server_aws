package com.pos.system.security.role

import org.springframework.security.core.GrantedAuthority

class UserAuthority : GrantedAuthority {
    override fun getAuthority(): String {
        return "ROLE_USER"
    }
}
