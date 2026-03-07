package com.pos.system.repositoryImpl

import com.pos.system.exception.InternalServerError
import com.pos.system.model.dto.LogMasterDTO
import com.pos.system.repository.LogMasterRepositoryCustom
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext

class LogMasterRepositoryCustomImpl : LogMasterRepositoryCustom {

    @PersistenceContext
    private lateinit var entityManager: EntityManager
    override fun chooseReceipt(recordID: Long): LogMasterDTO? {
        try {
            val sqlQuery = "SELECT NEW com.pos.system.model.dto.LogMasterDTO(s.url, s.response) FROM LogMaster s WHERE s.recordVoidFlag <> '1' AND s.recordId = $recordID"
            val query = entityManager.createQuery(sqlQuery, LogMasterDTO::class.java)
            return query.resultList.first()
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}