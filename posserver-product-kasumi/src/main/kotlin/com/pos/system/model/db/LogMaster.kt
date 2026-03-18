package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*
import java.sql.Timestamp

@Entity
@Table(name = "logmaster")
class LogMaster: BaseColumns() {
    @JsonProperty("company_code")
    @Column(table = "logmaster", name = "CompanyCode", length = 10)
    var companyCode: String? = null

    @JsonProperty("store_code")
    @Column(table = "logmaster", name = "StoreCode", length = 10)
    var storeCode: String? = null

    @JsonProperty("instore_code")
    @Column(table = "logmaster", name = "InstoreCode", length = 10)
    var instoreCode: String? = null

    @JsonProperty("ip_address")
    @Column(table = "logmaster", name = "IpAddress", length = 39)
    var ipAddress: String? = null

    @JsonProperty("url")
    @Column(table = "logmaster", name = "Url")
    var url: String? = null

    @JsonProperty("headers")
    @Column(table = "logmaster", name = "Headers")
    var headers: String? = null

    @JsonProperty("request")
    @Column(table = "logmaster", name = "Request")
    var request: String? = null

    @JsonProperty("response_code")
    @Column(table = "logmaster", name = "ResponseCode")
    var responseCode: Int? = null

    @JsonProperty("response")
    @Column(table = "logmaster", name = "Response")
    var response: String? = null

    @JsonProperty("mac_address")
    @Column(table = "logmaster", name = "MacAddress")
    var macAddress: String? = null

    @JsonProperty("record_timestamp")
    @Column(table = "logmaster", name = "RecordTimestamp")
    var recordTimestamp: Timestamp? = null

    @JsonProperty("environment")
    @Column(table = "logmaster", name = "Environment")
    var environment: String? = null

}