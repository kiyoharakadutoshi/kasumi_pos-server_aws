package com.luvina.pos.provider.domain.transaction.primarykey;

import com.luvina.pos.provider.domain.master.Instore;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
public class ReceiptNoId implements Serializable {
    @Serial
    private static final long serialVersionUID = -54839284944276321L;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "instore_code", nullable = false)
    private String instoreCode;

    public ReceiptNoId(Integer companyCode, Integer storeCode, String instoreCode) {
        this.companyCode = companyCode;
        this.storeCode = storeCode;
        this.instoreCode = instoreCode;
    }
}
