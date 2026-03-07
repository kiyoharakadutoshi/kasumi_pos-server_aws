package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class PermissionId implements Serializable {

    private static final long serialVersionUID = 6466519442471847277L;

    @Column(name = "menu_code", nullable = false, length = 3)
    private String menuCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}