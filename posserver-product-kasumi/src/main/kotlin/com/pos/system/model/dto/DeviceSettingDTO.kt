package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

class DeviceSettingRequest {

    @NotNull(message = "company_codeは必須入力です。1")
    @NotBlank(message = "company_codeは必須入力です。2")
    @JsonProperty("company_code")
    var companyCode: String? = null

    @NotNull(message = "store_codeは必須入力です。")
    @NotBlank(message = "store_codeは必須入力です。")
    @JsonProperty("store_code")
    var storeCode: String? = null

    @NotNull(message = "instore_codeは必須入力です。")
    @NotBlank(message = "instore_codeは必須入力です。")
    @JsonProperty("instore_code")
    var inStoreCode: String? = null
}