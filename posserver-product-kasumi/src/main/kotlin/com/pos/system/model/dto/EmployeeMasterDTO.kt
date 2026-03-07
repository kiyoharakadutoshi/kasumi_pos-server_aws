package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

class EmployeeMasterDTO(@JsonProperty(value = "code") var code: String? = null,

                        @JsonProperty(value = "name") var name: String? = null)
