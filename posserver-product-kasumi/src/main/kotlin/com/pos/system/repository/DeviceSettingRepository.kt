package com.pos.system.repository

import com.pos.system.model.db.DeviceSetting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DeviceSettingRepository : JpaRepository<DeviceSetting, Long> {
    fun findFirstByCompanyCodeAndStoreCodeAndInStoreCodeAndDeleteFlag(companyCode: String, storeCode: String, inStoreCode: String, deleteFlag: Int = 0): DeviceSetting?
}