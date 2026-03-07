package com.luvina.pos.provider.service;

import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.domain.transaction.Journal;
import com.luvina.pos.provider.domain.transaction.Transaction;
import com.luvina.pos.provider.domain.transaction.primarykey.JournalId;
import com.luvina.pos.provider.domain.transaction.primarykey.TransactionId;
import com.luvina.pos.provider.dto.app.JournalDto;
import com.luvina.pos.provider.dto.app.ListTransactionDto;
import com.luvina.pos.provider.dto.app.TransactionDto;
import com.luvina.pos.provider.mapper.JournalMapper;
import com.luvina.pos.provider.mapper.TransactionMapper;
import com.luvina.pos.provider.repository.transaction.JournalRepository;
import com.luvina.pos.provider.repository.transaction.TransactionRepository;
import com.luvina.pos.provider.util.AuthUtil;
import com.luvina.pos.provider.util.ConvertUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final JournalRepository journalRepository;
    private final TransactionMapper transactionMapper;

    public boolean saveTransaction(ListTransactionDto listTransactionDto) {
        try {
            var user = AuthUtil.getCurrentUser();
            List<Transaction> transactionList = new ArrayList<>();
            List<Journal> journalList = new ArrayList<>();
            for (TransactionDto item : listTransactionDto.getItems()) {
                TransactionId id = new TransactionId();
                id.setTransactionDt(ConvertUtils.convertStringToLocalDateTime(item.getCurrentOutputDatetime(), CommonConstants.LOCAL_DATE_TIME_FORMAT_MILLIS));
                id.setCompanyCode(Integer.valueOf(user.getCompanyCode()));
                id.setStoreCode(Integer.valueOf(user.getStoreCode()));
                id.setInstoreCode(user.getInstoreCode());
                Transaction transaction = transactionMapper.toTransaction(item);
                transaction.setId(id);
                transaction.setAmount(item.getPaymentAmount());
                transaction.setType(item.getPaymentType());
                transaction.setApprovalNumber(item.getApprovalNumber());
                transactionList.add(transaction);
                Journal journal = new Journal();
                JournalId journalId = new JournalId();
                journalId.setCompanyCode(Integer.valueOf(user.getCompanyCode()));
                journalId.setStoreCode(Integer.valueOf(user.getStoreCode()));
                journalId.setInstoreCode(user.getInstoreCode());
                journalId.setRecordDt(ConvertUtils.convertStringToLocalDateTime(item.getRecordDt(), CommonConstants.LOCAL_DATE_TIME_FORMAT_SECONDS));
                journalId.setPrcno(Integer.parseInt(item.getReceiptNo()));
                journalId.setAccountId(item.getEmployeeCode());
                journal.setId(journalId);
                journal.setPrcname(item.getReceiptName());
                journal.setJrndata(item.getJournalData());
                journal.setJrndataJson(item.getJournalJson());
                journal.setType((short) 1);
                journal.setAmount(item.getPaymentAmount().toString());
                journalList.add(journal);
            }
            transactionRepository.saveAll(transactionList);
            journalRepository.saveAll(journalList);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false;
        }
        return true;
    }
}
