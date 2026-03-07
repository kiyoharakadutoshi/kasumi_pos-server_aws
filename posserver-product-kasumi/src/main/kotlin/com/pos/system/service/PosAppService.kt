package com.pos.system.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.common.util.Constants
import com.pos.system.common.util.Util
import com.pos.system.exception.BadRequest
import com.pos.system.exception.InternalServerError
import com.pos.system.exception.NotFound
import com.pos.system.model.db.*
import com.pos.system.model.dto.*
import com.pos.system.model.others.ResponsePayment
import com.pos.system.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.math.abs
import kotlin.math.max

@Service
class PosAppService(
    private val employeeRepository: EmployeeMasterRepository,
    private val cashChangerMasterMaskRepository: CashChangerMasterMaskRepository,
    private val cashChangerMasterRepository: CashChangerMasterRepository,
    private val receiptMasterRepository: ReceiptMasterRepository,
    private val chargerReceiptNoRepository: ChargerReceiptNoRepository,
    private val chargeInfoRepository: ChargeInfoRepository,
    private val storeMasterRepository: StoreMasterRepository,
    private val logMasterRepository: LogMasterRepository,
    private val posTransRepository: PosTransRepository
) {
    private val logger = LoggerFactory.getLogger(LogService::class.java)
    companion object {
        const val companyCodeFormatString = "店:%s ﾚｼﾞNo:%s"
        const val separateLine = "--------------------------------\n"
        const val emptyLine = "                                \n"
        const val receiptNoLine = "ﾚｼｰﾄNo:%s\n"
        const val staffInfoLine = "責:%s\n"
    }

    fun getSalesInfoSuspended(transactionId: String, model: LoginRequest): LogMaster? {
        try {
            return logMasterRepository.getSalesInfoSuspended(model.companyCode, model.storeCode, model.inStoreCode, transactionId)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }

    fun saveReceiptSuspended(log: LogMaster, posModel: LoginRequest): String {
        val data = try {
            val objectMapper = ObjectMapper()
            objectMapper.readValue(log.response, ResponsePayment::class.java)
        } catch (e: Exception) {
            logger.error("error 3 log.recordId=" + log.recordId + "; msg = " + e.message)
            null
        } ?: throw BadRequest("input null or not map object")
        return extractReceiptMasterFlowUrl(log, data, posModel)
    }

    @Transactional
    private fun extractReceiptMasterFlowUrl(log: LogMaster, data: ResponsePayment, posModel: LoginRequest): String {
        try {
            val receiptNoModel = saveChargeReceiptNo(posModel)
            val receipt = ReceiptMaster()
            saveValueReceipt(log, receipt)
            val stringDateTime = data.meta?.transactionDatetimeReceiptFmt
            val datetime = DateTimeFormatter.ofPattern(Constants.STRING_DATE_FORMAT_JAPANESE, Locale.JAPANESE)
                .parse(stringDateTime)
            receipt.receiptCreateDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(datetime)
            receipt.receiptCreateTime = DateTimeFormatter.ofPattern("HH:mm:ss").format(datetime)
            receipt.receiptNo = receiptNoModel.receiptNo ?: ""
            receipt.employeeCode = data.employee?.code
            receiptMasterRepository.save(receipt)
            return receiptNoModel.receiptNo ?: ""
        } catch (e: Exception) {
            logger.error("error log.recordId=" + log.recordId + "; msg = " + e.message)
            throw InternalServerError()
        }
    }

    @Transactional
    private fun saveChargeReceiptNo (posModel: LoginRequest): ChargerReceiptNo {
        try {
            var receiptNoModel = chargerReceiptNoRepository.findReceiptNo(posModel.companyCode, posModel.storeCode, posModel.inStoreCode)
            if (receiptNoModel == null) {
                val now = LocalDateTime.now()
                receiptNoModel = ChargerReceiptNo().apply {
                    companyCode = posModel.companyCode
                    storeCode = posModel.storeCode
                    instoreCode = posModel.inStoreCode
                    recordCreateTime = now.toLocalTime()
                    recordCreateDate = now.toLocalDate()
                    recordUpdateDate = now.toLocalDate()
                    recordUpdateTime = now.toLocalTime()
                    receiptNo = "90000"
                }
            } else {
                val temp = receiptNoModel.receiptNo!!.toInt() + 1
                receiptNoModel.receiptNo = (if (temp == 99_999) 90_000 else temp).toString()
            }
            chargerReceiptNoRepository.save(receiptNoModel)
            return receiptNoModel
        } catch (e: Exception) {
            logger.error("error save charge_receipt_no; msg = " + e.message)
            throw InternalServerError()
        }
    }

    private fun saveValueReceipt(log: LogMaster, receipt: ReceiptMaster) {
        val localDate = LocalDate.now()
        val localTime = LocalTime.now()
        receipt.recordCreateDate = localDate
        receipt.recordCreateTime = localTime

        receipt.recordUpdateDate = localDate
        receipt.recordUpdateTime = localTime

        receipt.companyCode = log.companyCode
        receipt.storeCode = log.storeCode
        receipt.instoreCode = log.instoreCode

        receipt.logID = log.recordId
    }

    private fun getPosModelFromAuthorization(authorization: String): LoginRequest {
        return Util.decodeJWT(authorization) ?: throw BadRequest()
    }

    fun getEmployee(
        posModel: LoginRequest,
        data: EmployeeRequest
    ): EmployeeMaster {
        val result = try {
            employeeRepository.findByCompanyCodeAndStoreCodeAndEmployeeCode(
                posModel.companyCode,
                posModel.storeCode, data.employeeCode!!
            )
        } catch (e: Exception) {
            throw BadRequest()
        } ?: throw NotFound("従業コード=[${data.employeeCode}]は存在しません。")
        return result
    }

    @Transactional
    fun insertCashChanger(
        authorization: String,
        data: BaseCashChangerModel
    ): String {
        val screenID: ScreenID
        val changedModel = when (data) {
            is CashChangerReplenishModel -> {
                screenID = ScreenID.ID284
                data.replenish
            }

            is CashChangerRecoverModel -> {
                screenID = ScreenID.ID285
                data.recover
            }

            else -> throw BadRequest()
        } ?: throw BadRequest()
        val posModel = getPosModelFromAuthorization(authorization)
        var cashChangerMaskMaster = try {
            cashChangerMasterMaskRepository.findCashChangerMaskMaster(
                posModel.companyCode,
                posModel.storeCode,
                posModel.inStoreCode
            )
        } catch (e: Exception) {
            throw InternalServerError()
        }

        if (cashChangerMaskMaster == null) {
            cashChangerMaskMaster = CashChangerMaskMaster()
            cashChangerMaskMaster.companyCode = posModel.companyCode
            cashChangerMaskMaster.storeCode = posModel.storeCode
            cashChangerMaskMaster.instoreCode = posModel.inStoreCode
            cashChangerMaskMaster.recordUpdateDate = LocalDate.now()
            cashChangerMaskMaster.recordCreateDate = cashChangerMaskMaster.recordUpdateDate
            cashChangerMaskMaster.recordCreateTime = LocalTime.now()
            cashChangerMaskMaster.recordUpdateTime = cashChangerMaskMaster.recordCreateTime
            cashChangerMasterMaskRepository.save(cashChangerMaskMaster)
        }
        val cashChangerMaster = changedModel.toCashChangerMaster
        cashChangerMaster.screenID = screenID
        cashChangerMaster.cashChangerMaskMaster = cashChangerMaskMaster
        cashChangerMaster.recordUpdateDate = LocalDate.now()
        cashChangerMaster.recordCreateDate = cashChangerMaster.recordUpdateDate
        cashChangerMaster.recordCreateTime = LocalTime.now()
        cashChangerMaster.recordUpdateTime = cashChangerMaster.recordCreateTime
        cashChangerMaster.totalCount = changedModel.total
        cashChangerMaster.totalCurrentCount = data.total
        data.updateCurrentCount(cashChangerMaster)

        cashChangerMasterRepository.save(cashChangerMaster)
        val employee = employeeRepository.findByCompanyCodeAndStoreCode(posModel.companyCode, posModel.storeCode)
        val receiptMaster = ReceiptMaster()
        receiptMaster.companyCode = posModel.companyCode
        receiptMaster.storeCode = posModel.storeCode
        receiptMaster.instoreCode = posModel.inStoreCode
        receiptMaster.recordUpdateDate = cashChangerMaster.recordUpdateDate
        receiptMaster.recordCreateDate = cashChangerMaster.recordUpdateDate
        receiptMaster.recordCreateTime = cashChangerMaster.recordCreateTime
        receiptMaster.recordUpdateTime = cashChangerMaster.recordCreateTime
        receiptMasterRepository.save(receiptMaster)
        return when (data) {
            is CashChangerReplenishModel -> createReceipt2080402(
                posModel.companyCode,
                posModel.storeCode,
                employee?.employeeCode,
                employee?.name,
                receiptMaster.recordId.toInt(),
                data
            )

            is CashChangerRecoverModel -> createReceipt2080502(
                posModel.companyCode,
                posModel.storeCode,
                employee?.employeeCode,
                employee?.name,
                receiptMaster.recordId.toInt(),
                data
            )

            else -> throw BadRequest()
        }
    }

    fun hardTotalM030(posModel: LoginRequest): HardTotalResponse {
        val total284And285 = chargeInfoRepository.totalReserveMoney(posModel.companyCode,
            posModel.storeCode,
            posModel.inStoreCode)
        val total40 = chargeInfoRepository.totalMoneyByScreen(posModel.companyCode,
            posModel.storeCode,
            posModel.inStoreCode,
            ClassType.Flow40)

        return HardTotalResponse(
            companyCode = posModel.companyCode,
            storeCode = posModel.storeCode,
            inStoreCode = posModel.inStoreCode,
            cashChangerRegister = total284And285,
            cashChangerRegisterFmt = total284And285.toString() + "円",
            salesCash = total40,
            salesCashFmt = total40.toString() + "円"
        )
    }

    private fun createReceipt2080402(
        storeCode: String,
        posCode: String,
        employeeCode: String?,
        employeeName: String?,
        receiptNo: Int,
        data: CashChangerReplenishModel
    ): String {
        val listMoney = data.replenish?.toList ?: throw BadRequest()

        val thousandsFormat = "%,d"
        var start = separateLine +
                "           釣銭機補充           \n" +
                emptyLine +
                "%s\n" +
                "%s\n" +
                emptyLine +
                "   金種      枚             金額\n"
        start = start.format(Util.currentDateJPLocale, companyCodeFormatString.format(storeCode, posCode))

        listMoney.forEach { (unit, quantity) ->
            val total = thousandsFormat.format(unit * quantity)
            start += "%s円%s%s\n".format(
                unit.toString().padStart(5),
                quantity.toString().padStart(8),
                ("¥$total").padStart(17)
            )
        }
        var end = separateLine +
                "補充金額       %s\n" +
                "(補充後釣銭機合計%s)\n" +
                receiptNoLine +
                staffInfoLine
        val totals = listMoney.sumOf { (unit, quantity) -> unit * quantity }
        val totalsString = thousandsFormat.format(totals)
        val totalCurrentMoney = thousandsFormat.format(data.total)
        end = end.format(
            ("¥$totalsString").padStart(17),
            ("¥$totalCurrentMoney").padStart(14),
            String.format("%05d", receiptNo),
            employeeCode + employeeName
        )
        return start + end
    }

    private fun createReceipt2080502(
        storeCode: String,
        posCode: String,
        employeeCode: String?,
        employeeName: String?,
        receiptNo: Int,
        data: CashChangerRecoverModel
    ): String {
        val listMoney = data.recover?.toList ?: throw BadRequest()
        val thousandsFormat = "%,d"
        var start = separateLine +
                "           釣銭機回収           \n" +
                emptyLine +
                "%s\n" +
                "%s\n" +
                emptyLine +
                "   金種      枚             金額\n"
        start = start.format(Util.currentDateJPLocale, companyCodeFormatString.format(storeCode, posCode))

        listMoney.forEach { (unit, quantity) ->
            val total = thousandsFormat.format(unit * quantity)
            start += "%s円%s%s\n".format(
                unit.toString().padStart(5),
                quantity.toString().padStart(8),
                ("¥$total").padStart(17)
            )
        }
        start += "回収庫                        " + "¥" + "0\n"
        var end = separateLine +
                "回収金額       %s\n" +
                "(回収後釣銭機合計%s)\n" +
                emptyLine +
                receiptNoLine +
                staffInfoLine
        val totals = listMoney.sumOf { (unit, quantity) -> unit * quantity }
        val totalsString = thousandsFormat.format(totals)
        val totalCurrentMoney = thousandsFormat.format(data.total)
        end = end.format(
            ("¥$totalsString").padStart(17),
            ("¥$totalCurrentMoney").padStart(14),
            String.format("%05d", receiptNo),
            employeeCode + employeeName
        )
        return start + end
    }

    @Transactional
    fun createReceiptL205(posModel: LoginRequest, chargeJournalRequest: ChargeJournalRequest): String {
        val receiptNoModel = saveChargeReceiptNo(posModel)
        val lastExport = chargeInfoRepository.findLastExport(posModel.companyCode,
            posModel.storeCode, posModel.inStoreCode)
        var total285 = 0L
        var total284 = 0L
        var total40 = 0L
        var countTransaction285 = 1
        var countTransaction284 = 0
        var countTransaction40 = 0

        chargeInfoRepository.totalAll(
            posModel.companyCode,
            posModel.storeCode,
            posModel.inStoreCode
        ).forEach { tuple ->
            val type = ClassType.init(tuple[0, Integer::class.java].toInt())
            val count = tuple[1, java.lang.Long::class.java].toInt()
            val total = tuple[2, BigDecimal::class.java].toLong()
            when (type) {
                ClassType.Flow284 -> {
                    countTransaction284 = count
                    total284 += total
                }

                ClassType.Flow285,
                ClassType.Flow25 -> {
                    countTransaction285 += count
                    total285 += total
                }

                ClassType.Flow40 -> {
                    countTransaction40 = count
                    total40 += total
                }

                else -> {
                    // do nothing
                }
            }
        }
        val now = LocalDateTime.now()
        val model = ChargeInfo()
        model.recordCreateDate = now.toLocalDate()
        model.recordCreateTime = now.toLocalTime()
        model.recordUpdateDate = now.toLocalDate()
        model.recordUpdateTime = now.toLocalTime()
        model.companyCode = posModel.companyCode
        model.storeCode = posModel.storeCode
        model.instoreCode = posModel.inStoreCode
        model.recordDatetime = now.format(DateTimeFormatter.ofPattern(Constants.DATE_FORMAT)).toInt()
        model.receiptNo = receiptNoModel.receiptNo ?: ""
        model.classInfo = ClassType.Flow25
        val defaultValue = chargeJournalRequest.initAmount
        model.amount = -max(chargeJournalRequest.amount + chargeJournalRequest.otherCash - defaultValue, 0)
        if (chargeJournalRequest.mode != "always") chargeInfoRepository.save(model)
        val employee = employeeRepository.findByCompanyCodeAndStoreCode(posModel.companyCode, posModel.storeCode)
        val totalMoneyCurrent = if (chargeJournalRequest.mode == "always") getTotalCurrentMoney(posModel.companyCode, posModel.storeCode, posModel.inStoreCode) else 0
        val thousandsFormat = "%,d"
        val titleReceipt = when {
            posModel.companyCode == Constants.Company.KASUMI.code && chargeJournalRequest.mode == "close" -> "精算点検"
            posModel.companyCode == Constants.Company.KASUMI.code && chargeJournalRequest.mode == "always"-> "売上点検"
            else -> "  点検"
        }
        var start =  separateLine +
                "            $titleReceipt             \n" +
                "%s\n" +
                "%s\n" +
                emptyLine +
                "前回出力日時    %s\n" +
                "今回出力日時    %s\n" +
                separateLine +
                emptyLine
        start = start.format(
            Util.currentDateJPLocale,
            companyCodeFormatString.format(posModel.storeCode, posModel.inStoreCode),
            lastExport?.toLocalDateTime()?.format(DateTimeFormatter.ofPattern(Constants.DATE_TIME_FORMAT)),
            now.format(DateTimeFormatter.ofPattern(Constants.DATE_TIME_FORMAT))
        )
        var body = if (posModel.companyCode == Constants.Company.KASUMI.code) {
            "入出金処理\n" +
                    separateLine +
                    "釣銭準備      %s点  ¥%s\n" + // 2_8_4
                    "ﾁｬｰｼﾞ合計     %s点  ¥%s\n" + // 2_1_30 + 4_0
                    "現金過不足            ¥%s\n"
        } else {
            "ﾁｬｰｼﾞ合計     %s点  ¥%s\n" + // 4_0
                    separateLine +
                    "入出金処理\n" +
                    separateLine +
                    "釣銭機補充    %s点  ¥%s\n" + // 2_8_4
                    "売上          %s点  ¥%s\n" + // 2_1_30 + 4_0
                    "釣銭機回収    %s点  ¥%s\n" + // 2_8_5
                    "残置金額              ¥%s\n" + // default
                    "現金過不足            ¥%s\n"
        }
        val excess = if (chargeJournalRequest.mode == "always") {
            totalMoneyCurrent - (total284 + total40 + total285).toInt()
        } else {
            chargeJournalRequest.amount + chargeJournalRequest.otherCash -
                    (total284 + total40 + total285).toInt() - defaultValue
        }
        body = if (posModel.companyCode == Constants.Company.KASUMI.code) {
            body.format(
                thousandsFormat.format(countTransaction284).padStart(4), thousandsFormat.format(total284).padStart(9),
                thousandsFormat.format(countTransaction40).padStart(4), thousandsFormat.format(total40).padStart(9),
                thousandsFormat.format(excess).padStart(9)
            )
        } else {
            body.format(
                thousandsFormat.format(countTransaction40).padStart(4), thousandsFormat.format(total40).padStart(9),
                thousandsFormat.format(countTransaction284).padStart(4), thousandsFormat.format(total284).padStart(9),
                thousandsFormat.format(countTransaction40).padStart(4), thousandsFormat.format(total40).padStart(9),
                thousandsFormat.format(countTransaction285).padStart(4), thousandsFormat.format(abs(total285)).padStart(9),
                thousandsFormat.format(defaultValue).padStart(9),
                thousandsFormat.format(excess).padStart(9)
            )
        }
        body += separateLine
        val amountCurrent = if (chargeJournalRequest.mode == "always") {
            thousandsFormat.format(abs(totalMoneyCurrent))
        } else {
            thousandsFormat.format(abs(model.amount))
        }
        body += if (posModel.companyCode == Constants.Company.KASUMI.code) {
            "精算時入金額          ¥${amountCurrent.padStart(9)}\n"
        } else {
            "点検時回収金額        ¥${thousandsFormat.format(abs(model.amount)).padStart(9)}\n"
        }
        var end = separateLine +
                receiptNoLine +
                staffInfoLine
        end = end.format(
            receiptNoModel.receiptNo ?: "",
            employee?.employeeCode + employee?.name
        )
        return start + body + end
    }

    private fun getTotalCurrentMoney(companyCode: String, storeCode: String, inStoreCode: String): Int {
        val lastRecord = posTransRepository.getLatestRecord(companyCode, storeCode, inStoreCode)
        val totalMoneyCurrent = lastRecord?.getTotalCountMoney() ?: 0
        return totalMoneyCurrent
    }

    @Transactional
    fun updateApplyDateTime(posModel: LoginRequest) {
        chargeInfoRepository.updateApplyDateTime(posModel.companyCode, posModel.storeCode, posModel.inStoreCode)
    }

    fun findStore(companyCode: String, storeCode: String): StoreMaster? {
        try {
            return storeMasterRepository.findAllStoreMaster(companyCode, storeCode)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}
