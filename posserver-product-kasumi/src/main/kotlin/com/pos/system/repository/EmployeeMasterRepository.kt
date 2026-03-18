package com.pos.system.repository

import com.pos.system.model.db.EmployeeMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface EmployeeMasterRepository : JpaRepository<EmployeeMaster, Long>, EmployeeMasterRepositoryCustom {

    fun findByCompanyCodeAndStoreCodeAndEmployeeCode(companyCode: String, storeCode: String, employeeCode: String): EmployeeMaster?

    @Query("SELECT * FROM employeemaster WHERE CompanyCode = ?1 AND StoreCode = ?2 LIMIT 1", nativeQuery = true)
    fun findByCompanyCodeAndStoreCode(companyCode: String, storeCode: String): EmployeeMaster?
}