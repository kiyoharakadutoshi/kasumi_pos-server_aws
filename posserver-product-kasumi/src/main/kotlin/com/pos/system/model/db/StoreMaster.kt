package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.pos.system.model.dto.PresetStoreResponse
import com.pos.system.model.dto.StoreMasterDTO
import jakarta.persistence.*
import org.jetbrains.annotations.NotNull


@Entity
@Table(name = "storemaster")
//@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
class StoreMaster: BaseColumns() {
    @JsonProperty("company_code")
    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @JsonProperty("store_code")
    @NotNull
    @Column(nullable = false, length = 10, name = "StoreCode")
    var storeCode: String? = null

    @JsonProperty("business_type_code")
    @NotNull
    @Column(nullable = false, length = 10, name = "BusinessTypeCode")
    var businessTypeCode: String? = null

    @JsonProperty("branch_name")
    @NotNull
    @Column(nullable = false, length = 40, name = "BranchName")
    var branchName: String? = null

    @JsonProperty("post_code")
    @Column(length = 7, name = "PostCode")
    var postCode: String? = null

    @JsonIgnore
    @Column(length = 16, name = "Prefecture")
    var prefecture: String? = null

    @JsonIgnore
    @Column(length = 50, name = "Town")
    var town: String? = null

    @JsonIgnore
    @Column(length = 200, name = "Block")
    var block: String? = null

    @JsonIgnore
    @Column(length = 200, name = "Building")
    var building: String? = null

    @JsonIgnore
    @Column(length = 15, name = "PhoneNumber")
    var phoneNumber: String? = null

    @JsonIgnore
    @Column(length = 15, name = "FaxNumber")
    var faxNumber: String? = null

    @JsonIgnore
    @Column(length = 5, name = "StarHours")
    var startHours: String? = null

    @JsonIgnore
    @Column(length = 5, name = "EndHours")
    var endHours: String? = null

    @JsonIgnore
    @Column(length = 20, name = "BranchShortName1")
    var branchShortName1: String? = null

    @JsonIgnore
    @Column(length = 20, name = "BranchShortName2")
    var branchShortName2: String? = null

    @JsonIgnore
    @Column(length = 20, name = "BranchShortName3")
    var branchShortName3: String? = null

    @JsonIgnore
    @Column(length = 20, name = "BranchShortName4")
    var branchShortName4: String? = null

    @JsonIgnore
    @Column(length = 20, name = "BranchShortName5")
    var branchShortName5: String? = null

    @JsonIgnore
    @Column(length = 255, name = "VD")
    var vd: String? = null

    @JsonProperty("last_updater")
    @Column(length = 255, name = "LastUpdater")
    var lastUpdater: String? = null

//    @JsonIgnore
//    @OneToMany(mappedBy = "storeMaster", fetch = FetchType.LAZY,
//            cascade = [CascadeType.ALL])
//    var presetMenuMaster: List<PresetMenuMaster>? = null

    fun toPresetStoreResponse() = PresetStoreResponse(
        companyCode = companyCode,
        storeCode = storeCode,
        storeName = branchName
    )
}