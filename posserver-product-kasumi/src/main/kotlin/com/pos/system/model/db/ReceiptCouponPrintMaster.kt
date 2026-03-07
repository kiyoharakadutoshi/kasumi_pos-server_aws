package com.pos.system.model.db

import jakarta.persistence.*
import org.jetbrains.annotations.NotNull
import java.math.BigDecimal
import java.time.OffsetDateTime

@Entity
@Table(name = "receiptcouponprintmaster")
class ReceiptCouponPrintMaster: BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 26, name = "ReceiptCouponCode")
    var receiptCouponCode: String? = null

    @NotNull
    @Column(nullable = false, name = "PrintFrom")
    var printFrom: OffsetDateTime? = null

    @NotNull
    @Column(nullable = false, name = "PrintTo")
    var printTo: OffsetDateTime? = null

    @NotNull
    @Column(nullable = false, name = "StartDate")
    var startDate: OffsetDateTime? = null

    @NotNull
    @Column(nullable = false, name = "EndDate")
    var endDate: OffsetDateTime? = null

    @NotNull
    @Column(nullable = false, precision = 23, scale = 4, name = "TicketingAmount")
    var ticketingAmount: BigDecimal? = null

    @NotNull
    @Column(nullable = false, length = 2, name = "PrintConditionCode")
    var printConditionCode: String? = null

    @NotNull
    @Column(nullable = false, name = "ReceiptTypeCode")
    var receiptTypeCode: Boolean? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "ConditionsKey")
    var conditionsKey: String? = null

    @NotNull
    @Column(nullable = false, length = 500, name = "Title")
    var title: String? = null

    @NotNull
    @Column(nullable = false, name = "MessagePosition")
    var messagePosition: Int? = null

    @NotNull
    @Column(nullable = false, name = "MessageLineNo")
    var messageLineNo: Int? = null

    @NotNull
    @Column(nullable = false, length = 1000, name = "Message")
    var message: String? = null

    @NotNull
    @Column(nullable = false, name = "MessageFontType")
    var messageFontType: Int? = null

}