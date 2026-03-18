package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.LogMasterId;
import com.luvina.pos.provider.domain.transaction.primarykey.MachineStatusId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "log_master", schema = "T_KSM")
public class LogMaster extends AbstractAuditingEntity {
    @EmbeddedId
    private LogMasterId id;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "mac_address", nullable = false)
    private String macAddress;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "headers", nullable = false)
    private String headers;

    @Column(name = "request", nullable = false)
    private String request;

    @Column(name = "response_code", nullable = false)
    private Integer responseCode;

    @Column(name = "response", nullable = false)
    private String response;

    @Column(name = "transaction_time", nullable = false)
    private String transactionTime;

    @Column(name = "environment", nullable = false)
    private String environment;

}
