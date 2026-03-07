package com.pos.system.controllers.v1

import com.pos.system.common.util.Constants
import com.pos.system.controllers.v1.PosAppController.Companion.responseDelay
import com.pos.system.exception.BadRequest
import com.pos.system.model.dto.LogRequestModel
import com.pos.system.service.LogService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("pos/v1/log")
class LogController(private val logService: LogService) {

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    fun receiveLog(@RequestBody @Valid log: LogRequestModel, bdResult: BindingResult): ResponseEntity<Map<String, Int>> {
        if (bdResult.hasErrors()) {
            throw BadRequest()
        }
        //TODO for testing
        if (responseDelay > 0) {
            Thread.sleep(responseDelay)
        }
        logService.saveLogInfo(log)
        return ResponseEntity.ok().body(hashMapOf(Constants.STATUS_CODE_NAME to HttpStatus.OK.value()))
    }
}