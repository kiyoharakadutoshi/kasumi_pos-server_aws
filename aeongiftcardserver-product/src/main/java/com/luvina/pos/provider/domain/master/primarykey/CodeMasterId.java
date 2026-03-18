package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;


@Getter
@Setter
@Embeddable
public class CodeMasterId implements Serializable {

    private static final long serialVersionUID = -4952301752302059966L;

    @Column(name = "master_code", nullable = false, length = 6)
    private String masterCode;

    @Column(name = "code_no", nullable = false, length = 10)
    private String codeNo;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}