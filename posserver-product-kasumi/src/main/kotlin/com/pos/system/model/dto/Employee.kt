package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class EmployeeRequest(
        @NotNull
        @NotBlank
        @JsonProperty("employee_code")
        var employeeCode: String?
)

data class EmployeeResponse(var code: String?, var name: String?)

data class RequestLogin(
        @NotNull
        @NotBlank
        @JsonProperty("employee_code")
        var employeeCode: String?,

        @NotNull
        @NotBlank
        @JsonProperty("password")
        var password: String?
)

data class InfoLogin(
        var companyCode: String? = null,
        var storeCode: String? = null,
        var branchName: String? = null,
        var employeeCode: String? = null,
        var employeeName: String? = null,
        var role: String? = null
)

data class ResponseLogin(
        @JsonProperty("company_code")
        var companyCode: String? = null,

        @JsonProperty("store_code")
        var storeCode: String? = null,

        @JsonProperty("branch_name")
        var branchName: String? = null,

        @JsonProperty("employee_code")
        var employeeCode: String? = null,

        @JsonProperty("employee_name")
        var employeeName: String? = null,

        @JsonProperty("role")
        var role: String? = null,

        @JsonProperty("token")
        var token: String? = null
)