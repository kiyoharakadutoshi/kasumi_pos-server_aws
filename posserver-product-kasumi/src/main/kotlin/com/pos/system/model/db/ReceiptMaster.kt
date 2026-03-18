package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "receiptmaster")
class ReceiptMaster : BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    @JsonProperty("company_code")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    @JsonProperty("store_code")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "InstoreCode")
    @JsonProperty("instore_code")
    var instoreCode: String? = null

    @NotNull
    @Column(nullable = false, name = "ReceiptCreateDate")
    @JsonProperty("receipt_create_date")
    var receiptCreateDate: String? = null

    @NotNull
    @Column(nullable = false, name = "ReceiptCreateTime")
    @JsonProperty("receipt_create_time")
    var receiptCreateTime: String? = null

    @NotNull
    @Column(nullable = false, length = 18, name = "ReceiptNo")
    @JsonProperty("receipt_no")
    var receiptNo: String? = null

    @Column(nullable = false, length = 16, name = "EmployeeCode")
    @JsonProperty("employee_code")
    var employeeCode: String? = null

    @NotNull
    @Column(nullable = false, name = "LogID")
    @JsonProperty("log_id")
    var logID: Long = 0
}

class ResponseAllReceipt {
    @JsonProperty("number_of_record")
    var numberOfRecord: Int = 0

    @JsonProperty("list_receipt")
    var listReceipt: List<ReceiptMaster>? = null
}