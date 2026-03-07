package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonRootName
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.pos.system.model.dto.ButtonSetting
import jakarta.persistence.*
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "devicesettingmaster")
class DeviceSetting {
    @Id
    @Column(name = "RecordId")
    @JsonIgnore
    @GeneratedValue(strategy = GenerationType.AUTO)
    var recordId: Int = 0

    @NotNull
    @Column(nullable = false, name = "CompanyCode")
    @JsonProperty("company_code")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, name = "StoreCode")
    @JsonProperty("store_code")
    var storeCode: String? = null

    @NotNull
    @Column(nullable = false, name = "InStoreCode")
    @JsonProperty("instore_code")
    var inStoreCode: String? = null

    @Column(name = "DeviceClass")
    @JsonProperty("device_class")
    var deviceClass: Int? = 0

    @Column(name = "ServiceClass01")
    @JsonProperty("service_class01")
    var serviceClass01: Int? = 0

    @Column(name = "ServiceClass02")
    @JsonProperty("service_class02")
    var serviceClass02: Int? = 0

    @Column(name = "ServiceClass03")
    @JsonProperty("service_class03")
    var serviceClass03: Int? = 0

    @Column(name = "ServiceClass04")
    @JsonProperty("service_class04")
    var serviceClass04: Int? = 0

    @Column(name = "ServiceClass05")
    @JsonProperty("service_class05")
    var serviceClass05: Int? = 0

    @Column(name = "ServiceClass06")
    @JsonProperty("service_class06")
    var serviceClass06: Int? = 0

    @Column(name = "ServiceClass07")
    @JsonProperty("service_class07")
    var serviceClass07: Int? = 0

    @Column(name = "ServiceClass08")
    @JsonProperty("service_class08")
    var serviceClass08: Int? = 0

    @Column(name = "ServiceClass09")
    @JsonProperty("service_class09")
    var serviceClass09: Int? = 0

    @Column(name = "ServiceClass10")
    @JsonProperty("service_class10")
    var serviceClass10: Int? = 0

    @Column(name = "ServiceClass11")
    @JsonProperty("service_class11")
    var serviceClass11: Int? = 0

    @Column(name = "ServiceClass12")
    @JsonProperty("service_class12")
    var serviceClass12: Int? = 0

    @Column(name = "ServiceClass13")
    @JsonProperty("service_class13")
    var serviceClass13: Int? = 0

    @Column(name = "ServiceClass14")
    @JsonProperty("service_class14")
    var serviceClass14: Int? = 0

    @Column(name = "ServiceClass15")
    @JsonProperty("service_class15")
    var serviceClass15: Int? = 0

    @Column(name = "ServiceClass16")
    @JsonProperty("service_class16")
    var serviceClass16: Int? = 0

    @Column(name = "ServiceClass17")
    @JsonProperty("service_class17")
    var serviceClass17: Int? = 0

    @Column(name = "ServiceClass18")
    @JsonProperty("service_class18")
    var serviceClass18: Int? = 0

    @Column(name = "ServiceClass19")
    @JsonProperty("service_class19")
    var serviceClass19: Int? = 0

    @Column(name = "ServiceClass20")
    @JsonProperty("service_class20")
    var serviceClass20: Int? = 0

    @Column(name = "PointClass01")
    @JsonProperty("point_class01")
    var pointClass01: Int? = 0

    @Column(name = "PointClass02")
    @JsonProperty("point_class02")
    var pointClass02: Int? = 0

    @Column(name = "PointClass03")
    @JsonProperty("point_class03")
    var pointClass03: Int? = 0

    @Column(name = "PointClass04")
    @JsonProperty("point_class04")
    var pointClass04: Int? = 0

    @Column(name = "PointClass05")
    @JsonProperty("point_class05")
    var pointClass05: Int? = 0

    @Column(name = "PointClass06")
    @JsonProperty("point_class06")
    var pointClass06: Int? = 0

    @Column(name = "PointClass07")
    @JsonProperty("point_class07")
    var pointClass07: Int? = 0

    @Column(name = "PointClass08")
    @JsonProperty("point_class08")
    var pointClass08: Int? = 0

    @Column(name = "PointClass09")
    @JsonProperty("point_class09")
    var pointClass09: Int? = 0

    @Column(name = "PointClass10")
    @JsonProperty("point_class10")
    var pointClass10: Int? = 0

    @Column(name = "PointClass11")
    @JsonProperty("point_class11")
    var pointClass11: Int? = 0

    @Column(name = "PointClass12")
    @JsonProperty("point_class12")
    var pointClass12: Int? = 0

    @Column(name = "PointClass13")
    @JsonProperty("point_class13")
    var pointClass13: Int? = 0

    @Column(name = "PointClass14")
    @JsonProperty("point_class14")
    var pointClass14: Int? = 0

    @Column(name = "PointClass15")
    @JsonProperty("point_class15")
    var pointClass15: Int? = 0

    @Column(name = "PointClass16")
    @JsonProperty("point_class16")
    var pointClass16: Int? = 0

    @Column(name = "PointClass17")
    @JsonProperty("point_class17")
    var pointClass17: Int? = 0

    @Column(name = "PointClass18")
    @JsonProperty("point_class18")
    var pointClass18: Int? = 0

    @Column(name = "PointClass19")
    @JsonProperty("point_class19")
    var pointClass19: Int? = 0

    @Column(name = "PointClass20")
    @JsonProperty("point_class20")
    var pointClass20: Int? = 0

    @Column(name = "PaymentClass01")
    @JsonProperty("payment_class01")
    var paymentClass01: Int? = 0

    @Column(name = "PaymentClass02")
    @JsonProperty("payment_class02")
    var paymentClass02: Int? = 0

    @Column(name = "PaymentClass03")
    @JsonProperty("payment_class03")
    var paymentClass03: Int? = 0

    @Column(name = "PaymentClass04")
    @JsonProperty("payment_class04")
    var paymentClass04: Int? = 0

    @Column(name = "PaymentClass05")
    @JsonProperty("payment_class05")
    var paymentClass05: Int? = 0

    @Column(name = "PaymentClass06")
    @JsonProperty("payment_class06")
    var paymentClass06: Int? = 0

    @Column(name = "PaymentClass07")
    @JsonProperty("payment_class07")
    var paymentClass07: Int? = 0

    @Column(name = "PaymentClass08")
    @JsonProperty("payment_class08")
    var paymentClass08: Int? = 0

    @Column(name = "PaymentClass09")
    @JsonProperty("payment_class09")
    var paymentClass09: Int? = 0

    @Column(name = "PaymentClass10")
    @JsonProperty("payment_class10")
    var paymentClass10: Int? = 0

    @Column(name = "PaymentClass11")
    @JsonProperty("payment_class11")
    var paymentClass11: Int? = 0

    @Column(name = "PaymentClass12")
    @JsonProperty("payment_class12")
    var paymentClass12: Int? = 0

    @Column(name = "PaymentClass13")
    @JsonProperty("payment_class13")
    var paymentClass13: Int? = 0

    @Column(name = "PaymentClass14")
    @JsonProperty("payment_class14")
    var paymentClass14: Int? = 0

    @Column(name = "PaymentClass15")
    @JsonProperty("payment_class15")
    var paymentClass15: Int? = 0

    @Column(name = "PaymentClass16")
    @JsonProperty("payment_class16")
    var paymentClass16: Int? = 0

    @Column(name = "PaymentClass17")
    @JsonProperty("payment_class17")
    var paymentClass17: Int? = 0

    @Column(name = "PaymentClass18")
    @JsonProperty("payment_class18")
    var paymentClass18: Int? = 0

    @Column(name = "PaymentClass19")
    @JsonProperty("payment_class19")
    var paymentClass19: Int? = 0

    @Column(name = "PaymentClass20")
    @JsonProperty("payment_class20")
    var paymentClass20: Int? = 0

    @Column(name = "DeleteFlag")
    @JsonProperty("delete_flag")
    var deleteFlag: Int? = 0

    @Column(name = "RegisterDatetime")
    @JsonProperty("register_datetime")
    var registerDatetime: String? = null

    @Column(name = "RegisterPGID")
    @JsonProperty("register_pgid")
    var registerPGID: String? = null

    @Column(name = "UpdateDatetime")
    @JsonProperty("update_datetime")
    var updateDatetime: String? = null

    @Column(name = "UpdatePGID")
    @JsonProperty("update_pgid")
    var updatePGID: String? = null

    @Transient
    @JsonProperty("list_button")
    var listButton: List<ButtonSetting>? = null
}