package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.service.SettlementService;
import com.luvina.pos.provider.util.ConvertUtils;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app/batch")
public class BatchController {

    private final SettlementService settlementService;

    @PostMapping("/settlement")
    public LocalDateTime runBatch(@RequestParam(name = "time", required = false) String time) throws SQLException, IOException {
        LocalDateTime timeEnd = StringUtils.isEmpty(time) ? LocalDateTime.now() :
                ConvertUtils.convertStringToLocalDateTime(time, "yyyy-MM-dd HH:mm:ss");
        settlementService.sendFileSettlement(timeEnd);
        return timeEnd;
    }

}
