package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class PermissionRoleId implements Serializable {

    private static final long serialVersionUID = 8607495897597736190L;

    @Column(name = "menu_code", nullable = false, length = 3)
    private String menuCode;

    @Column(name = "role_code", nullable = false, length = 2)
    private String roleCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}