package com.luvina.pos.provider.dto.app;

import com.luvina.pos.provider.validate.DateFormat;
import com.luvina.pos.provider.validate.NotFutureDate;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import static com.luvina.pos.provider.constant.CommonConstants.FORMAT_TIME_SECOND;
import static com.luvina.pos.provider.constant.MessageConstant.*;

@Data
public class SearchJournalReqDto {
    @Size(min = 10, max = 10, message = MSG006V_START_DATE)
    @NotFutureDate
    @DateFormat(message = MSG009V_START_DATE)
    private String startDate;

    @Size(min = 10, max = 10, message = MSG006V_END_DATE)
    @NotFutureDate
    @DateFormat(message = MSG009V_END_DATE)
    private String endDate;

    @Size(min = 8, max = 8, message = MSG006V_START_TIME)
    @DateFormat(pattern = FORMAT_TIME_SECOND, message = MSG010V_START_TIME)
    private String startTime;

    @Size(min = 8, max = 8, message = MSG006V_END_TIME)
    @DateFormat(pattern = FORMAT_TIME_SECOND, message = MSG010V_END_TIME)
    private String endTime;

    @Min(value = 1, message = MSG003V_RECEIPT_NO_FROM)
    private Integer receiptNoFrom;

    @Min(value = 1, message = MSG003V_RECEIPT_NO_TO)
    private Integer receiptNoTo;

    @Min(value = 1, message = MSG003V_PAGE_NUMBER)
    private Integer pageNumber;

    @Min(value = 2, message = MSG003V_LIMIT)
    private Integer limit;

}
