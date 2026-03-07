package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.luvina.pos.provider.constant.MessageConstant.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeReqDto {
    @NotBlank(message = MSG002V_EMPLOYEE_CODE)
    @Size(min = 1, max = 16, message = MSG001V_EMPLOYEE_CODE)
    private String employeeCode;
}
