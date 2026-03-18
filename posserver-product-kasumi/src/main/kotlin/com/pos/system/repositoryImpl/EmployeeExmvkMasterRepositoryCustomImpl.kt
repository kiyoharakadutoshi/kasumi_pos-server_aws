package com.pos.system.repositoryImpl

import com.pos.system.exception.InternalServerError
import com.pos.system.model.dto.InfoLogin
import com.pos.system.repository.EmployeeExmvkMasterRepositoryCustom
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext

class EmployeeExmvkMasterRepositoryCustomImpl: EmployeeExmvkMasterRepositoryCustom {

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    override fun getInfoLogin(employeeCode: String, companyCode: String, storeCode: String): InfoLogin? {
        try {
            var sqlQuery = "SELECT NEW com.pos.system.model.dto.InfoLogin(e.companyCode, e.storeCode, s.branchName, e.employeeCode, i.name, i.employeeRoleCode)"
            sqlQuery += " FROM EmployeeExmvkMaster e"
            sqlQuery += " INNER JOIN StoreMaster s ON e.companyCode = s.companyCode AND e.storeCode = s.storeCode"
            sqlQuery += " INNER JOIN EmployeeMaster i ON e.employeeCode = i.employeeCode AND e.companyCode = i.companyCode AND e.storeCode = i.storeCode"
            sqlQuery += " WHERE e.recordVoidFlag !='1' AND s.recordVoidFlag !='1'"
            sqlQuery += " AND e.employeeCode = '$employeeCode' AND e.companyCode = '$companyCode' AND e.storeCode = '$storeCode'"
            val query = entityManager.createQuery(sqlQuery, InfoLogin::class.java)
            return query.resultList.firstOrNull()
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}