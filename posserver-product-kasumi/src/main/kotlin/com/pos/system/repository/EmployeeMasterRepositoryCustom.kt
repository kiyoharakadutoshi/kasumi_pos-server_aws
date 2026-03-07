package com.pos.system.repository

import com.pos.system.model.dto.EmployeeMasterDTO

interface EmployeeMasterRepositoryCustom {
    fun findEmployeeInStore(companyCode: String, storeCode: String): List<EmployeeMasterDTO>
}