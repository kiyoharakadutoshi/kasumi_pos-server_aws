package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*
import java.sql.Timestamp

@Entity
@Table(name = "charge_info")
class ChargeInfo: BaseColumns() {
    @JsonProperty("company_code")
    @Column(table = "charge_info", name = "CompanyCode", length = 10)
    var companyCode: String? = null

    @JsonProperty("store_code")
    @Column(table = "charge_info", name = "StoreCode", length = 10)
    var storeCode: String? = null

    @JsonProperty("instore_code")
    @Column(table = "charge_info", name = "InstoreCode", length = 10)
    var instoreCode: String? = null

    @JsonProperty("record_datetime")
    @Column(table = "charge_info", name = "RecordDatetime")
    var recordDatetime: Int? = null

    @JsonProperty("receipt_no")
    @Column(table = "charge_info", name = "ReceiptNo", length = 10)
    var receiptNo: String? = null

    @Enumerated(EnumType.ORDINAL)
    @JsonProperty("class")
    @Column(table = "charge_info", name = "Class")
    var classInfo: ClassType = ClassType.NONE

    @JsonProperty("amount")
    @Column(table = "charge_info", name = "Amount")
    var amount: Int = 0

    @JsonProperty("inspection_datetime")
    @Column(table = "charge_info", name = "InspectionDatetime")
    var inspectionDatetime: Timestamp? = null
}

enum class ClassType(val value: Int) {
    NONE(0),
    Flow284(1),
    Flow285(2),
    Flow40(3),
    Flow25(4),
    Flow23(5),
    Flow2130(6);

    companion object {
        fun init(value: Int) = values().firstOrNull { it.value == value } ?: NONE
    }
}

@Entity
@Table(name = "charge_receipt_no")
class ChargerReceiptNo: BaseColumns() {
    @JsonProperty("company_code")
    @Column(name = "CompanyCode", length = 10)
    var companyCode: String? = null

    @JsonProperty("store_code")
    @Column(name = "StoreCode", length = 10)
    var storeCode: String? = null

    @JsonProperty("instore_code")
    @Column(name = "InstoreCode", length = 10)
    var instoreCode: String? = null

    @JsonProperty("receipt_no")
    @Column(name = "ReceiptNo", length = 10)
    var receiptNo: String? = null
}

@Entity
@Table(name = "pos_trans")
class PosTrans: BaseColumns() {
    @JsonProperty("company_code")
    @Column(table = "pos_trans", name = "CompanyCode", length = 10)
    var companyCode: String? = null

    @JsonProperty("store_code")
    @Column(table = "pos_trans", name = "StoreCode", length = 10)
    var storeCode: String? = null

    @JsonProperty("instore_code")
    @Column(table = "pos_trans", name = "InstoreCode", length = 10)
    var instoreCode: String? = null

    @JsonIgnore
    @Column(table = "pos_trans", name = "RecordDatetime")
    var recordDatetime: Timestamp? = null

    @JsonIgnore
    @Column(table = "pos_trans", name = "ReceiptNo", length = 10)
    var receiptNo: String? = null

    @JsonIgnore
    @Column(table = "pos_trans", name = "Class")
    var classInfo: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference1000")
    var difference1000: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference2000")
    var difference2000: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference5000")
    var difference5000: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference10000")
    var difference10000: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference500")
    var difference500: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference100")
    var difference100: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference50")
    var difference50: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference10")
    var difference10: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference5")
    var difference5: Int = 0

    @JsonIgnore
    @Column(table = "pos_trans", name = "Difference1")
    var difference1: Int = 0

    @JsonProperty("count_1000")
    @Column(table = "pos_trans", name = "Count1000")
    var count1000: Int = 0

    @JsonProperty("count_2000")
    @Column(table = "pos_trans", name = "Count2000")
    var count2000: Int = 0

    @JsonProperty("count_5000")
    @Column(table = "pos_trans", name = "Count5000")
    var count5000: Int = 0

    @JsonProperty("count_10000")
    @Column(table = "pos_trans", name = "Count10000")
    var count10000: Int = 0

    @JsonProperty("count_500")
    @Column(table = "pos_trans", name = "Count500")
    var count500: Int = 0

    @JsonProperty("count_100")
    @Column(table = "pos_trans", name = "Count100")
    var count100: Int = 0

    @JsonProperty("count_50")
    @Column(table = "pos_trans", name = "Count50")
    var count50: Int = 0

    @JsonProperty("count_10")
    @Column(table = "pos_trans", name = "Count10")
    var count10: Int = 0

    @JsonProperty("count_5")
    @Column(table = "pos_trans", name = "Count5")
    var count5: Int = 0

    @JsonProperty("count_1")
    @Column(table = "pos_trans", name = "Count1")
    var count1: Int = 0

    @JsonProperty("drawer_500")
    @Column(table = "pos_trans", name = "Drawer500")
    var drawer500: Int = 0

    @JsonProperty("drawer_100")
    @Column(table = "pos_trans", name = "Drawer100")
    var drawer100: Int = 0

    @JsonProperty("drawer_50")
    @Column(table = "pos_trans", name = "Drawer50")
    var drawer50: Int = 0

    @JsonProperty("drawer_10")
    @Column(table = "pos_trans", name = "Drawer10")
    var drawer10: Int = 0

    @JsonProperty("drawer_5")
    @Column(table = "pos_trans", name = "Drawer5")
    var drawer5: Int = 0

    @JsonProperty("drawer_1")
    @Column(table = "pos_trans", name = "Drawer1")
    var drawer1: Int = 0

    fun getTotalCountMoney(): Int {
        return count10000 * 10_000 + count5000 * 5_000 + count2000 * 2_000 +
                    count1000 * 1_000 + count500 * 500 + count100 * 100 +
                    count50 * 50 + count10 * 10 + count5 * 5 + count1
    }
}