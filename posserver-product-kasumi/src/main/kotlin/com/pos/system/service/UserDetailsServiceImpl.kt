package com.pos.system.service

import com.pos.system.exception.BadRequest
import com.pos.system.exception.NotFound
import com.pos.system.exception.UnAuthorized
import com.pos.system.repository.StoreMasterRepository
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserDetailsServiceImpl (val storeMasterRepository: StoreMasterRepository) : UserDetailsService2 {

    override fun loadUserByUsername(company: String?, store: String?): UserDetails {
        if (company == null || store == null) throw UnAuthorized()
        val storeModel = storeMasterRepository.findAllStoreMaster(company, store)
        val roles = setOf<GrantedAuthority>(SimpleGrantedAuthority("ROLE_USER"))
        if (storeModel != null)
            return User(storeModel.companyCode, storeModel.companyCode, roles)
        else throw UnAuthorized()
    }

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserDetails {
        //TODO
        throw UsernameNotFoundException("Employee not found with username: $username")
    }
}
