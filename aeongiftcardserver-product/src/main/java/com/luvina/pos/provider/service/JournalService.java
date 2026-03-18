package com.luvina.pos.provider.service;

import com.luvina.pos.provider.domain.transaction.Journal;
import com.luvina.pos.provider.domain.transaction.ReceiptNoManager;
import com.luvina.pos.provider.domain.transaction.primarykey.JournalId;
import com.luvina.pos.provider.domain.transaction.primarykey.ReceiptNoId;
import com.luvina.pos.provider.dto.app.JournalDto;
import com.luvina.pos.provider.dto.app.JournalItemDto;
import com.luvina.pos.provider.dto.app.SearchJournalReqDto;
import com.luvina.pos.provider.dto.base.PageResponse;
import com.luvina.pos.provider.exception.NotFoundException;
import com.luvina.pos.provider.mapper.JournalMapper;
import com.luvina.pos.provider.mapper.ReceiptNoMapper;
import com.luvina.pos.provider.mapper.keymapper.JournalIdMapper;
import com.luvina.pos.provider.mapper.keymapper.ReceiptIdMapper;
import com.luvina.pos.provider.repository.custom.JournalSearch;
import com.luvina.pos.provider.repository.transaction.JournalRepository;
import com.luvina.pos.provider.repository.transaction.ReceiptNoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.luvina.pos.provider.constant.CommonConstants.EMPLOYEE_CODE_DEFAULT;
import static com.luvina.pos.provider.constant.MessageConstant.MSG001E;

@Slf4j
@Service
@RequiredArgsConstructor
public class JournalService {
    private final JournalSearch journalSearch;
    private final EmployeeService employeeService;
    private final JournalMapper journalMapper;
    private final JournalIdMapper journalIdMapper;
    private final JournalRepository journalRepository;
    private final ReceiptNoRepository receiptNoRepository;
    private final ReceiptIdMapper receiptIdMapper;
    private final ReceiptNoMapper receiptNoMapper;


    public PageResponse<JournalItemDto> searchJournal(SearchJournalReqDto req) {

        int page = req.getPageNumber() == null ? 1 : req.getPageNumber();
        int limit = req.getLimit() == null ? 50 : req.getLimit();
        int offset = (page - 1) * limit;
        long total = journalSearch.countJournal(req);
        if (total == 0) {
            throw new NotFoundException(MSG001E);
        }
        String nameEmployee = employeeService.getEmployeeName();
        int totalPage = (int) Math.ceil((double) total / limit);

        List<JournalItemDto> items = journalSearch.searchJournal(req, offset, limit, EMPLOYEE_CODE_DEFAULT, nameEmployee);

        return new PageResponse<>(total, page, totalPage, items);
    }

    public boolean saveJournal(JournalDto journalDto) {
        JournalId journalId = journalIdMapper.toJournalId(journalDto);
        Journal journal = journalMapper.toJournal(journalDto);
        journal.setId(journalId);
        journalRepository.save(journal);
        saveReceiptNo(journalDto);
        return true;
    }

    private void saveReceiptNo(JournalDto journalDto) {
        ReceiptNoId receiptNoId = receiptIdMapper.toReceiptNoId(journalDto);
        ReceiptNoManager receiptNoManager = receiptNoMapper.toReceiptNoManager(journalDto);
        receiptNoManager.setId(receiptNoId);
        ReceiptNoManager receiptNoCurrent = receiptNoRepository.findById(receiptNoId).orElse(null);
        receiptNoManager.setPrcno(journalDto.getPrcno());
        if (receiptNoCurrent == null || receiptNoManager.getRecordDt().isAfter(receiptNoCurrent.getRecordDt())) {
            receiptNoRepository.save(receiptNoManager);
        }
    }
}
