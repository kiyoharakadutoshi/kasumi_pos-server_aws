package com.pos.system.controllers.v1

import com.pos.system.common.config.CoderConfigs
import com.pos.system.common.util.Util.dataToken
import com.pos.system.exception.BadRequest
import com.pos.system.exception.NotFound
import com.pos.system.model.dto.*
import com.pos.system.service.JsonWebTokenService
import com.pos.system.service.LoginService
import com.pos.system.service.PosAppService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/pos/v1/")
class AuthenticationController(private val jwtService: JsonWebTokenService,
                               private val pwEncoderConfig: CoderConfigs,
                               private val posAppService: PosAppService,
                               private val loginService: LoginService

) {

    @PostMapping(value = ["employee/get"])
    @ResponseStatus(HttpStatus.OK)
    fun getEmployee(@Valid @RequestBody data: EmployeeRequest?,
                    bdResult: BindingResult):
        EmployeeResponse {
        val model = dataToken
        if (model == null || data == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        return posAppService.getEmployee(model, data).toEmployeeRequest()
    }

    @PostMapping(value = ["/pos-token"])
    @ResponseStatus(HttpStatus.OK)
    fun getPosToken(
        @Valid @RequestBody data: LoginRequest?,
        bdResult: BindingResult
    ): PosToken {
        if (data == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        posAppService.findStore(data.companyCode, data.storeCode) ?: throw NotFound()
        return PosToken(jwtService.generateJwt(data))
    }

    @PostMapping(value = ["/login"])
    @ResponseStatus(HttpStatus.OK)
    fun login(
        @Valid @RequestBody data: RequestLogin?,
        bdResult: BindingResult
    ): ResponseLogin? {
        if (data == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        return (loginService.checkRequestLogin(data.employeeCode!!, data.password!!) ?: throw NotFound("Not Found"))
    }
}