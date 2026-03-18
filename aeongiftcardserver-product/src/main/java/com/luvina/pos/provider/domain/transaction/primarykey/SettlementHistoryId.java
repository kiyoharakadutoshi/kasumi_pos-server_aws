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
public class SettlementHistoryId implements Serializable {

    @Serial
    private static final long serialVersionUID = -3709139865061882089L;

    @Column(name = "output_datetime", nullable = false)
    private LocalDateTime outputDatetime;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

    @Column(name = "path_file_output", length = 500, nullable = false)
    private String pathFileOutput;
}