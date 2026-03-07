package com.pos.system.repository

import com.pos.system.model.db.StoreMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.LocalTime

@Repository
interface StoreMasterRepository : JpaRepository<StoreMaster, Long> {

    @Query(
        value = "SELECT * FROM storemaster WHERE RECORD_VOID_FLAG != 1 GROUP BY CompanyCode, StoreCode",
        nativeQuery = true
    )
    fun findAllPresetStore(): List<StoreMaster>

    @Query(value = "SELECT * FROM storemaster s WHERE s.CompanyCode = ?1 AND s.StoreCode = ?2 AND s.RECORD_VOID_FLAG <> 1 ", nativeQuery = true)
    fun findAllStoreMaster(companyCode: String, storeCode: String) : StoreMaster?

    @Modifying
    @Query(value = "UPDATE storemaster s SET" +
            " s.RECORD_UPDATE_DATE = :updateDate, s.RECORD_UPDATE_TIME = :updateTime" +
            " WHERE s.CompanyCode = :companyCode AND s.StoreCode = :storeCode", nativeQuery = true)
    fun updateDateTime(@Param("companyCode") companyCode: String,
               @Param("storeCode") storeCode: String,
               @Param("updateDate") updateDate: LocalDate,
               @Param("updateTime") updateTime: LocalTime) : Int
}