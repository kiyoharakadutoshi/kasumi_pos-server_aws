package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.config.convert.RequestMappingObject;
import com.luvina.pos.provider.dto.app.EmployeeReqDto;
import com.luvina.pos.provider.dto.base.BaseResponse;
import com.luvina.pos.provider.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app")
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping("/employee")
    public ResponseEntity<BaseResponse> getEmployee(@Valid @RequestMappingObject EmployeeReqDto employeeCode) {
        return ResponseEntity.ok(BaseResponse.builder().data(employeeService.getEmployee(employeeCode)).build());
    }

}
