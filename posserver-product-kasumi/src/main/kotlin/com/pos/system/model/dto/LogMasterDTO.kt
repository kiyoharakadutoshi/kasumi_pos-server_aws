package com.pos.system.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

class LogMasterDTO(@JsonProperty(value = "url") var url: String? = null,

                   @JsonProperty(value = "response") var response: String? = null)
