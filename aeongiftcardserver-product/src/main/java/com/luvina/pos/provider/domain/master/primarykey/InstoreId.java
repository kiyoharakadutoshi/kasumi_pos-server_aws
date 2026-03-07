package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class InstoreId implements Serializable {

    private static final long serialVersionUID = 351285433092595264L;

    @Column(name = "instore_code", nullable = false)
    private String instoreCode;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}