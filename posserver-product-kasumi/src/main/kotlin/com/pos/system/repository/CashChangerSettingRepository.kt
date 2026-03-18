package com.pos.system.repository

import com.pos.system.model.db.CashChangerSetting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CashChangerSettingRepository : JpaRepository<CashChangerSetting, Long> {
    fun findFirstByCompanyCodeAndStoreCodeAndInStoreCodeAndStatusAndDeleteFlag(companyCode: String, storeCode: String, inStoreCode: String, status: Int, deleteFlag: Int = 0): CashChangerSetting?
}