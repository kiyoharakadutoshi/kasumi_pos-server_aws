package com.luvina.pos.provider.domain.master.primarykey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
public class UserId implements Serializable {

    private static final long serialVersionUID = -5973675891111646242L;

    @Column(name = "user_id", nullable = false, length = 32)
    private String userId;

    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

}