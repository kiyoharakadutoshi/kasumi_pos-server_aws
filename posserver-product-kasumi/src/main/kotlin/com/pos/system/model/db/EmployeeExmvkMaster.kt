package com.pos.system.model.db

import jakarta.persistence.*
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "employeeexmvkmaster")
class EmployeeExmvkMaster: BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 16, name = "EmployeeCode")
    var employeeCode: String? = null

    @Column(length = 20, name = "Password")
    var password: String? = null

}