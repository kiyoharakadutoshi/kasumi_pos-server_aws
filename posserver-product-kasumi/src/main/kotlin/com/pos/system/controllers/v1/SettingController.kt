package com.pos.system.controllers.v1

import com.pos.system.common.util.Util
import com.pos.system.exception.BadRequest
import com.pos.system.exception.NotFound
import com.pos.system.model.db.CashChangerSetting
import com.pos.system.model.db.DeviceSetting
import com.pos.system.model.dto.CashChangerSettingRequest
import com.pos.system.model.dto.DeviceSettingRequest
import com.pos.system.service.CashChangerSettingService
import com.pos.system.service.DeviceSettingService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/pos/v1/setting")
class SettingController(private val deviceSettingService: DeviceSettingService,
                        private val cashChangerSettingService: CashChangerSettingService) {

    @PostMapping(value = ["/device/get"])
    @ResponseStatus(HttpStatus.OK)
    fun getDeviceSetting(@RequestHeader("Authorization") authorization: String?,
                         @Valid @RequestBody data: DeviceSettingRequest?,
                         bdResult: BindingResult): DeviceSetting {
        if (authorization == null || data == null || bdResult.hasErrors()) {
            throw BadRequest(bdResult.allErrors.first().defaultMessage)
        }
        if (PosAppController.responseDelay > 0) {
            Thread.sleep(PosAppController.responseDelay)
        }
        try {
            Util.decodeJWT(authorization)
        } catch (e: Exception) {
            throw BadRequest()
        }
        val result = try {
            deviceSettingService.getDeviceSetting(data.companyCode!!, data.storeCode!!, data.inStoreCode!!)
        } catch (e: Exception) {
            throw BadRequest()
        } ?: throw NotFound("対象データは存在しません。")
        return result
    }

    @PostMapping(value = ["/cashchanger/get"])
    @ResponseStatus(HttpStatus.OK)
    fun getCashChangerSetting(@RequestHeader("Authorization") authorization: String?,
                         @Valid @RequestBody data: CashChangerSettingRequest?,
                         bdResult: BindingResult): CashChangerSetting {
        if (authorization == null || data == null || bdResult.hasErrors()) {
            throw BadRequest(bdResult.allErrors.first().defaultMessage)
        }
        if (PosAppController.responseDelay > 0) {
            Thread.sleep(PosAppController.responseDelay)
        }
        try {
            Util.decodeJWT(authorization)
        } catch (e: Exception) {
            throw BadRequest()
        }
        try {
            val listQueries = deviceSettingService.getListQueries(data.companyCode!!, data.storeCode!!, data.inStoreCode!!)

            for ((company, store, instore) in listQueries) {
                val result = cashChangerSettingService.getCashChangerSetting(company, store, instore, data.status!!)
                if (result != null) return result
            }
        } catch (e: Exception) {
            throw BadRequest()
        }
        throw NotFound("対象データは存在しません。")
    }
}