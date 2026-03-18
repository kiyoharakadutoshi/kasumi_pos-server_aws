package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class StoreId implements Serializable {

    private static final long serialVersionUID = 2796949224529414335L;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

    public StoreId() {
    }

    public StoreId(Integer companyCode, Integer storeCode) {
        this.companyCode = companyCode;
        this.storeCode = storeCode;
    }
}