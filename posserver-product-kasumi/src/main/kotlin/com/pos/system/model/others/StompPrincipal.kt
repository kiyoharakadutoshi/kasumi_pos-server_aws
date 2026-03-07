package com.pos.system.model.others

import com.pos.system.model.dto.LoginRequest
import java.security.Principal

class StompPrincipal(@JvmField val name: String,
                     val macAddress: String? = null,
                     val loginRequest: LoginRequest? = null) : Principal {
    override fun getName(): String {
        return name
    }

}

class ItemPair<F, S>(var first: F, var second: S? = null)
