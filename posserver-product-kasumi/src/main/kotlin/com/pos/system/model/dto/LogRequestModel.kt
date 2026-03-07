package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonSetter
import com.fasterxml.jackson.annotation.Nulls

class LogRequestModel {

    @JsonProperty("ip_address")
    var ipAddress: String? = null

    @JsonProperty("url")
    var url: String? = null

    @JsonProperty("headers")
    var headers: Map<String, List<String>>? = null

    @JsonProperty("request")
    var request: String? = null

    @JsonProperty("response_code")
    var responseCode: Int? = null

    @JsonProperty("response")
    var response: String? = null

    @JsonProperty("mac_address")
    var macAddress: String? = null

    @JsonProperty("record_timestamp")
    var recordTimestamp: Long? = null

    @JsonProperty("environment")
    var environment: String? = null

    @JsonProperty("difference")
    var difference: DifferenceModel? = null

    // for app conlux
    @JsonProperty("is_updated")
    var isUpdated: Boolean = false

    fun getAuthorization() = headers?.get("authorization")?.firstOrNull() ?: headers?.get("Authorization")?.firstOrNull()
}

class DifferenceModel {
    @JsonProperty("difference_10000")
    var difference10000: Int = 0

    @JsonProperty("difference_5000")
    var difference5000: Int = 0

    @JsonProperty("difference_2000")
    var difference2000: Int = 0

    @JsonProperty("difference_1000")
    var difference1000: Int = 0

    @JsonProperty("difference_500")
    var difference500: Int = 0

    @JsonProperty("difference_100")
    var difference100: Int = 0

    @JsonProperty("difference_50")
    var difference50: Int = 0

    @JsonProperty("difference_10")
    var difference10: Int = 0

    @JsonProperty("difference_5")
    var difference5: Int = 0

    @JsonProperty("difference_1")
    var difference1: Int = 0

    @JsonProperty("drawer_500")
    var drawer500: Int = 0

    @JsonProperty("drawer_100")
    var drawer100: Int = 0

    @JsonProperty("drawer_50")
    var drawer50: Int = 0

    @JsonProperty("drawer_10")
    var drawer10: Int = 0

    @JsonProperty("drawer_5")
    var drawer5: Int = 0

    @JsonProperty("drawer_1")
    var drawer1: Int = 0
}

@JsonIgnoreProperties(ignoreUnknown = true)
class VerificateRequestModel : BaseCashChangerModel() {
    @JsonProperty("when")
    var whenVerificate: String = ""
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    @JsonProperty("another_location")
    var anotherLocation = BaseCashChangerModel()
    @JsonProperty("other_cash")
    var otherCash: Int = 0
    @JsonProperty("init_amount")
    var initAmount: Int = 0
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    @JsonProperty("stick_count")
    var stickCount = BaseCashChangerModel()
}