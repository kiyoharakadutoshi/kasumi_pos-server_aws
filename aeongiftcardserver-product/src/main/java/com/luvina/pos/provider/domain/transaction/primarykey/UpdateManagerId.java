package com.luvina.pos.provider.domain.transaction.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class UpdateManagerId implements Serializable {
    @Serial
    private static final long serialVersionUID = -54839284944281523L;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "store_code", nullable = false)
    private String storeCode;

    @Column(name = "instore_code", nullable = false)
    private String instoreCode;

    public UpdateManagerId(String companyCode, String storeCode, String instoreCode) {
        this.companyCode = companyCode;
        this.storeCode = storeCode;
        this.instoreCode = instoreCode;
    }
}
