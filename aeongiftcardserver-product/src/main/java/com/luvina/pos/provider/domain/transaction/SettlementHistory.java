package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.SettlementHistoryId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "settlement_history", schema = "T_KSM")
public class SettlementHistory extends AbstractAuditingEntity {

    @EmbeddedId
    private SettlementHistoryId id;

    @Column(name = "file_sending_time")
    private LocalDateTime fileSendingTime;

    @Column(name = "total_record", nullable = false)
    private Integer totalRecord;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "status")
    private Integer status;
}