package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.master.primarykey.UserId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "users", schema = "M_KSM")
public class User extends AbstractAuditingEntity {

    @EmbeddedId
    private UserId id;

    @Column(name = "store_code", nullable = false)
    private Integer storeCode;

    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "role_code", nullable = false, length = 2)
    private String roleCode;

    @ColumnDefault("0")
    @Column(name = "created_user_id")
    private Long createdUserId;

    @ColumnDefault("0")
    @Column(name = "updated_user_id")
    private Long updatedUserId;

}