package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.config.convert.RequestMappingObject;
import com.luvina.pos.provider.dto.app.JournalDto;
import com.luvina.pos.provider.dto.app.SearchJournalReqDto;
import com.luvina.pos.provider.dto.base.BaseResponse;
import com.luvina.pos.provider.service.JournalService;
import com.luvina.pos.provider.service.SettingDeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app")
public class JournalController {
    private final JournalService journalService;

    @GetMapping("/journals")
    public ResponseEntity<BaseResponse> getJournal(@Valid @RequestMappingObject SearchJournalReqDto reqDto) {
        return ResponseEntity.ok(BaseResponse.builder().data(journalService.searchJournal(reqDto)).build());
    }

    @PostMapping("/journals/save")
    public ResponseEntity<BaseResponse> saveJournal(@RequestBody JournalDto journalDto) {
        return ResponseEntity.ok(BaseResponse.builder().data(journalService.saveJournal(journalDto)).build());
    }
}
