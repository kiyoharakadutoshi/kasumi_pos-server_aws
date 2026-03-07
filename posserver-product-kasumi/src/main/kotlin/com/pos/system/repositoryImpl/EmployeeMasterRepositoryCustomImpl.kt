package com.pos.system.repositoryImpl

import com.pos.system.exception.InternalServerError
import com.pos.system.model.dto.EmployeeMasterDTO
import com.pos.system.repository.EmployeeMasterRepositoryCustom
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext

class EmployeeMasterRepositoryCustomImpl : EmployeeMasterRepositoryCustom {

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    override fun findEmployeeInStore(companyCode: String, storeCode: String): List<EmployeeMasterDTO> {
        try {
            var sqlQuery = "SELECT NEW com.pos.system.model.dto.EmployeeMasterDTO(s.employeeCode, s.name) FROM EmployeeMaster s"
            sqlQuery += " WHERE s.recordVoidFlag <> '1' AND s.companyCode = '$companyCode' AND s.storeCode = '$storeCode'"
            val query = entityManager.createQuery(sqlQuery, EmployeeMasterDTO::class.java)
            return query.resultList
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}