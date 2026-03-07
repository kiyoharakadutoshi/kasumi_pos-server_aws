package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.UpdateManagerId;
import jakarta.persistence.*;
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
@Table(name = "update_manager", schema = "T_KSM")
public class UpdateManager extends AbstractAuditingEntity {
    @EmbeddedId
    private UpdateManagerId id;

    @Column(name = "update_flag", nullable = false)
    private String updateFlag;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;

}
