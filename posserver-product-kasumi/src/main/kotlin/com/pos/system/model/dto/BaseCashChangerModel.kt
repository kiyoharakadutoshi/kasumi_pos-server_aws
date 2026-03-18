package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.pos.system.model.db.CashChangerMaster
import jakarta.validation.constraints.NotNull

open class BaseCashChangerModel {

    @NotNull
    @JsonProperty("count_10000")
    var count10000: Int = 0

    @NotNull
    @JsonProperty("count_5000")
    var count5000: Int = 0

    @NotNull
    @JsonProperty("count_2000")
    var count2000: Int = 0

    @NotNull
    @JsonProperty("count_1000")
    var count1000: Int = 0

    @NotNull
    @JsonProperty("count_500")
    var count500: Int = 0


    @NotNull
    @JsonProperty("count_100")
    var count100: Int = 0

    @NotNull
    @JsonProperty("count_50")
    var count50: Int = 0

    @NotNull
    @JsonProperty("count_10")
    var count10: Int = 0

    @NotNull
    @JsonProperty("count_5")
    var count5: Int = 0

    @NotNull
    @JsonProperty("count_1")
    var count1: Int = 0

    @get:JsonIgnore
    val toList: List<Pair<Int, Int>> get() = listOf(Pair(10_000, count10000),
        Pair(5_000, count5000),
        Pair(2_000, count2000),
        Pair(1_000, count1000),
        Pair(500, count500),
        Pair(100, count100),
        Pair(50, count50),
        Pair(10, count10),
        Pair(5, count5),
        Pair(1, count1)
    )

    @get:JsonIgnore
    val toCashChangerMaster: CashChangerMaster get() {
        val model = CashChangerMaster()
        model.count10000 = count10000
        model.count5000 = count5000
        model.count2000 = count2000
        model.count1000 = count1000
        model.count500 = count500
        model.count100 = count100
        model.count50 = count50
        model.count10 = count10
        model.count5 = count5
        model.count1 = count1
        return model
    }

    fun updateCurrentCount(model: CashChangerMaster) {
        model.currentCount10000 = count10000
        model.currentCount5000 = count5000
        model.currentCount2000 = count2000
        model.currentCount1000 = count1000
        model.currentCount500 = count500
        model.currentCount100 = count100
        model.currentCount50 = count50
        model.currentCount10 = count10
        model.currentCount5 = count5
        model.currentCount1 = count1
    }

    @get:JsonIgnore()
    val total: Long get() = toList.sumOf { (unit, quantity) -> unit * quantity }.toLong()
}

class CashChangerReplenishModel : BaseCashChangerModel() {

    @NotNull
    var replenish: BaseCashChangerModel? = null
}

class CashChangerRecoverModel : BaseCashChangerModel() {
    @JsonProperty("when")
    @NotNull
    var whenMode:String? = null

    @NotNull
    var recover: BaseCashChangerModel? = null
}