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
public class JournalId implements Serializable {

    private static final long serialVersionUID = -58765578070484323L;

    @Column(name = "record_dt", nullable = false)
    private LocalDateTime recordDt;

    @Column(name = "prcno", nullable = false)
    private Integer prcno;

    @Column(name = "account_id", nullable = false, length = 16)
    private String accountId;

    @Column(name = "instore_code", nullable = false, length = 10)
    private String instoreCode;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}