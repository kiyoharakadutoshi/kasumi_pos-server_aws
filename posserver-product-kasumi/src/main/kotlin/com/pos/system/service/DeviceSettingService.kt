package com.pos.system.service

import com.pos.system.common.util.Constants
import com.pos.system.model.db.DeviceSetting
import com.pos.system.model.dto.ButtonSetting
import com.pos.system.repository.ButtonSettingRepository
import com.pos.system.repository.DeviceSettingRepository
import org.springframework.stereotype.Service

@Service
class DeviceSettingService(
    private val deviceSettingRepository: DeviceSettingRepository,
    private val serviceClassSettingRepository: ButtonSettingRepository
) {

    fun getDeviceSetting(companyCode: String, storeCode: String, inStoreCode: String): DeviceSetting? {
        val listQueries = getListQueries(companyCode, storeCode, inStoreCode)
        var res: DeviceSetting? = null
        for ((company, store, instore) in listQueries) {
            try {
                res = deviceSettingRepository.findFirstByCompanyCodeAndStoreCodeAndInStoreCodeAndDeleteFlag(company, store, instore)
            } catch (e: Exception) {
                // do nothing
            }
            if (res != null) break
        }
        var listButtonSetting = listOf<ButtonSetting>()
        for ((company, store, instore) in listQueries) {
            listButtonSetting = getListButtonSetting(company, store, instore)
            if (listButtonSetting.isNotEmpty()) break
        }

        return res?.apply {
            listButton = listButtonSetting
        }
    }

    fun getListQueries(companyCode: String, storeCode: String, inStoreCode: String) : List<Triple<String, String, String>> {
        val listQuery = mutableListOf<Triple<String, String, String>>()
        listQuery.add(Triple(companyCode, storeCode, inStoreCode))
        if (inStoreCode != Constants.DEFAULT_INSTORE_CODE) {
            listQuery.add(Triple(companyCode, storeCode, Constants.DEFAULT_INSTORE_CODE))
            if (storeCode != Constants.DEFAULT_STORE_CODE) {
                listQuery.add(Triple(companyCode, Constants.DEFAULT_STORE_CODE, Constants.DEFAULT_INSTORE_CODE))
            }
        }
        return listQuery
    }

    private fun getListButtonSetting(companyCode: String, storeCode: String, inStoreCode: String) : List<ButtonSetting> {
        return try {
            serviceClassSettingRepository.getListButtonSetting(companyCode, storeCode, inStoreCode).map {
                ButtonSetting().apply {
                    serviceClass = it.serviceClass
                    pivotY =it.pivotY
                    pivotX = it.pivotX
                    width = it.width
                    height = it.height
                    textSize = it.textSize
                }
            }
        } catch (e: Exception) {
            // do nothing
            listOf()
        }
    }
}