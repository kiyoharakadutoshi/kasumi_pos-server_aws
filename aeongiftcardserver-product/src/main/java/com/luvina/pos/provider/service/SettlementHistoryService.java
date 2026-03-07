package com.luvina.pos.provider.service;

import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.dto.app.ResCheckSettlement;
import com.luvina.pos.provider.dto.app.TransactionSummaryDto;
import com.luvina.pos.provider.repository.transaction.TransactionRepository;
import com.luvina.pos.provider.util.AuthUtil;
import com.luvina.pos.provider.util.ConvertUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
public class SettlementHistoryService {

    private final TransactionRepository transactionRepository;

    public ResCheckSettlement checkSettlement() {
        ResCheckSettlement res = new ResCheckSettlement();
        var user = AuthUtil.getCurrentUser();
        var companyCode = Integer.valueOf(user.getCompanyCode());
        var storeCode = Integer.valueOf(user.getStoreCode());
        var instoreCode = user.getInstoreCode();
        LocalDateTime now = LocalDateTime.now();
        String currentDateTime = ConvertUtils.convertLocalDateTimeToString(now, CommonConstants.STRING_DATE_TIME_FORMAT_MINUTE);
        LocalDateTime startDate = now.toLocalDate().atTime(LocalTime.of(0, 0));
        TransactionSummaryDto transactionSummaryDto = transactionRepository.summarySettlement(
                companyCode, storeCode, instoreCode, startDate, now
        );
        res.setCompanyCode(String.valueOf(companyCode));
        res.setStoreCode(String.valueOf(storeCode));
        res.setInstoreCode(instoreCode);
        res.setPreviousOutputDatetime(ConvertUtils.convertLocalDateTimeToString(startDate, CommonConstants.STRING_DATE_TIME_FORMAT_MINUTE));
        res.setCurrentOutputDatetime(currentDateTime);
        res.setUsageCount(transactionSummaryDto.getUsageCount());
        res.setUsageAmountTotal(transactionSummaryDto.getUsageAmountTotal());
        res.setRefundCount(transactionSummaryDto.getRefundCount());
        res.setRefundAmountTotal(transactionSummaryDto.getRefundAmountTotal());
        return res;
    }
}
