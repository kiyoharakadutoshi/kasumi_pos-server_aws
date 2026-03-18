package com.pos.system.exception

class BadRequest(val messages: Any? = null, val status: Int? = null) : RuntimeException()
