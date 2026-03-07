package com.pos.system.repository

import com.pos.system.common.util.Constants
import com.pos.system.model.db.LogMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
interface LogMasterRepository : JpaRepository<LogMaster, Long>, LogMasterRepositoryCustom {
    @Query(value = "SELECT * FROM logmaster WHERE MacAddress = ?1 AND RecordTimestamp = ?2 LIMIT 1", nativeQuery = true)
    fun findRecordByMacAddressAndTimestamp(macAddress: String, recordTimestamp: Timestamp?): LogMaster?

    @Query(value = "SELECT * FROM logmaster WHERE CompanyCode = :companyCode AND StoreCode = :storeCode AND InstoreCode = :inStoreCode " +
            " AND Response like %:transactionId% AND Url like %:url order by RecordTimestamp desc  LIMIT 1", nativeQuery = true)
    fun getSalesInfoSuspended(
        @Param("companyCode") companyCode: String,
        @Param("storeCode") storeCode: String,
        @Param("inStoreCode") inStoreCode: String,
        @Param("transactionId") transactionId: String,
        @Param("url") url: String = Constants.URL_SALES_INFO
    ): LogMaster?
}