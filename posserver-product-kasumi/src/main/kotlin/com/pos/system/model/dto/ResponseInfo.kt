package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.io.Serializable

data class PosTokenResponse(
    @JsonProperty("company_code")
    val companyCode: String = "",
    @JsonProperty("store_code")
    val storeCode: String = "",
    @JsonProperty("instore_code")
    val instoreCode: String = "",
    @JsonProperty("os_type")
    val osType: String? = null,
    @JsonProperty("os_version")
    val osVersion: String? = null,
    @JsonProperty("app_version")
    val appVersion: String? = null
) : Serializable

data class PosToken(
    @JsonProperty("pos_token")
    val posToken: String? = null
)

data class PresetStoreResponse(
    @JsonProperty("company_code")
    val companyCode: String? = null,
    @JsonProperty("store_code")
    val storeCode: String? = null,
    @JsonProperty("store_name")
    val storeName: String? = null,
)

data class ButtonSetting(
    @JsonProperty("service_class")
    var serviceClass: Int? = null,
    @JsonProperty("pivot_y")
    var pivotY: Int? = null,
    @JsonProperty("pivot_x")
    var pivotX: Int? = null,
    @JsonProperty("width")
    var width: Int? = null,
    @JsonProperty("height")
    var height: Int? = null,
    @JsonProperty("text_size")
    var textSize: Int? = null,
)
