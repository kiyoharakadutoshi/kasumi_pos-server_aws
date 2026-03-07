package com.luvina.pos.provider.domain.master;

import com.luvina.pos.provider.domain.base.AbstractAuditingEntity;
import com.luvina.pos.provider.domain.master.primarykey.StoreId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "stores", schema = "M_KSM")
public class Store extends AbstractAuditingEntity {

    @EmbeddedId
    private StoreId id;

    @Column(name = "ten_name", nullable = false, length = 50)
    private String tenName;

    @Column(name = "ten_short_nm", nullable = false, length = 30)
    private String tenShortNm;

    @Column(name = "ten_short_nm_en", length = 100)
    private String tenShortNmEn;

    @Column(name = "search_keyword", length = 1000)
    private String searchKeyword;

    @Column(name = "business_type_code", length = 10)
    private String businessTypeCode;

    @Column(name = "post_cd", length = 10)
    private String postCd;

    @Column(name = "address1", length = 100)
    private String address1;

    @Column(name = "address2", length = 100)
    private String address2;

    @Column(name = "address3", length = 100)
    private String address3;

    @Column(name = "tel_num", nullable = false, length = 13)
    private String telNum;

    @Column(name = "fax_num", length = 13)
    private String faxNum;

    @Column(name = "mail_address", length = 1000)
    private String mailAddress;

    @Column(name = "mail_delivery1", length = 1000)
    private String mailDelivery1;

    @Column(name = "mail_delivery2", length = 1000)
    private String mailDelivery2;

    @Column(name = "mail_delivery3", length = 1000)
    private String mailDelivery3;

    @Column(name = "store_detail_page_link", length = 2000)
    private String storeDetailPageLink;

    @Column(name = "last_open_dt")
    private LocalDate lastOpenDt;

    @Column(name = "last_close_dt")
    private LocalDate lastCloseDt;

    @Column(name = "open_count", nullable = false, length = 18)
    private String openCount;

    @Column(name = "map_latitude", nullable = false, length = 12)
    private String mapLatitude;

    @Column(name = "map_longitude", nullable = false, length = 12)
    private String mapLongitude;

    @Column(name = "coord_threshold_in", nullable = false)
    private Integer coordThresholdIn;

    @Column(name = "coord_threshold_nearby", nullable = false)
    private Integer coordThresholdNearby;

    @Column(name = "checkin_mode", nullable = false)
    private Integer checkinMode;

    @Column(name = "checkout_mode", nullable = false)
    private Integer checkoutMode;

    @Column(name = "pwd", nullable = false, length = 128)
    private String pwd;

    @Column(name = "close_alert_time", nullable = false)
    private Integer closeAlertTime;

    @Column(name = "map_flag")
    private Integer mapFlag;

    @Column(name = "system_id", length = 10)
    private String systemId;

    @Column(name = "business_day_sun", nullable = false)
    private Integer businessDaySun;

    @Column(name = "business_open_sun", nullable = false)
    private LocalTime businessOpenSun;

    @Column(name = "business_close_sun", nullable = false)
    private LocalTime businessCloseSun;

    @Column(name = "business_day_mon", nullable = false)
    private Integer businessDayMon;

    @Column(name = "business_open_mon", nullable = false)
    private LocalTime businessOpenMon;

    @Column(name = "business_close_mon", nullable = false)
    private LocalTime businessCloseMon;

    @Column(name = "business_day_tue", nullable = false)
    private Integer businessDayTue;

    @Column(name = "business_open_tue", nullable = false)
    private LocalTime businessOpenTue;

    @Column(name = "business_close_tue", nullable = false)
    private LocalTime businessCloseTue;

    @Column(name = "business_day_wed", nullable = false)
    private Integer businessDayWed;

    @Column(name = "business_open_wed", nullable = false)
    private LocalTime businessOpenWed;

    @Column(name = "business_close_wed", nullable = false)
    private LocalTime businessCloseWed;

    @Column(name = "business_day_thu", nullable = false)
    private Integer businessDayThu;

    @Column(name = "business_open_thu", nullable = false)
    private LocalTime businessOpenThu;

    @Column(name = "business_close_thu", nullable = false)
    private LocalTime businessCloseThu;

    @Column(name = "business_day_fri", nullable = false)
    private Integer businessDayFri;

    @Column(name = "business_open_fri", nullable = false)
    private LocalTime businessOpenFri;

    @Column(name = "business_close_fri", nullable = false)
    private LocalTime businessCloseFri;

    @Column(name = "business_day_sat", nullable = false)
    private Integer businessDaySat;

    @Column(name = "business_open_sat", nullable = false)
    private LocalTime businessOpenSat;

    @Column(name = "business_close_sat", nullable = false)
    private LocalTime businessCloseSat;

    @Column(name = "code_pay_no_aeonpay", length = 11)
    private String codePayNoAeonpay;

    @Column(name = "code_pay_no_etc", length = 11)
    private String codePayNoEtc;

    @Column(name = "givepoint_flag")
    private Integer givepointFlag;

    @Column(name = "coupon_uncheckable_flag")
    private Integer couponUncheckableFlag;

    @Column(name = "unmanned_store_flag")
    private Integer unmannedStoreFlag;

    @Column(name = "gate_check_pattern")
    private Integer gateCheckPattern;

    @Column(name = "gate_check_frequency")
    private Integer gateCheckFrequency;

    @Column(name = "tran_relay_flag")
    private Integer tranRelayFlag;

    @Column(name = "code_pay_no_aeongift", length = 11)
    private String codePayNoAeongift;

}