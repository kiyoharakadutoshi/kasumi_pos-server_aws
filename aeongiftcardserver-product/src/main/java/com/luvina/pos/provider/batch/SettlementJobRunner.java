package com.luvina.pos.provider.batch;

import com.luvina.pos.provider.service.SettlementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.SQLException;
import java.time.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class SettlementJobRunner {

    private final SettlementService settlementService;

    /**
     * Start time for daily batch processing
     */
    private static final LocalTime BATCH_START_TIME = LocalTime.of(9, 0);

    @Scheduled(cron = "0 0 9 * * ?")
    public void runSendDataSettlement() throws SQLException, IOException, InterruptedException {
        log.info("send data settlement started");
        LocalDateTime time = LocalDateTime.now().toLocalDate().atTime(BATCH_START_TIME);
        waitUntilExactTime(time);
        settlementService.sendFileSettlement(time);
        log.info("send data settlement end");
    }

    private void waitUntilExactTime(LocalDateTime targetTime) {
        LocalDateTime now = LocalDateTime.now();
        if (!now.isBefore(targetTime)) {
            return;
        }

        long waitMillis = Duration.between(now, targetTime).toMillis();

        if (waitMillis > 0 && waitMillis < 60_000) {
            try {
                Thread.sleep(waitMillis + 1000L);
            } catch (InterruptedException e) {
                log.warn(e.getMessage(), e);
            }
        }
    }

}
