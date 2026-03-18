package com.pos.system.controllers.v1

import com.pos.system.common.util.Util
import com.pos.system.exception.BadRequest
import com.pos.system.exception.UnAuthorized
import com.pos.system.model.db.ResponseAllReceipt
import com.pos.system.model.dto.*
import com.pos.system.service.ReceiptService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/pos/v1/receipt")
class ReceiptController(private val receiptService: ReceiptService) {

    @PostMapping(value = ["/search"])
    @ResponseStatus(HttpStatus.OK)
    fun getReceiptMaster(@Valid @RequestBody model: ReceiptRequestModel?,
                         bdResult: BindingResult): ResponseAllReceipt {
        val modelToken = Util.dataToken ?: throw UnAuthorized()
        if (model == null || bdResult.hasErrors()) {
            throw BadRequest()
        }

        return receiptService.findReceiptMaster(model, modelToken)
    }

    @PostMapping(value = ["/employee"])
    @ResponseStatus(HttpStatus.OK)
    fun getEmployeeInStore(): List<EmployeeMasterDTO> {
        val model = Util.dataToken ?: throw UnAuthorized()
        return receiptService.findEmployeeInStore(model)
    }

    @PostMapping(value = ["/choose"])
    @ResponseStatus(HttpStatus.OK)
    fun chooseReceipt(@Valid @RequestBody model: ReceiptRequestData?,
                      bdResult: BindingResult): LogMasterDTO {
        if (model == null || bdResult.hasErrors()) {
            throw BadRequest()
        }

        return receiptService.chooseReceipt(model)
    }
}