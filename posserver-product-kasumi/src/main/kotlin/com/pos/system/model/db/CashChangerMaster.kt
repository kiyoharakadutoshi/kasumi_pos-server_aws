package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.annotation.Nullable
import jakarta.persistence.*
import org.jetbrains.annotations.NotNull
import java.time.LocalDateTime

@Entity
@Table(name = "CashChangerMaster")
class CashChangerMaster : BaseColumns() {
    @NotNull
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns(value = [
        JoinColumn(name = "MASK_RECORD_ID", referencedColumnName = "RECORD_ID")
    ])
    var cashChangerMaskMaster: CashChangerMaskMaster? = null

    @Column(name = "ScreenID")
    @Enumerated(EnumType.ORDINAL)
    var screenID: ScreenID = ScreenID.NONE

    @Column(name = "Count10000")
    var count10000: Int = 0

    @Column(name = "Count5000")
    var count5000: Int = 0

    @Column(name = "Count2000")
    var count2000: Int = 0

    @Column(name = "Count1000")
    var count1000: Int = 0

    @Column(name = "Count500")
    var count500: Int = 0

    @Column(name = "Count100")
    var count100: Int = 0

    @Column(name = "Count50")
    var count50: Int = 0

    @Column(name = "Count10")
    var count10: Int = 0

    @Column(name = "Count5")
    var count5: Int = 0

    @Column(name = "Count1")
    var count1: Int = 0

    @Column(name = "TotalCount")
    var totalCount: Long = 0

    @Column(name = "currentCount10000")
    var currentCount10000: Int = 0

    @Column(name = "CurrentCount5000")
    var currentCount5000: Int = 0

    @Column(name = "CurrentCount2000")
    var currentCount2000: Int = 0

    @Column(name = "CurrentCount1000")
    var currentCount1000: Int = 0

    @Column(name = "CurrentCount500")
    var currentCount500: Int = 0

    @Column(name = "CurrentCount100")
    var currentCount100: Int = 0

    @Column(name = "CurrentCount50")
    var currentCount50: Int = 0

    @Column(name = "CurrentCount10")
    var currentCount10: Int = 0

    @Column(name = "CurrentCount5")
    var currentCount5: Int = 0

    @Column(name = "CurrentCount1")
    var currentCount1: Int = 0

    @Column(name = "TotalCurrentCount")
    var totalCurrentCount: Long = 0
}

@Entity
@Table(name = "CashChangerMaskMaster")
class CashChangerMaskMaster : BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "InstoreCode")
    var instoreCode: String? = null

    @Nullable
    @Column(nullable = false, name = "ApplyDate")
    var applyDate: LocalDateTime? = null

    @JsonIgnore
    @OneToMany(mappedBy = "cashChangerMaskMaster", fetch = FetchType.LAZY,
            cascade = [CascadeType.ALL])
    var listCashChangerMaster: List<CashChangerMaster>? = null
}

enum class ScreenID(val value: Int) {
    NONE(0),
    ID284(1),
    ID285(2),
    ID40(3),
    ID25(4),
    ID2130(5)
}