package com.luvina.pos.provider.domain.transaction;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.transaction.primarykey.TransactionId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "transaction", schema = "T_KSM")
public class Transaction extends AbstractAuditingEntity {

    @EmbeddedId
    private TransactionId id;

    @Column(name = "employee_code", nullable = false, length = 10)
    private String employeeCode;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "previous_account_balance", nullable = false)
    private Integer previousAccountBalance;

    @Column(name = "following_account_balance", nullable = false)
    private Integer followingAccountBalance;

    @Column(name = "gift_card_code", nullable = false, length = 16)
    private String giftCardCode;

    @Column(name = "type", nullable = false)
    private Integer type;

    @Column(name = "approval_number", nullable = false)
    private String approvalNumber;

}