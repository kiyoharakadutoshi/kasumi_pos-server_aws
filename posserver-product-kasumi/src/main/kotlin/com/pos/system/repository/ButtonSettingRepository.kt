package com.pos.system.repository

import com.pos.system.model.db.ButtonSetting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ButtonSettingRepository : JpaRepository<ButtonSetting, Long> {
    @Query("SELECT * FROM buttonsetting WHERE CompanyCode = :companyCode AND StoreCode = :storeCode AND InstoreCode = :inStoreCode " +
            "AND RECORD_VOID_FLAG <> 1", nativeQuery = true)
    fun getListButtonSetting(@Param("companyCode") companyCode: String = "",
                                @Param("storeCode") storeCode: String = "",
                                @Param("inStoreCode") inStoreCode: String = ""): List<ButtonSetting>
}