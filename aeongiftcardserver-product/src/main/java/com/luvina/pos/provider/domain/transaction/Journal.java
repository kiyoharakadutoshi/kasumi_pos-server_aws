package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.JournalId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "journals", schema = "T_KSM")
public class Journal extends AbstractAuditingEntity {
    @EmbeddedId
    private JournalId id;

    @Column(name = "record_time", insertable = false, updatable = false, columnDefinition = "GENERATED ALWAYS AS (TIME(record_dt)) STORED")
    private LocalTime recordTime;

    @Column(name = "type")
    private Short type;

    @ColumnDefault("''")
    @Column(name = "print_code_data", length = 24)
    private String printCodeData;

    @ColumnDefault("''")
    @Column(name = "prcname", length = 50)
    private String prcname;

    @Column(name = "jrndata")
    private String jrndata;

    @Column(name = "jrndata_json")
    private String jrndataJson;

    @Column(name = "amount")
    private String amount;

}