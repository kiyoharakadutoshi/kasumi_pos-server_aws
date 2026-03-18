package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.dto.app.*;
import com.luvina.pos.provider.dto.base.BaseResponse;
import com.luvina.pos.provider.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app")
public class AppController {

    private final HealthCheckService healthCheckService;

    private final LogMasterService logMasterService;

    private final UpdateAppService updateAppService;

    private final TransactionService transactionService;

    private final SettlementHistoryService settlementHistoryService;

    @PostMapping("/status-update")
    public ResponseEntity<BaseResponse> updateStatus(@Valid @RequestBody MachineInfoDto machineInfoDto) {
        var saveTimeSV = healthCheckService.healthCheck(machineInfoDto);
        return ResponseEntity.ok(BaseResponse.builder()
                .data(saveTimeSV)
                .build());
    }

    @PostMapping("/payment/create")
    public ResponseEntity<BaseResponse> saveTransaction(@Valid @RequestBody ListTransactionDto listTransactionDto) {
        return ResponseEntity.ok(BaseResponse.builder()
                .data(transactionService.saveTransaction(listTransactionDto))
                .build());
    }

    @PostMapping("/settlement/check")
    public ResponseEntity<BaseResponse> checkSettlement() {
        return ResponseEntity.ok(BaseResponse.builder()
                .data(settlementHistoryService.checkSettlement())
                .build());
    }

    @PostMapping("/log")
    public ResponseEntity<BaseResponse> logMaster(@Valid @RequestBody LogInfoDto logInfoDto) {
        return ResponseEntity.ok(BaseResponse.builder()
                .data(logMasterService.saveLog(logInfoDto))
                .build());
    }

    @PostMapping("/log-file")
    public ResponseEntity<BaseResponse> logFile(@Valid @RequestBody LogChunkDto logChunkDto) {
        return ResponseEntity.ok(BaseResponse.builder()
                .data(logMasterService.processChunk(logChunkDto))
                .build());
    }

    @PostMapping("/check-update")
    public ResponseEntity<BaseResponse> checkUpdate(@Valid @RequestBody InfoUpdateRequest infoUpdateRequest) {
        InfoUpdateResponse result = updateAppService.getInfoUpdateResponse(infoUpdateRequest);
        switch (result.getStatus()) {
            case 1 -> {
                return ResponseEntity.ok(BaseResponse.builder()
                        .data("It's the latest version, no need to update")
                        .build());
            }
            case 2 -> {
                return ResponseEntity.ok(BaseResponse.builder()
                        .data("Updates are not allowed")
                        .build());
            }
            default -> {
                return ResponseEntity.ok(BaseResponse.builder()
                        .data(result)
                        .build());
            }
        }
    }

    @PostMapping("/download")
    public ResponseEntity<BaseResponse> downloadApp(@Valid @RequestBody RequestDownloadDto requestDownloadDto) {
        String urlDownload = updateAppService.getUrlDownload(requestDownloadDto.getStringPath(), 10);
        return ResponseEntity.status(HttpStatus.FOUND) // 302
                .location(URI.create(urlDownload))
                .build();
    }

}