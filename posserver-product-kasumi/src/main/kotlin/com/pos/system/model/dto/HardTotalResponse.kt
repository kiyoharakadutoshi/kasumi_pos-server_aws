package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.io.Serializable

data class HardTotalResponse(
    @JsonProperty("company_code")
    val companyCode: String? = null,
    @JsonProperty("store_code")
    val storeCode: String? = null,
    @JsonProperty("instore_code")
    val inStoreCode: String? = null,
    @JsonProperty("cashchanger_register")
    val cashChangerRegister: Int? = null,
    @JsonProperty("cashchanger_register_fmt")
    var cashChangerRegisterFmt: String? = null,
    @JsonProperty("sales_cash")
    var salesCash: Int? = null,
    @JsonProperty("sales_cash_fmt")
    var salesCashFmt: String? = null
): Serializable