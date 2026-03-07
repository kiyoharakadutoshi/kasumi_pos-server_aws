package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.master.primarykey.PermissionRoleId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "permission_roles", schema = "M_KSM")
public class PermissionRole {

    @EmbeddedId
    private PermissionRoleId id;

    @Column(name = "status", nullable = false)
    private Short status;

}