package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.pos.system.common.util.Constants
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

class ReceiptRequestModel : BaseStoreMaster() {
    @JsonProperty("start_date")
    var startDate: String = Constants.BLANK

    @JsonProperty("end_date")
    var endDate: String = Constants.BLANK

    @JsonProperty("start_time")
    var startTime: String = Constants.BLANK

    @JsonProperty("end_time")
    var endTime: String = Constants.BLANK

    @JsonProperty("start_receipt_no")
    var startReceiptNo: String = Constants.BLANK

    @JsonProperty("end_receipt_no")
    var endReceiptNo: String = Constants.BLANK

    @JsonProperty("employee_code")
    var employeeCode: String = Constants.BLANK

    @JsonProperty("limit")
    var limit: Int = 0

    @JsonProperty("offset")
    var offset: Int = 0
}

class ReceiptRequestData {
    @JsonProperty("log_id")
    var logID: Long = 0
}

open class BaseStoreMaster {
    @NotNull
    @NotBlank
    @Size(min = 1, max = 10)
    @JsonProperty("company_code")
    var companyCode: String? = null

    @NotNull
    @NotBlank
    @Size(min = 1, max = 10)
    @JsonProperty("store_code")
    var storeCode: String? = null
}