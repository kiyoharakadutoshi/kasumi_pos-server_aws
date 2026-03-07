package com.pos.system.repository

import com.pos.system.model.db.PosTrans
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PosTransRepository: JpaRepository<PosTrans, Long> {

    @Query(value = "SELECT * FROM pos_trans WHERE CompanyCode =:companyCode" +
            " AND StoreCode =:storeCode AND InstoreCode =:inStoreCode AND (:classInfo IS NULL OR Class = :classInfo)" +
            " ORDER BY RecordDatetime DESC LIMIT 1", nativeQuery = true)
    fun getLatestRecord(@Param("companyCode") companyCode: String,
                        @Param("storeCode") storeCode: String,
                        @Param("inStoreCode") inStoreCode: String,
                        @Param("classInfo") classInfo: Int? = null) : PosTrans?


    @Query(value = "SELECT * FROM pos_trans WHERE CompanyCode =:companyCode" +
            " AND StoreCode =:storeCode AND InstoreCode =:inStoreCode AND receiptNo = :receiptNo" +
            " ORDER BY RecordDatetime DESC LIMIT 1", nativeQuery = true)
    fun getLatestRecord(@Param("companyCode") companyCode: String,
                        @Param("storeCode") storeCode: String,
                        @Param("inStoreCode") inStoreCode: String,
                        @Param("receiptNo") receiptNo: String?) : PosTrans?
}