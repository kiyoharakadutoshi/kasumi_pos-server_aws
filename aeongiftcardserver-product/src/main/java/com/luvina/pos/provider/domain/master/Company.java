package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "companies", schema = "M_KSM")
public class Company extends AbstractAuditingEntity {

    @Id
    @Column(name = "company_code", nullable = false)
    private Integer companyCode;

    @Column(name = "company_name", nullable = false, length = 50)
    private String companyName;

    @Column(name = "company_name_official", length = 50)
    private String companyNameOfficial;

    @Column(name = "company_name_official_short", length = 50)
    private String companyNameOfficialShort;

    @Column(name = "age_verification_ptn", nullable = false)
    private Integer ageVerificationPtn;

    @Column(name = "registration_number", length = 14)
    private String registrationNumber;

}