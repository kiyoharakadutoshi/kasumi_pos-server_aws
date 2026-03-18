package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "cashchangersettingmaster")
class CashChangerSetting {
    @Id
    @Column(name = "RecordId")
    @JsonIgnore
    @GeneratedValue(strategy = GenerationType.AUTO)
    var recordId: Int = 0

    @NotNull
    @Column(nullable = false, name = "CompanyCode")
    @JsonProperty("company_code")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, name = "StoreCode")
    @JsonProperty("store_code")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, name = "InStoreCode")
    @JsonProperty("instore_code")
    var inStoreCode: String? = null

    @NotNull
    @Column(nullable = false, name = "Status")
    @JsonProperty("status")
    var status: Int? = 0

    @Column(name = "Count10000")
    @JsonProperty("count_10000")
    var count10000: Int? = 0

    @Column(name = "Count5000")
    @JsonProperty("count_5000")
    var count5000: Int? = 0

    @Column(name = "Count2000")
    @JsonProperty("count_2000")
    var count2000: Int? = 0

    @Column(name = "Count1000")
    @JsonProperty("count_1000")
    var count1000: Int? = 0

    @Column(name = "Count500")
    @JsonProperty("count_500")
    var count500: Int? = 0

    @Column(name = "Count100")
    @JsonProperty("count_100")
    var count100: Int? = 0

    @Column(name = "Count50")
    @JsonProperty("count_50")
    var count50: Int? = 0

    @Column(name = "Count10")
    @JsonProperty("count_10")
    var count10: Int? = 0

    @Column(name = "Count5")
    @JsonProperty("count_5")
    var count5: Int? = 0

    @Column(name = "Count1")
    @JsonProperty("count_1")
    var count1: Int? = 0

    @Column(name = "Cassette")
    @JsonProperty("cassette")
    var cassette: Int? = 0

    @Column(name = "DeleteFlag")
    @JsonProperty("delete_flag")
    var deleteFlag: Int? = 0

    @Column(name = "RegisterDatetime")
    @JsonProperty("register_datetime")
    var registerDatetime: String? = null

    @Column(name = "RegisterPGID")
    @JsonProperty("register_pgid")
    var registerPGID: String? = null

    @Column(name = "UpdateDatetime")
    @JsonProperty("update_datetime")
    var updateDatetime: String? = null

    @Column(name = "UpdatePGID")
    @JsonProperty("update_pgid")
    var updatePGID: String? = null
}