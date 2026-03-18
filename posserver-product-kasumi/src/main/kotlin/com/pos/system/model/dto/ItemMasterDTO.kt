package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal


class RequestItemInfo(
    @NotNull
    @JsonProperty("company_code")
    val companyCode: String?,
    @NotNull
    @JsonProperty("store_code")
    val storeCode: String?,
    @NotNull
    @JsonProperty("item_code")
    val itemCode: String?
)

data class ResponseItemInfo(
    @JsonProperty("company_code")
    var companyCode: String?,
    @JsonProperty("store_code")
    var storeCode: String?,
    @JsonProperty("item_code")
    var itemCode: String?,
    @JsonProperty("item_price")
    var itemPrice: BigDecimal?,
    @JsonProperty("parent_code")
    var parentCode: String?,
    @JsonProperty("description")
    var description: String?,
    @JsonProperty("sub_description")
    var subDescription: String?
)

data class ResponsePlu(
    @JsonProperty("item_scan_code")
    val itemScanCode: String?,
    @JsonProperty("item_code")
    val itemCode: String?,
    @JsonProperty("item_category")
    val itemCategory: String?,
    @JsonProperty("item_name")
    val itemName: String?,
    @JsonProperty("item_unit_price_fmt")
    val itemUnitPriceFmt: String?,
    @JsonProperty("item_unit_discount_price_fmt")
    val itemUnitDiscountPriceFmt: String?,
    @JsonProperty("item_unit_source_price")
    val itemUnitSourcePrice: String?,
    @JsonProperty("unit_price_tax_included_notation")
    val unitPriceTaxIncludedNotation: String?
)

data class RequestTransactionId(
    @JsonProperty("practice_mode")
    var practiceMode: Boolean = false
)

data class RequestPlu(
    @JsonProperty("transaction_id")
    var transactionId: String?,
    @JsonProperty("scan_code")
    var scanCode: String?
)

data class ResponseTransactionId(
    @JsonProperty("transaction_id")
    var transactionId: String?
)

data class RequestSalesSuspended(
    @JsonProperty("transaction_id")
    var transactionId: String?
)