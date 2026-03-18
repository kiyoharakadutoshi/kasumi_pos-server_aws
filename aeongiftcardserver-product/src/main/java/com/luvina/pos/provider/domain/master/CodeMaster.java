package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.master.primarykey.CodeMasterId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "code_master", schema = "M_KSM")
public class CodeMaster extends AbstractAuditingEntity {

    @EmbeddedId
    private CodeMasterId id;

    @Column(name = "property_name", length = 50)
    private String propertyName;

    @Column(name = "code_value", length = 50)
    private String codeValue;

    @Column(name = "code_value_ext1", length = 15)
    private String codeValueExt1;

    @Column(name = "code_value_ext2", length = 15)
    private String codeValueExt2;

    @Column(name = "code_value_ext3", length = 15)
    private String codeValueExt3;

    @Column(name = "code_value_ext4", length = 15)
    private String codeValueExt4;

    @Column(name = "`order`")
    private Integer order;

    @Column(name = "created_user_id")
    private Long createdUserId;

    @Column(name = "updated_user_id")
    private Long updatedUserId;

}