package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

class InfoUpdateRequest {
        @NotNull(message = "app_versionは必須入力です。")
        @JsonProperty("app_version")
        var appVersion: String? = null

        @JsonProperty("os_version")
        var osVersion: String? = null

        @JsonProperty("app_id")
        var appId: String? = null
}

class InfoUpdateResponse(
        @JsonProperty("company_code")
        var companyCode: String? = null,
        @JsonProperty("store_code")
        var storeCode: String? = null,
        @JsonProperty("instore_code")
        var inStoreCode: String? = null,
        @JsonProperty("file_name")
        var fileName: String
)

data class PosInfo(
        var companyCode: String = "",
        var storeCode: String = "",
        var inStoreCode: String = ""
)


data class ClassInfo(@JsonProperty("class_info") val classInfo : Int? = null,
                     @JsonProperty("difference") val differenceModel: DifferenceModel? = null,
                     @JsonProperty("receipt_no") val receiptNo: String? = null
        )

