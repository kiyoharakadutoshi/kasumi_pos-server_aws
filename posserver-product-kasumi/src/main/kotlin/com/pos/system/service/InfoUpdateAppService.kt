package com.pos.system.service

import com.pos.system.common.util.Constants
import com.pos.system.common.util.FileUtil
import com.pos.system.exception.InternalServerError
import com.pos.system.model.db.InfoUpdateApp
import com.pos.system.model.dto.PosInfo
import com.pos.system.repository.AppRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp

@Service
class InfoUpdateAppService(private val appRepository: AppRepository) {

    fun getInfoUpdateByCodePos(posInfo: PosInfo): InfoUpdateApp? {
        try {
            return appRepository.getInfoUpdate(posInfo.companyCode, posInfo.storeCode, posInfo.inStoreCode)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
    @Transactional
    fun checkCanUpdate(infoUpdate: InfoUpdateApp, version: String): Boolean {
        return try {
            appRepository.updateVersion(version = version,
                    companyCode = infoUpdate.companyCode,
                    storeCode = infoUpdate.storeCode,
                    inStoreCode = infoUpdate.instoreCode
            )
            infoUpdate.updateFlag == Constants.CAN_UPDATE_FLAG
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }

    @Transactional
    fun insertRecord(companyCode: String,
                     storeCode: String,
                     instoreCode: String,
                     version: String,
                     timestamp: Timestamp? = null) : InfoUpdateApp {
        try {
            val model = InfoUpdateApp().apply {
                this.companyCode = companyCode
                this.storeCode = storeCode
                this.instoreCode = instoreCode
                this.lastUpdated = timestamp
                this.version = version
                this.updateFlag = Constants.CAN_UPDATE_FLAG
            }
            return appRepository.save(model)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }

    fun getFileNameUpdate(version: String, androidVersion: String): Pair<String, String>? {
        val list = FileUtil.getApksUpdate(androidVersion) ?: return null
        var fileName = ""
        var filePath: String? = null
        list.forEach {
            val name = it.name
            if ((name.endsWith(".apk")
                        || name.endsWith(".zip")
                        || name.endsWith(".msi")) && fileName <= name) {
                fileName = name
                filePath = it.path
            }
        }
        val lastVersion = fileName.replace("posapp_", "")
            .replace(".apk", "")
            .replace(".zip", "")
            .replace(".msi", "")
        return if (lastVersion > version && filePath != null) Pair(lastVersion, filePath!!.split("public")[1].replace("\\", "/")) else null
    }
}