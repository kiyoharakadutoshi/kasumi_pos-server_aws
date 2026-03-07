package com.pos.system.model.db

import com.pos.system.model.dto.EmployeeResponse
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "employeemaster")
class EmployeeMaster : BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 16, name = "EmployeeCode")
    var employeeCode: String? = null

    @NotNull
    @Column(nullable = false, length = 2, name = "EmployeeRoleCode")
    var employeeRoleCode: String? = null

    @Column(length = 50, name = "Name")
    var name: String? = null

    @Column(length = 50, name = "Namekana")
    var namekana: String? = null

    @Column(length = 50, name = "Description")
    var description: String? = null

    fun toEmployeeRequest() = EmployeeResponse(employeeCode, name)
}