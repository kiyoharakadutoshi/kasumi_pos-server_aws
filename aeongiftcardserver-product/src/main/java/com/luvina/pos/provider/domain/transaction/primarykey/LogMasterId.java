package com.luvina.pos.provider.domain.transaction.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class LogMasterId implements Serializable {
    @Serial
    private static final long serialVersionUID = -548392849492837671L;

    @Column(name = "instore_code", nullable = false, length = 10)
    private String instoreCode;

    @Column(name = "store_code", nullable = false)
    private String storeCode;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "record_timestamp", columnDefinition = "TIMESTAMP(3)", nullable = false)
    private LocalDateTime recordTimestamp;
}
