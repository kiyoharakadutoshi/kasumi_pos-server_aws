package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.modelmapper.internal.bytebuddy.implementation.bind.annotation.IgnoreForBinding

@JsonIgnoreProperties(ignoreUnknown = true)
class LoginRequest {
    @NotNull
    @NotBlank
    @JsonProperty("company_code")
    var companyCode: String = ""
    @NotNull
    @NotBlank
    @JsonProperty("store_code")
    var storeCode: String = ""
    @NotNull
    @NotBlank
    @JsonProperty("instore_code")
    var inStoreCode: String = ""
    @JsonProperty("employee_code")
    var employeeCode: String = ""
    @JsonProperty("os_type")
    var osType: String = ""
    @JsonProperty("android")
    var android: String = ""
    @JsonProperty("os_version")
    var osVersion: String = ""
    @JsonProperty("app_version")
    var appVersion: String = ""
    @JsonProperty("mac_address")
    var macAddress: String = ""
    @JsonProperty("ip_address")
    var ipAddress: String = ""


    @IgnoreForBinding
    @JsonIgnore
    fun isAccountDefault() = companyCode == "000" && storeCode == "000000" && (inStoreCode == "000000" || inStoreCode == "000")

    @IgnoreForBinding
    @JsonIgnore
    fun setValueDefault() {
        companyCode = "000"
        storeCode = "000000"
        inStoreCode = "000"
    }
}