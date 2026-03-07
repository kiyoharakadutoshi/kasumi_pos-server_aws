package com.pos.system.repository

import com.pos.system.model.db.CashChangerMaskMaster
import com.pos.system.model.db.CashChangerMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface CashChangerMasterRepository : JpaRepository<CashChangerMaster, Long>

@Repository
interface CashChangerMasterMaskRepository : JpaRepository<CashChangerMaskMaster, Long> {

    @Query(value = "SELECT * FROM CashChangerMaskMaster WHERE CompanyCode = ?1 AND StoreCode = ?2 AND InstoreCode = ?3 and ApplyDate IS NULL LIMIT 1", nativeQuery = true)
    fun findCashChangerMaskMaster(companyCode: String, storeCode: String, instoreCode: String): CashChangerMaskMaster?

    @Query(value = "SELECT * FROM CashChangerMaskMaster where CompanyCode = ?1 AND StoreCode = ?2 AND InstoreCode = ?3 and ApplyDate = (SELECT MAX(ApplyDate) FROM CashChangerMaskMaster) LIMIT 1", nativeQuery = true)
    fun findLastExport(companyCode: String, storeCode: String, instoreCode: String): CashChangerMaskMaster?

    @Modifying
    @Query(value = "UPDATE CashChangerMaskMaster SET ApplyDate = ?2 WHERE RECORD_ID = ?1", nativeQuery = true)
    fun updateApplyDate(recordId: Long, applyDateTime: LocalDateTime)
}