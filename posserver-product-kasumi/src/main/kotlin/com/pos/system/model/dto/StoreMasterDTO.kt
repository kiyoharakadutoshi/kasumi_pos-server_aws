package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDate

class StoreMasterDTO(@JsonProperty(value = "company_code") var companyCode: String? = null,

                     @JsonProperty(value = "store_code") var storeCode: String? = null,

                     @JsonProperty(value = "branch_name") var branchName: String? = null,

                     @JsonProperty("button_layout_code") var buttonLayoutCode: String? = null,

                     @JsonProperty("button_layout_name") var buttonLayoutName: String? = null,

                     @JsonProperty("prefecture") var prefecture: String? = null,

                     @JsonProperty("apply_date") val applyDate: LocalDate? = null)
