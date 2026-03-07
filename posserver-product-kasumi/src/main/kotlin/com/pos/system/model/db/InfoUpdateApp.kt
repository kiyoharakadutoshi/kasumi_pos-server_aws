package com.pos.system.model.db

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.sql.Timestamp

@Entity
@Table(name = "updatemanagermaster")
class InfoUpdateApp : BaseColumns() {

    @Column(name = "CompanyCode")
    var companyCode: String = ""

    @Column(name = "StoreCode")
    var storeCode: String = ""

    @Column(name = "InstoreCode")
    var instoreCode: String = ""

    @Column(name = "UpdateFlag")
    var updateFlag: String = ""

    @Column(name = "LastUpdated")
    var lastUpdated: Timestamp? = null

    @Column(name = "Version")
    var version: String? = null
}