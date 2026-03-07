package com.pos.system.service

import com.pos.system.common.config.CoderConfigs
import com.pos.system.exception.InternalServerError
import com.pos.system.model.db.EmployeeExmvkMaster
import com.pos.system.model.dto.LoginRequest
import com.pos.system.model.dto.ResponseLogin
import com.pos.system.repository.EmployeeExmvkMasterRepository
import org.springframework.stereotype.Service

@Service
class LoginService(
    private val pwEncoderConfig: CoderConfigs,
    private val employeeExmvkMasterRepository: EmployeeExmvkMasterRepository,
    private val jwtService: JsonWebTokenService
) {
    private fun getInfoAccount(employeeCode: String, password: String): EmployeeExmvkMaster? {
        try {
            val employee = employeeExmvkMasterRepository.findFirstByEmployeeCode(
                employeeCode,
            )
            return if (employee?.password == null || !pwEncoderConfig.passwordEncoder()
                    .matches(password, employee.password)
            ) null else employee
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }

    fun checkRequestLogin(employeeCode: String, password: String): ResponseLogin? {
        try {
            val loginInfo = getInfoAccount(employeeCode, password)
            return if (loginInfo == null) {
                null
            } else {
                val info = employeeExmvkMasterRepository.getInfoLogin(
                    loginInfo.employeeCode ?: "",
                    loginInfo.companyCode ?: "",
                    loginInfo.storeCode ?: ""
                ) ?: return  null
                ResponseLogin(
                    companyCode = info.companyCode,
                    storeCode = info.storeCode,
                    branchName = info.branchName,
                    employeeCode = info.employeeCode,
                    employeeName = info.employeeName,
                    role = info.role,
                    token = jwtService.generateJwt(LoginRequest().apply {
                        companyCode = info.companyCode ?: ""
                        storeCode = info.storeCode ?: ""
                        this.employeeCode = info.employeeCode ?: ""
                    })
                )
            }
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }

}