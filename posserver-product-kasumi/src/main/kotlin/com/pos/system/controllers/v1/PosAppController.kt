package com.pos.system.controllers.v1

import com.pos.system.common.config.CoderConfigs
import com.pos.system.common.util.Constants
import com.pos.system.common.util.Util
import com.pos.system.exception.BadRequest
import com.pos.system.exception.NotFound
import com.pos.system.model.db.InfoUpdateApp
import com.pos.system.model.db.PosTrans
import com.pos.system.model.dto.*
import com.pos.system.service.InfoUpdateAppService
import com.pos.system.service.JsonWebTokenService
import com.pos.system.service.LogService
import com.pos.system.service.PosAppService
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*
import java.text.SimpleDateFormat
import java.util.*

@RestController
@RequestMapping("/pos/v1")
class PosAppController(private val posAppService: PosAppService,
                       private val infoUpdateApp: InfoUpdateAppService,
                       private val jwtService: JsonWebTokenService,
                       private val pwEncoderConfig: CoderConfigs,
                       private val logService: LogService,
) {
    private val logger = LoggerFactory.getLogger(PosAppController::class.java)
    //TODO for testing
    private val password = "\$2a\$10\$3pSzTN98WEIO01UsgSLMoutflKrWheXyW4/UKIUVwBi8iAH5HTobu"
    private val userName = "posteam#2023@luvina.net"
    @Value("\${project.version}")
    lateinit var version: String

    @PostMapping(value = ["sales/suspended"])
    @ResponseStatus(HttpStatus.OK)
    fun salesSuspended(
        @RequestBody data: RequestSalesSuspended?
    ): ResponseEntity<Map<String, String>> {
        val model = Util.dataToken
        val transactionId = data?.transactionId
        if (model == null || transactionId == null) throw BadRequest()
        val log = posAppService.getSalesInfoSuspended(transactionId, model) ?: throw NotFound("Not Found Sales Info")

        return ResponseEntity.ok().body(hashMapOf("receipt_no" to posAppService.saveReceiptSuspended(log, model)))
    }

    @PostMapping(value = ["/cashchanger/replenish"])
    @ResponseStatus(HttpStatus.OK)
    fun cashChangerReplenish(@RequestHeader("Authorization") authorization: String?,
                             @Valid @RequestBody data: CashChangerReplenishModel?,
                             bdResult: BindingResult
    ): Map<String, String> {
        if (authorization == null || data == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        return mapOf("journal" to posAppService.insertCashChanger(authorization, data))
    }

    @PostMapping(value = ["/cashchanger/recover"])
    @ResponseStatus(HttpStatus.OK)
    fun cashChangerRecover(@RequestHeader("Authorization") authorization: String?,
                             @Valid @RequestBody data: CashChangerRecoverModel?,
                             bdResult: BindingResult
    ): Map<String, String> {
        if (authorization == null || data == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        return mapOf("journal" to posAppService.insertCashChanger(authorization, data))
    }

    @PostMapping(value = ["/Charge_CHK"])
    @ResponseStatus(HttpStatus.OK)
    fun hardTotal(): HardTotalResponse {
        val model = Util.dataToken ?: throw BadRequest()
        return posAppService.hardTotalM030(model)
    }

    @PostMapping(value = ["/money/current"])
    @ResponseStatus(HttpStatus.OK)
    fun getMoneyInfo(@RequestBody classInfo: ClassInfo?): PosTrans {
        val posModel = Util.dataToken
        val model = classInfo?.differenceModel
        if (model != null && classInfo.receiptNo != null) {
            val posTrans = logService.getMoneyCurrent(posModel?.companyCode!!, posModel.storeCode, posModel.inStoreCode, classInfo.receiptNo)
            if (posTrans == null) {
                throw NotFound()
            } else {
                logService.updateMoneyCurrent(posTrans, model)
            }
        }
        return logService.getMoneyCurrent(posModel?.companyCode!!, posModel.storeCode, posModel.inStoreCode, classInfo?.classInfo) ?: PosTrans().apply {
            companyCode = posModel.companyCode
            storeCode = posModel.storeCode
            instoreCode = posModel.inStoreCode
        }
    }

    @PostMapping(value = ["/Charge_journal"])
    @ResponseStatus(HttpStatus.OK)
    fun exportRevenue(@Valid @NotNull @RequestBody chargeJournalRequest: ChargeJournalRequest?,
                      bdResult: BindingResult): Map<String, String> {
        val model = Util.dataToken
        if (model == null || chargeJournalRequest == null || bdResult.hasErrors()) {
            throw BadRequest()
        }
        return mapOf("journal" to posAppService.createReceiptL205(model, chargeJournalRequest))
    }

    @PostMapping(value = ["/Charge_CHK_finish"])
    @ResponseStatus(HttpStatus.OK)
    fun updateApplyDateTime() {
        val model = Util.dataToken
            ?: throw BadRequest()
        posAppService.updateApplyDateTime(model)
    }

    @PostMapping(value = ["/check-update"])
    @ResponseStatus(HttpStatus.OK)
    fun getUrlUpdateApp(@Valid @RequestBody data: InfoUpdateRequest?,
                        bdResult: BindingResult): InfoUpdateResponse? {
        if (data == null || bdResult.hasErrors()) {
            throw BadRequest(bdResult.allErrors.first().defaultMessage)
        }
        val posModel = Util.dataToken
        val osType = data.appId ?: posModel?.osType ?: ""
        val fileName = infoUpdateApp.getFileNameUpdate(
            data.appVersion!!,
            osType + (posModel?.osVersion ?: data.osVersion ?: "")
        )
        val infoUpdate = try {
            if (posModel?.isAccountDefault() == true) null else {
                val posInfo = PosInfo(posModel!!.companyCode, posModel.storeCode, posModel.inStoreCode)
                infoUpdateApp.getInfoUpdateByCodePos(posInfo) ?: checkInfoUpdateWhenNotExist(posInfo)
            }
        } catch (e: Exception) {
            logger.error(e.toString())
            null
        }
        return if (infoUpdate == null) {
            if (posModel?.isAccountDefault() == false)
                infoUpdateApp.insertRecord(posModel.companyCode, posModel.storeCode,
                    posModel.inStoreCode, data.appVersion!!, if (fileName == null) null else Util.timeStampNow)
            if (fileName != null) {
                InfoUpdateResponse(fileName = fileName.second)
            } else {
                throw BadRequest("It's the latest version, no need to update", 406)
            }
        } else {
            if (infoUpdateApp.checkCanUpdate(infoUpdate, data.appVersion!!)) {
                if (fileName == null) throw BadRequest("It's the latest version, no need to update", 406)
                return InfoUpdateResponse(
                    companyCode = infoUpdate.companyCode,
                    storeCode = infoUpdate.storeCode,
                    inStoreCode = infoUpdate.instoreCode,
                    fileName = fileName.second)
            } else {
                throw BadRequest("Updates are not allowed", 405)
            }
        }
    }

    // To check the status of the server
    @GetMapping(value = ["/check-status"])
    @ResponseStatus(HttpStatus.OK)
    fun checkStatus() : String {
        val mySql = listOf("MySQL80", "MySQL_3306", "MySQL_3307").joinToString("</br>") {
            it + ": " + Util.checkIfServiceRunning(it)
        }
        val format = SimpleDateFormat("yyyy/MM/dd HH:mm:ss sss")
        return "Server version: $version</br>$mySql</br>Current Time: ${format.format(Date())}</br>${Thread.currentThread().name}"
    }

    //TODO for testing
//    @PostMapping(value = ["/response-delay"])
//    @ResponseStatus(HttpStatus.OK)
//    fun responseDelay(
////            @RequestHeader("Authorization") authorization: String?,
////                      @RequestParam name: String?,
////                      @RequestParam password: String?,
//                      @RequestParam duration: Long?) : HashMap<String, Any> {
//        try {
//            if (
////                    name == this.userName
//                duration != null
////                && jwtService.verifyJwt(authorization!!.substring(7)) &&
////                pwEncoderConfig.passwordEncoder().matches(password, this.password)
//                    ) {
//                responseDelay = duration
//                return hashMapOf<String, Any>("code" to 200, "delay" to responseDelay)
//            }
//        } catch (e: Exception) {
//            logger.error(e.message)
//        }
//        return hashMapOf<String, Any>("code" to 200, "delay" to responseDelay)
//    }

    companion object {
        //TODO for testing
        var responseDelay = 0L
    }

    private fun checkInfoUpdateWhenNotExist(posInfo: PosInfo): InfoUpdateApp? {
        val isPosDefault =
            posInfo.storeCode != Constants.DEFAULT_STORE_CODE && posInfo.inStoreCode == Constants.DEFAULT_INSTORE_CODE
        val isStoreDefault =
            posInfo.storeCode == Constants.DEFAULT_STORE_CODE && posInfo.inStoreCode == Constants.DEFAULT_INSTORE_CODE
        var result: InfoUpdateApp? = null
        when {
            !isPosDefault && !isStoreDefault -> {
                posInfo.inStoreCode = Constants.DEFAULT_INSTORE_CODE
                result = infoUpdateApp.getInfoUpdateByCodePos(posInfo)
                if(result == null) {
                    posInfo.storeCode = Constants.DEFAULT_STORE_CODE
                    result = infoUpdateApp.getInfoUpdateByCodePos(posInfo)
                }
            }
            isPosDefault -> {
                posInfo.storeCode = Constants.DEFAULT_STORE_CODE
                result = infoUpdateApp.getInfoUpdateByCodePos(posInfo)
            }
        }
        return result
    }

}