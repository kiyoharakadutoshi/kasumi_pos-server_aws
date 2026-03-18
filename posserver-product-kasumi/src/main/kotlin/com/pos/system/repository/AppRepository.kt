package com.pos.system.repository

import com.pos.system.model.db.InfoUpdateApp
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository


@Repository
interface AppRepository : JpaRepository<InfoUpdateApp, Long> {
    @Query(value = "SELECT * FROM updatemanagermaster WHERE CompanyCode = :companyCode AND StoreCode = :storeCode AND InstoreCode = :inStoreCode AND RECORD_VOID_FLAG != '1' limit 1", nativeQuery = true)
    fun getInfoUpdate(
        @Param("companyCode") companyCode: String,
        @Param("storeCode") storeCode: String,
        @Param("inStoreCode") inStoreCode: String
    ): InfoUpdateApp?

    @Modifying
    @Query(value = "UPDATE updatemanagermaster tb SET tb.Version = :version, tb.LastUpdated = Now() WHERE tb.Version < :version AND tb.CompanyCode = :companyCode AND tb.StoreCode = :storeCode AND tb.InstoreCode = :inStoreCode", nativeQuery = true)
    fun updateVersion(@Param("version") version: String,
                      @Param("companyCode") companyCode: String,
                      @Param("storeCode") storeCode: String,
                      @Param("inStoreCode") inStoreCode: String): Int
}