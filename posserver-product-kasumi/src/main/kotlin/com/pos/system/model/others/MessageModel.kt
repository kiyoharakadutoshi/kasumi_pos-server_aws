package com.pos.system.model.others

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlin.Exception

class MessageModel {

    var status: Boolean = false
    var type: String? = null
    var content: String? = null
    var to: String? = null
    var from: String? = null
    var sender: String? = null
    var macAddress: String? = null
    var position = 0L
    var companyCode: String? = null
    var storeCode: String? = null
    var instoreCode: String? = null
    var subContent: Any? = null
    var currentTime = 0L
    var file: String? = null
    var fileName: String? = null
    var maxPosition = 0L

    @get:JsonIgnore
    @set:JsonIgnore
    var messageType: MessageType
        get() = type?.let {
            try {
                MessageType.valueOf(it)
            } catch (e: Exception) {
                MessageType.NONE
            }
        } ?: MessageType.NONE
        set(value) {
            type = value.name
        }

    enum class MessageType {
        NONE,
        CHAT,
        JOIN,
        LEAVE,
        CHECK_AGE,
        SEND_LOG,
        CALL_STAFF,
        APPROVED_AGE,
        LOGIN,
        SEND_IMAGE,
        REQUEST_FILES,
        RESPONSE_FILES,
        UPDATE_STATUS,
        REQUEST_P2P
    }

    enum class AppStatus(val value: Int) {
        ONLINE(1),
        OFFLINE(0)
    }
}