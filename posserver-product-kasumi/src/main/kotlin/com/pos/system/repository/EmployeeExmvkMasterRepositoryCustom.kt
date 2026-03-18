package com.pos.system.repository

import com.pos.system.model.dto.InfoLogin

interface EmployeeExmvkMasterRepositoryCustom {
    fun getInfoLogin(employeeCode: String = "", companyCode: String = "", storeCode: String = "") : InfoLogin?
}