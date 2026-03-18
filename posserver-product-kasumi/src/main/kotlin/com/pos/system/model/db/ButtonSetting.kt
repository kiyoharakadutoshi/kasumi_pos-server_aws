package com.pos.system.model.db

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "buttonsetting")
class ButtonSetting : BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "InstoreCode")
    var inStoreCode: String? = null

    @NotNull
    @Column(nullable = false, name = "ServiceClass")
    var serviceClass: Int? = null

    @NotNull
    @Column(nullable = false, name = "PivotY")
    var pivotY: Int? = null

    @NotNull
    @Column(nullable = false, name = "PivotX")
    var pivotX: Int? = null

    @NotNull
    @Column(nullable = false, name = "Width")
    var width: Int? = null

    @NotNull
    @Column(nullable = false, name = "Height")
    var height: Int? = null

    @Column(nullable = false, name = "TextSize")
    var textSize: Int? = null
}