package com.pos.system.service

import com.pos.system.exception.InternalServerError
import com.pos.system.model.db.CashChangerSetting
import com.pos.system.repository.CashChangerSettingRepository
import org.springframework.stereotype.Service

@Service
class CashChangerSettingService(private val cashChangerSettingRepository: CashChangerSettingRepository) {

    fun getCashChangerSetting(companyCode: String, storeCode: String, inStoreCode: String, status: Int): CashChangerSetting? {
        try {
            return cashChangerSettingRepository.findFirstByCompanyCodeAndStoreCodeAndInStoreCodeAndStatusAndDeleteFlag(companyCode, storeCode, inStoreCode, status)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}
