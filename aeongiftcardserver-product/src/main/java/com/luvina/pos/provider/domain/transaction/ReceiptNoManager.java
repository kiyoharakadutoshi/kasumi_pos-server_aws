package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.ReceiptNoId;
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
@Table(name = "receipt_no_manager", schema = "T_KSM")
public class ReceiptNoManager extends AbstractAuditingEntity {
    @EmbeddedId
    private ReceiptNoId id;

    @Column(name = "record_timestamp", nullable = false)
    private LocalDateTime recordDt;

    @Column(name = "receipt_no", nullable = false)
    private String prcno;
}
