package com.luvina.pos.provider.domain.transaction.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class TransactionId implements Serializable {

    private static final long serialVersionUID = 7068454905890206270L;

    @Column(name = "transaction_dt", nullable = false)
    private LocalDateTime transactionDt;

    @Column(name = "instore_code", nullable = false, length = 10)
    private String instoreCode;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;
}