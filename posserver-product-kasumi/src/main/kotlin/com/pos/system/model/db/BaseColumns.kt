package com.pos.system.model.db

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalTime

@MappedSuperclass
open class BaseColumns {
    @JsonIgnore
    @Id
    @Column(name = "RECORD_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var recordId: Long = 0

    @JsonIgnore
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "RECORD_CREATE_DATE")
    var recordCreateDate: LocalDate? = null

    @JsonIgnore
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH-mm-ss")
    @Column(name = "RECORD_CREATE_TIME")
    var recordCreateTime: LocalTime? = null

    @JsonIgnore
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "RECORD_UPDATE_DATE")
    var recordUpdateDate: LocalDate? = null

    @JsonIgnore
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH-mm-ss")
    @Column(name = "RECORD_UPDATE_TIME")
    var recordUpdateTime: LocalTime? = null

    @JsonIgnore
    @Column(name = "RECORD_VOID_FLAG", insertable = false, updatable = false)
    open var recordVoidFlag: String? = null
}