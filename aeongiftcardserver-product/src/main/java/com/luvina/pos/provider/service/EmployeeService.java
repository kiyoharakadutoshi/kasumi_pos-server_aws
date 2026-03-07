package com.luvina.pos.provider.service;

import com.luvina.pos.provider.domain.master.Employee;
import com.luvina.pos.provider.dto.app.EmployeeReqDto;
import com.luvina.pos.provider.dto.app.EmployeeResDto;
import com.luvina.pos.provider.exception.NotFoundException;
import com.luvina.pos.provider.repository.master.EmployeeRepository;
import com.luvina.pos.provider.util.AuthUtil;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeResDto getEmployee(EmployeeReqDto reqDto) {
        String employeeCode = reqDto.getEmployeeCode();
        Optional<Employee> employee = employeeRepository.findByIdEmployeeCode(employeeCode);
        if (employee.isEmpty()) {
            throw new NotFoundException("MSG001E.employee_code", employeeCode);
        }
        return new EmployeeResDto(
                employeeCode,
                employee.get().getName()
        );
    }

    public String getEmployeeName() {
        String companyCode = AuthUtil.getCurrentUser().getCompanyCode();
        String storeCode = AuthUtil.getCurrentUser().getStoreCode();
        return employeeRepository.findEmployeeName(companyCode, storeCode);
    }
}
