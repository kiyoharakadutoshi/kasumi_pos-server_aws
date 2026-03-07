package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.MachineStatusId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "machine_status_history", schema = "T_KSM")
public class MachineStatusHistory extends AbstractAuditingEntity {

    @EmbeddedId
    private MachineStatusId id;

    @Column(name = "record_update_timestamp", nullable = false)
    private LocalDateTime recordUpdateTimestamp;

}
