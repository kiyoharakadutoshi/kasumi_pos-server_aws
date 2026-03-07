package com.pos.system.service

import com.pos.system.exception.BadRequest
import com.pos.system.exception.InternalServerError
import com.pos.system.exception.NotFound
import com.pos.system.model.db.ResponseAllReceipt
import com.pos.system.model.dto.*
import com.pos.system.repository.EmployeeMasterRepository
import com.pos.system.repository.LogMasterRepository
import com.pos.system.repository.ReceiptMasterRepository
import org.springframework.stereotype.Service

@Service
class ReceiptService(private val receiptMasterRepository: ReceiptMasterRepository,
                     private val employeeMasterRepository: EmployeeMasterRepository,
                     private val logMasterRepository: LogMasterRepository
) {
    fun findReceiptMaster(receiptRequestModel: ReceiptRequestModel, model: LoginRequest): ResponseAllReceipt {
        val countReceipt = try {
            receiptMasterRepository.countReceipt(receiptRequestModel.companyCode!!,
                    receiptRequestModel.storeCode!!,
                    receiptRequestModel.startDate,
                    receiptRequestModel.endDate,
                    receiptRequestModel.startTime,
                    receiptRequestModel.endTime,
                    receiptRequestModel.startReceiptNo,
                    receiptRequestModel.endReceiptNo,
                    receiptRequestModel.employeeCode,
                    model.inStoreCode)
        } catch (e: Exception) {
            throw InternalServerError()
        } ?: throw NotFound()
        val listReceiptMaster = try {
            receiptMasterRepository.findReceiptMaster(receiptRequestModel.companyCode!!,
                    receiptRequestModel.storeCode!!,
                    receiptRequestModel.startDate,
                    receiptRequestModel.endDate,
                    receiptRequestModel.startTime,
                    receiptRequestModel.endTime,
                    receiptRequestModel.startReceiptNo,
                    receiptRequestModel.endReceiptNo,
                    receiptRequestModel.employeeCode,
                    receiptRequestModel.limit,
                    receiptRequestModel.offset,
                    model.inStoreCode)
        } catch (e: Exception) {
            throw InternalServerError()
        } ?: throw NotFound()
        val findAllReceipt = ResponseAllReceipt()
        findAllReceipt.numberOfRecord = countReceipt
        findAllReceipt.listReceipt = listReceiptMaster
        return findAllReceipt
    }

    fun findEmployeeInStore(employeeRequest: LoginRequest): List<EmployeeMasterDTO> {
        val listEmployeeMaster = try {
            employeeMasterRepository.findEmployeeInStore(employeeRequest.companyCode,
                    employeeRequest.storeCode)
        } catch (e: Exception) {
            throw BadRequest()
        }
        return listEmployeeMaster
    }

    fun chooseReceipt(receiptRequestData: ReceiptRequestData): LogMasterDTO {
        val stringData = try {
            logMasterRepository.chooseReceipt(receiptRequestData.logID)
        } catch (e: Exception) {
            throw InternalServerError()
        } ?: throw NotFound()
        return stringData
    }
}