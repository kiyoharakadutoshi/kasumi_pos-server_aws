package com.pos.system.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.common.util.Constants
import com.pos.system.common.util.Util
import com.pos.system.common.util.Util.toObject
import com.pos.system.exception.InternalServerError
import com.pos.system.model.db.*
import com.pos.system.model.dto.DifferenceModel
import com.pos.system.model.dto.LogRequestModel
import com.pos.system.model.dto.LoginRequest
import com.pos.system.model.dto.VerificateRequestModel
import com.pos.system.model.others.JournalResponse
import com.pos.system.model.others.ResponsePayment
import com.pos.system.repository.ChargeInfoRepository
import com.pos.system.repository.LogMasterRepository
import com.pos.system.repository.PosTransRepository
import com.pos.system.repository.ReceiptMasterRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.*
import java.util.regex.Pattern


@Service
class LogService(
    private val logMasterRepository: LogMasterRepository,
    private val chargeInfoRepository: ChargeInfoRepository,
    private val emailService: EmailService,
    private val receiptMasterRepository: ReceiptMasterRepository,
    private val posTransRepository: PosTransRepository
) {

    private val logger = LoggerFactory.getLogger(LogService::class.java)

    fun saveLogInfo(model: LogRequestModel) {
        val localDate = LocalDate.now()
        val localTime = LocalTime.now()
        val posModel = Util.decodeJWT(model.getAuthorization())
        val log = LogMaster()
        log.companyCode = posModel?.companyCode
        log.storeCode = posModel?.storeCode
        log.instoreCode = posModel?.inStoreCode
        try {
            val recordDateTime = model.recordTimestamp
            if (recordDateTime != null && model.macAddress != null) {
                val timestamp = Timestamp(recordDateTime)
                log.recordTimestamp = timestamp
                if (logMasterRepository.findRecordByMacAddressAndTimestamp(model.macAddress!!, timestamp) != null && !model.isUpdated) {
                    logger.info("saveLogInfo exist record = ${ObjectMapper().writeValueAsString(model)}")
                    return
                }
            }
            log.ipAddress = model.ipAddress
            log.url = model.url
            log.request = model.request
            log.response = model.response
            log.responseCode = model.responseCode
            log.environment = model.environment
            log.headers = ObjectMapper().writeValueAsString(model.headers)
            log.macAddress = model.macAddress
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {

            log.recordCreateDate = localDate
            log.recordCreateTime = localTime

            log.recordUpdateDate = localDate
            log.recordUpdateTime = localTime
            log.recordVoidFlag = "''"
            if (!model.isUpdated) logMasterRepository.save(log)
            if (log.responseCode == HttpStatus.OK.value()) {
                val receiptNo = handleSaleLog(log, model)
                saveChangeMoneyInfo(model, receiptNo, posModel)
            }
        } catch (ex: Exception) {
            ex.printStackTrace()
            logger.info("saveLogInfo ;" + model.url + " ; throw InternalServerError()")
            throw InternalServerError()
        }
    }

    @Transactional
    private fun saveChangeMoneyInfo(model: LogRequestModel, receiptNo: String, posModel: LoginRequest?) {
        try {
            val url = model.url ?: return
            if (receiptNo.isEmpty() && url.contains(Constants.URL_MONEY_CURRENT)) return
            val difference = model.difference
            val localDate = LocalDate.now()
            val localTime = LocalTime.now()
            val result =
                posTransRepository.getLatestRecord(posModel?.companyCode ?: "", posModel?.storeCode ?: "", posModel?.inStoreCode ?: "")
            val difference10000 = difference?.difference10000 ?: 0
            val difference5000 = difference?.difference5000 ?: 0
            val difference2000 = difference?.difference2000 ?: 0
            val difference1000 = difference?.difference1000 ?: 0
            val difference500 = difference?.difference500 ?: 0
            val difference100 = difference?.difference100 ?: 0
            val difference50 = difference?.difference50 ?: 0
            val difference10 = difference?.difference10 ?: 0
            val difference5 = difference?.difference5 ?: 0
            val difference1 = difference?.difference1 ?: 0
            val drawer500 = difference?.drawer500 ?: 0
            val drawer100 = difference?.drawer100 ?: 0
            val drawer50 = difference?.drawer50 ?: 0
            val drawer10 = difference?.drawer10 ?: 0
            val drawer5 = difference?.drawer5 ?: 0
            val drawer1 = difference?.drawer1 ?: 0
            val count10000 = result?.count10000 ?: 0
            val count5000 = result?.count5000 ?: 0
            val count2000 = result?.count2000 ?: 0
            val count1000 = result?.count1000 ?: 0
            val count500 = result?.count500 ?: 0
            val count100 = result?.count100 ?: 0
            val count50 = result?.count50 ?: 0
            val count10 = result?.count10 ?: 0
            val count5 = result?.count5 ?: 0
            val count1 = result?.count1 ?: 0
            val posTrans = PosTrans()
            posTrans.companyCode = posModel?.companyCode ?: ""
            posTrans.storeCode = posModel?.storeCode ?: ""
            posTrans.instoreCode = posModel?.inStoreCode ?: ""
            posTrans.recordCreateDate = localDate
            posTrans.recordCreateTime = localTime
            posTrans.recordUpdateDate = localDate
            posTrans.recordUpdateTime = localTime
            posTrans.recordVoidFlag = "0"
            posTrans.recordDatetime = Util.timeStampNow
            posTrans.receiptNo = receiptNo
            posTrans.difference10000 = difference10000
            posTrans.difference5000 = difference5000
            posTrans.difference2000 = difference2000
            posTrans.difference1000 = difference1000
            posTrans.difference500 = difference500
            posTrans.difference100 = difference100
            posTrans.difference50 = difference50
            posTrans.difference10 = difference10
            posTrans.difference5 = difference5
            posTrans.difference1 = difference1
            posTrans.count10000 = count10000.safeSum(difference10000)
            posTrans.count5000 = count5000.safeSum(difference5000)
            posTrans.count2000 = count2000.safeSum(difference2000)
            posTrans.count1000 = count1000.safeSum(difference1000)
            posTrans.count500 = count500.safeSum(difference500)
            posTrans.count100 = count100.safeSum(difference100)
            posTrans.count50 = count50.safeSum(difference50)
            posTrans.count10 = count10.safeSum(difference10)
            posTrans.count5 = count5.safeSum(difference5)
            posTrans.count1 = count1.safeSum(difference1)

            posTrans.drawer500 = (result?.drawer500 ?: 0).safeSum(drawer500)
            posTrans.drawer100 = (result?.drawer100 ?: 0).safeSum(drawer100)
            posTrans.drawer50 = (result?.drawer50 ?: 0).safeSum(drawer50)
            posTrans.drawer10 = (result?.drawer10 ?: 0).safeSum(drawer10)
            posTrans.drawer5 = (result?.drawer5 ?: 0).safeSum(drawer5)
            posTrans.drawer1 = (result?.drawer1 ?: 0).safeSum(drawer1)
            posTrans.classInfo = when {
                url.endsWith(Constants.URL_CUSTOMER_POINT_PAYMENT) -> ClassType.Flow40
                url.endsWith(Constants.URL_CASH_CHANGER_REPLENISH) ||
                        (posModel?.companyCode == Constants.Company.KASUMI.code
                                && url.endsWith(Constants.URL_CASH_CHANGER_REGISTER)) -> ClassType.Flow284
                url.endsWith(Constants.URL_CASH_CHANGER_RECOVER) -> ClassType.Flow285
                url.endsWith(Constants.URL_CUSTOMER_SALES_SETTLE) -> ClassType.Flow2130
                url.endsWith(Constants.URL_FLOW25) -> ClassType.Flow25
                url.endsWith(Constants.URL_CASHCHANGER_VERIFICATE) -> {
                    val requestModel = model.request?.toObject(VerificateRequestModel::class.java)
                        ?: VerificateRequestModel()
                    posTrans.count10000 = requestModel.count10000
                    posTrans.count5000 = requestModel.count5000
                    posTrans.count2000 = requestModel.count2000
                    posTrans.count1000 = requestModel.count1000
                    posTrans.count500 = requestModel.count500
                    posTrans.count100 = requestModel.count100
                    posTrans.count50 = requestModel.count50
                    posTrans.count10 = requestModel.count10
                    posTrans.count5 = requestModel.count5
                    posTrans.count1 = requestModel.count1
                    posTrans.drawer500 = requestModel.stickCount.count500
                    posTrans.drawer100 = requestModel.stickCount.count100
                    posTrans.drawer50 = requestModel.stickCount.count50
                    posTrans.drawer10 = requestModel.stickCount.count10
                    posTrans.drawer5 = requestModel.stickCount.count5
                    posTrans.drawer1 = requestModel.stickCount.count1
                    ClassType.Flow23
                }
                else -> {
                    if (difference == null)
                    return
                    else ClassType.NONE
                }
            }.value

            posTransRepository.save(posTrans)
        } catch (ex: Exception) {
            ex.printStackTrace()
            throw InternalServerError()
        }
    }

    fun Int.safeSum(other: Int): Int {
        return (this + other).coerceAtLeast(0)
    }

    @Transactional
    private fun handleSaleLog(log: LogMaster, logRequestModel: LogRequestModel): String {
        if (log.responseCode != HttpStatus.OK.value()) {
            val isBAPI =
                    log.url?.endsWith(Constants.URL_SETTING_DEVICE_GET) == true || log.url?.contains(Constants.URL_SETTING_CASH_CHANGER_GET) == true
            if (isBAPI && log.storeCode != Constants.DEFAULT_STORE_CODE && log.instoreCode != Constants.DEFAULT_INSTORE_CODE) return ""
            //TODO thực hiện send email đang bị mất thời gian và ảnh hưởng tới flow call api của clients => nghiên cứu dùng Job
//            notifyErrorSale(log)
            return ""
        }
        val receipt = when {
            log.url?.endsWith(Constants.URL_CUSTOMER_POINT_PAYMENT) == true -> {
                val objectMapper = ObjectMapper()
                val data = objectMapper.readValue(log.response, ResponsePayment::class.java)
                if (logRequestModel.isUpdated) {
                    return data.meta?.receiptNo ?: ""
                }
                handleChargeInfoFlow40(log, data)
                extractReceiptMasterFlowUrl(log, data)
            }

            log.url?.endsWith(Constants.URL_CUSTOMER_SALES_SETTLE) == true
                    || log.url?.endsWith(Constants.URL_CUSTOMER_SALES_CANCEL) == true -> {
                val data = try {
                    val objectMapper = ObjectMapper()
                    objectMapper.readValue(log.response, ResponsePayment::class.java)
                } catch (e: Exception) {
                    logger.error("error 3 log.recordId=" + log.recordId + "; msg = " + e.message)
                    return ""
                }
                extractReceiptMasterFlowUrl(log, data)
            }

            log.url?.endsWith(Constants.URL_CASH_CHANGER_REPLENISH) == true ||
                    (log.url?.endsWith(Constants.URL_CASH_CHANGER_REGISTER) == true && log.companyCode == Constants.Company.KASUMI.code) -> {
                handleChargeInfoFlow28(log, ClassType.Flow284)
                extractReceiptMasterFlowJournal(log)
            }

            log.url?.endsWith(Constants.URL_CASH_CHANGER_RECOVER) == true -> {
                handleChargeInfoFlow28(log, ClassType.Flow285)
                extractReceiptMasterFlowJournal(log)
            }

            else -> extractReceiptMasterFlowJournal(log)
        }
        return receipt?.receiptNo ?: ""
    }

    private fun extractReceiptMasterFlowUrl(log: LogMaster, data: ResponsePayment): ReceiptMaster {
        val receipt = ReceiptMaster()
        saveValueReceipt(log, receipt)
        try {
            val stringDateTime = data.meta?.transactionDatetimeReceiptFmt
            val datetime = DateTimeFormatter.ofPattern(Constants.STRING_DATE_FORMAT_JAPANESE, Locale.JAPANESE).parse(stringDateTime)
            receipt.receiptCreateDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(datetime)
            receipt.receiptCreateTime = DateTimeFormatter.ofPattern("HH:mm:ss").format(datetime)
            receipt.receiptNo = data.meta?.receiptNo
            receipt.employeeCode = data.employee?.code
            receiptMasterRepository.save(receipt)
            return receipt
        } catch (e: Exception) {
            logger.error("error log.recordId=" + log.recordId + "; msg = " + e.message)
            throw e
        }
    }

    private fun extractReceiptMasterFlowJournal(log: LogMaster) : ReceiptMaster? {
        val receipt = ReceiptMaster()
        saveValueReceipt(log, receipt)
        try {
            val response = log.response!!
            if (response.contains("\"journal\"")) {
                val matcher = Pattern.compile("\"journal\":.+(\\d{4}.+\\d{2}.+\\d{2}.+\\([^)]+\\)\\d{2}:\\d{2}?).+店:(.+?) ﾚｼﾞNo:(.+?) .+ﾚｼｰﾄNo:(.+?)責:(\\d*)\\D.+", Pattern.MULTILINE).matcher(response)

                if (matcher.find()) {
                    val datetime = DateTimeFormatter.ofPattern(Constants.STRING_DATE_FORMAT_JAPANESE, Locale.JAPANESE)
                            .parse(matcher.group(1)
                            .replace("\\n", "")
                            .replace("\\r", "").trim())
                    receipt.receiptCreateDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(datetime)
                    receipt.receiptCreateTime = DateTimeFormatter.ofPattern("HH:mm:ss").format(datetime)
                    receipt.receiptNo = matcher.group(4).replace("\\n", "")
                            .replace("\\r", "").trim()
                    receipt.employeeCode = matcher.group(5).replace("\\n", "")
                            .replace("\\r", "").trim()
                    receiptMasterRepository.save(receipt)
                    return receipt
                } else {
                    return null
                }
            } else {
                return null
            }
        } catch (e: Exception) {
            logger.error("error 2 log.recordId=" + log.recordId + "; msg = " + e.message)
            throw e
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

    private fun handleChargeInfoFlow40(log: LogMaster, data: ResponsePayment) {
        try {
            val datetime = data.meta?.businessDate.toInteger
            saveToChargeInfo(log, ClassType.Flow40, data.meta?.receiptNo, data.payment?.paymentTotalPrice, datetime)
        } catch (e: Exception) {
            logger.error(e.message)
            throw InternalServerError()
        }
    }

    private fun handleChargeInfoFlow28(log: LogMaster, flowID: ClassType) {
        try {
            val objectMapper = ObjectMapper()
            val data = objectMapper.readValue(log.response, JournalResponse::class.java)
            val (receiptNo, datetime, amount) = handleJournal(data.journal, flowID, log)
            saveToChargeInfo(log, flowID, receiptNo, amount, datetime)
        } catch (e: Exception) {
            e.printStackTrace()
            throw InternalServerError()
        }
    }

    private fun saveToChargeInfo(log: LogMaster, flowID: ClassType, receiptNo: String?, amount: Int?, datetime: Int?) {
        val localTime = LocalTime.now()
        val localDate = LocalDate.now()
        val chargeInfo = ChargeInfo()
        chargeInfo.companyCode = log.companyCode
        chargeInfo.instoreCode = log.instoreCode
        chargeInfo.storeCode = log.storeCode
        chargeInfo.recordUpdateDate = localDate
        chargeInfo.recordCreateDate = chargeInfo.recordUpdateDate
        chargeInfo.recordCreateTime = localTime
        chargeInfo.recordUpdateTime = chargeInfo.recordCreateTime
        chargeInfo.classInfo = flowID
        chargeInfo.receiptNo = receiptNo
        chargeInfo.amount = amount ?: 0
        chargeInfo.recordDatetime = datetime
        chargeInfoRepository.save(chargeInfo)
    }

    private fun handleJournal(journalValue: String?, flowID: ClassType, log: LogMaster): Triple<String?, Int?, Int?> {
        println("LogService:Info:handleJournal-flowID=$flowID")
        val lines = journalValue?.split("\r\n")
        val receiptInfo = lines?.firstOrNull {
            it.contains("ﾚｼｰﾄNo")
        }?.split(":")

        val amountInfo = when (flowID) {
            ClassType.Flow284 -> {
                if (log.companyCode == Constants.Company.KASUMI.code && log.url?.startsWith(Constants.URL_CASH_CHANGER_REGISTER) == true) {
                    lines?.firstOrNull { it.contains("* 合計 *") && it.contains("¥") }
                } else {
                    lines?.firstOrNull { it.contains("補充金額") || it.contains("準備金額") }
                }
            }
            ClassType.Flow285 -> lines?.firstOrNull { it.contains("回収金額") }
            else -> null
        }?.split("¥")
        val amount = amountInfo?.get(1).toInteger ?: 0

        val dateInfo = lines?.firstOrNull { it.contains("年") }?.split("日")?.get(0)
        val date = dateInfo.toInteger

        return Triple(receiptInfo?.get(1), date, if (flowID == ClassType.Flow285) -amount else amount)
    }

    val String?.toInteger: Int? get() = filterNumber(this)?.toIntOrNull()
    fun filterNumber(input: String?): String? {
        return input?.filter {
            it.isDigit()
        }
    }

    private fun notifyErrorSale(log: LogMaster) {
        val subject = "Error call API: ${log.url}"
        val name = when (log.companyCode) {
            Constants.Company.KASUMI.code -> Constants.Company.KASUMI.name
            Constants.Company.MARUETSU.code -> Constants.Company.MARUETSU.name
            Constants.Company.MAXVALUE.code -> Constants.Company.MAXVALUE.name
            else -> log.companyCode
        }
        val body = "Company Code: ${log.companyCode}\n" +
                "Company Name: $name\n" +
                "Store Code:   ${log.storeCode}\n" +
                "Instore Code: ${log.instoreCode}\n" +
                "IP Address:   ${log.ipAddress}\n\n" +
                "Request Url: ${log.url}" + "\n" +
                "Request Content: ${log.request}" + "\n" +
                "\n" +
                "Response Code: ${log.responseCode}" + "\n" +
                "Response Content: ${log.response}"
        emailService.sendEmail("tranvandat@luvina.net", subject = subject, body = body)
    }

    //TODO import old data
    @Transactional
    private fun rollbackData() {
        receiptMasterRepository.deleteAll()
        val data = logMasterRepository.findAll()
        val size = data.size
        data.forEachIndexed {index, it ->
            if (index % 10 == 0 || index > size - 2) println("progress = " + (index * 100 / size))
            saveOldDataLogToReceiptTable(it)
        }
    }

    //TODO import old data
    private fun saveOldDataLogToReceiptTable(log: LogMaster) {
        if (log.responseCode != HttpStatus.OK.value()) {
            val isBAPI =
                    log.url?.endsWith(Constants.URL_SETTING_DEVICE_GET) == true || log.url?.contains(Constants.URL_SETTING_CASH_CHANGER_GET) == true
            if (isBAPI && log.storeCode != Constants.DEFAULT_STORE_CODE && log.instoreCode != Constants.DEFAULT_INSTORE_CODE) return
            //TODO thực hiện send email đang bị mất thời gian và ảnh hưởng tới flow call api của clients => nghiên cứu dùng Job
            return
        }

        when {
            log.url?.endsWith(Constants.URL_CUSTOMER_POINT_PAYMENT) == true -> {
                val objectMapper = ObjectMapper()
                val data = objectMapper.readValue(log.response, ResponsePayment::class.java)
                extractReceiptMasterFlowUrl(log, data)
            }

            log.url?.endsWith(Constants.URL_CUSTOMER_SALES_SETTLE) == true
                    || log.url?.endsWith(Constants.URL_CUSTOMER_SALES_CANCEL) == true -> {
                val data = try {
                    val objectMapper = ObjectMapper()
                    objectMapper.readValue(log.response, ResponsePayment::class.java)
                } catch (e: Exception) {
                    logger.error("error 3 log.recordId=" + log.recordId + "; msg = " + e.message)
                    return
                }
                extractReceiptMasterFlowUrl(log, data)
            }

            log.url?.endsWith(Constants.URL_CASH_CHANGER_REPLENISH) == true -> {
                extractReceiptMasterFlowJournal(log)
            }

            log.url?.endsWith(Constants.URL_CASH_CHANGER_RECOVER) == true -> {
                extractReceiptMasterFlowJournal(log)
            }

            else -> extractReceiptMasterFlowJournal(log)
        }
    }

    fun getMoneyCurrent(companyCode: String, storeCode: String, inStoreCode: String, classInfo: Int?): PosTrans? {
        return posTransRepository.getLatestRecord(companyCode, storeCode, inStoreCode, classInfo)
    }

    fun getMoneyCurrent(companyCode: String, storeCode: String, inStoreCode: String, receiptNo: String?): PosTrans? {
        return posTransRepository.getLatestRecord(companyCode, storeCode, inStoreCode, receiptNo)
    }

    fun updateMoneyCurrent(posTrans: PosTrans, difference: DifferenceModel) {
        try {
            val difference10000 = difference.difference10000
            val difference5000 = difference.difference5000
            val difference2000 = difference.difference2000
            val difference1000 = difference.difference1000
            val difference500 = difference.difference500
            val difference100 = difference.difference100
            val difference50 = difference.difference50
            val difference10 = difference.difference10
            val difference5 = difference.difference5
            val difference1 = difference.difference1
            posTrans.difference10000 = difference10000
            posTrans.difference5000 = difference5000
            posTrans.difference2000 = difference2000
            posTrans.difference1000 = difference1000
            posTrans.difference500 = difference500
            posTrans.difference100 = difference100
            posTrans.difference50 = difference50
            posTrans.difference10 = difference10
            posTrans.difference5 = difference5
            posTrans.difference1 = difference1
            posTrans.count10000 = posTrans.count10000.safeSum(difference10000)
            posTrans.count5000 = posTrans.count5000.safeSum(difference5000)
            posTrans.count2000 = posTrans.count2000.safeSum(difference2000)
            posTrans.count1000 = posTrans.count1000.safeSum(difference1000)
            posTrans.count500 = posTrans.count500.safeSum(difference500)
            posTrans.count100 = posTrans.count100.safeSum(difference100)
            posTrans.count50 = posTrans.count50.safeSum(difference50)
            posTrans.count10 = posTrans.count10.safeSum(difference10)
            posTrans.count5 = posTrans.count5.safeSum(difference5)
            posTrans.count1 = posTrans.count1.safeSum(difference1)
            posTransRepository.save(posTrans)
        } catch (e: Exception) {
            throw InternalServerError()
        }
    }
}
//TODO import old data
//fun main() {
//    val str = "{\"company_code\":\"300\",\"store_code\":\"048405\",\"instore_code\":\"901\",\"os_type\":\"android\",\"os_version\":\"11\",\"app_version\":\"230824-01\",\"opening_status\":{\"status\":\"opened\",\"business_open_date\":\"2023/08/31\",\"business_open_day_of_week\":\"(木)\",\"business_open_count\":1559,\"business_open_receipt_datetime\":\"2023年08月31日(木)15:20\",\"business_open_journal_no\":\"000000000000015393\",\"business_open_receipt_no\":\"5394\"},\"employee\":{\"code\":\"100881136\",\"name\":\"１３６セルフレジ                        \"},\"journal\":\"--------------------------------\\r\\n              開設              \\r\\n2023年08月31日(木)15:20         \\r\\n店:048405 ﾚｼﾞNo:901             \\r\\n                                \\r\\n営業日                2023/08/31\\r\\nOSﾊﾞｰｼﾞｮﾝ              android11\\r\\nｱﾌﾟﾘﾊﾞｰｼﾞｮﾝ            230824-01\\r\\nﾚｼｰﾄNo:5394                     \\r\\n責:100881136１３６セルフレジ    \\r\\n\"}"
//    val matcher = Pattern.compile("(\\d{4}.+\\d{2}.+\\d{2}.+\\([^)]+\\)\\d{2}:\\d{2}?).+店:(.+?) ﾚｼﾞNo:(.+?) .+ﾚｼｰﾄNo:(.+?)責:(\\d+)\\D.+", Pattern.MULTILINE).matcher(str)
//
//    println("")
//}


//@Component
//class DataLoader(val logService: LogService
//) : CommandLineRunner {
//
//
//    @Throws(java.lang.Exception::class)
//    override fun run(vararg args: String) {
//        println("DataLoader run")
//        logService.rollbackData()
//    }
//}