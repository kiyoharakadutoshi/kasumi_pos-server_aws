package com.pos.system.model.others

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class ResponsePayment(
        @JsonProperty("payment")
        val payment: Payment?,

        @JsonProperty("meta")
        val meta: Meta?,

        @JsonProperty("employee")
        val employee: Employee?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Payment(
        @JsonProperty("payment_total_price")
        val paymentTotalPrice: Int? = 0,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Meta(
        @JsonProperty("receipt_no")
        val receiptNo: String? = null,

        @JsonProperty("business_date")
        val businessDate: String? = null,

        @JsonProperty("transaction_datetime_receipt_fmt")
        val transactionDatetimeReceiptFmt: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Employee(
        @JsonProperty("code")
        val code: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JournalResponse(
        @JsonProperty("journal")
        val journal: String?
)



