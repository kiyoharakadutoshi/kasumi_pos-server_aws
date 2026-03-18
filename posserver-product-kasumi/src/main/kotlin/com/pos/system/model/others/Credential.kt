package com.pos.system.model.others

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.pos.system.model.dto.LoginRequest
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
class Credential {
    @JsonProperty("iss")
    var iss: String? = null
    @JsonProperty("sub")
    var userId: String? = null
    @JsonProperty("aud")
    var aud: String? = null
    @JsonProperty("jti")
    var uuid: String? = null
    @JsonProperty("exp")
    var exp: Date? = null
    @JsonProperty("nbf")
    var nbf: Date? = null
    @JsonProperty("payload")
    var payload: LoginRequest? = null
}
