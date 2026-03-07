package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.master.primarykey.PermissionId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "permissions", schema = "M_KSM")
public class Permission extends AbstractAuditingEntity {

    @EmbeddedId
    private PermissionId id;

    @Column(name = "alias_name", nullable = false, length = 50)
    private String aliasName;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

}