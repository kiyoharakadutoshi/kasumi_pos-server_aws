package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class EmployeeId implements Serializable {

    private static final long serialVersionUID = -1507660535893217016L;

    @Column(name = "employee_code", nullable = false, length = 16)
    private String employeeCode;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}