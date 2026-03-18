package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.master.primarykey.InstoreId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "instores", schema = "M_KSM")
public class Instore extends AbstractAuditingEntity {

    @EmbeddedId
    private InstoreId id;

    @Column(name = "instore_type_code", length = 10)
    private String instoreTypeCode;

    @Column(name = "device_class_code")
    private Integer deviceClassCode;

    @Column(name = "node_type_code", length = 10)
    private String nodeTypeCode;

    @Column(name = "charging_machine")
    private Integer chargingMachine;

    @Column(name = "ignica_money_charge")
    private Integer ignicaMoneyCharge;

    @Column(name = "waon_charge")
    private Integer waonCharge;

    @Column(name = "button_layout_code", length = 5)
    private String buttonLayoutCode;

    @Column(name = "function_layout_code", length = 5)
    private String functionLayoutCode;

    @Column(name = "keyboard_layout_code", length = 5)
    private String keyboardLayoutCode;

    @Column(name = "receipt_message_code", length = 50)
    private String receiptMessageCode;

    @Column(name = "ip_address", length = 20)
    private String ipAddress;

    @Column(name = "mac_address", length = 50)
    private String macAddress;

    @Column(name = "startup_time")
    private LocalTime startupTime;

    @Column(name = "customer_count_excluded")
    private Integer customerCountExcluded;

    @Column(name = "morning_discount_excluded")
    private Integer morningDiscountExcluded;

    @Column(name = "mega_discount_excluded")
    private Integer megaDiscountExcluded;

    @Column(name = "rate_customer_excluded")
    private Integer rateCustomerExcluded;

    @Column(name = "pos_model", length = 50)
    private String posModel;

    @Column(name = "cash_machine_model", length = 50)
    private String cashMachineModel;

    @Column(name = "scanner_model", length = 50)
    private String scannerModel;

    @Column(name = "tenant_hierarchy_code", length = 10)
    private String tenantHierarchyCode;

    @Column(name = "updated_user")
    private Long updatedUser;

    @Column(name = "note1", length = 2000)
    private String note1;

    @Column(name = "note2", length = 2000)
    private String note2;

    @Column(name = "note3", length = 2000)
    private String note3;

    @Column(name = "receipt_coupon_excluded")
    private Integer receiptCouponExcluded;

    @Column(name = "used_standard_price")
    private Integer usedStandardPrice;

}