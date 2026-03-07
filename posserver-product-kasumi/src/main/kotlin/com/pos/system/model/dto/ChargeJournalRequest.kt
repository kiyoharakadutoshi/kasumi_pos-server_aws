package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

class ChargeJournalRequest {
    @NotNull
    @JsonProperty(value = "mode")
    var mode: String = "close"
    @NotNull
    @JsonProperty(value = "amount")
    var amount: Int = 0
    @NotNull
    @JsonProperty(value = "other_cash")
    var otherCash: Int = 0
    @NotNull
    @JsonProperty(value = "init_amount")
    var initAmount: Int = 0
}