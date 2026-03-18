package com.pos.system.model.db

import jakarta.persistence.*
import org.jetbrains.annotations.NotNull
@Entity
@Table(name = "codemaster")
class CodeMaster: BaseColumns() {
    @NotNull
    @Column(nullable = false, length = 10, name = "MasterCode")
    var masterCode: String? = null

    @Column(length = 50, name = "PropertyName")
    var propertyName: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "CompanyCode")
    var companyCode: String? = null

    @NotNull
    @Column(nullable = false, length = 10, name = "CodeNo")
    var codeNo: String? = null

    @Column(length = 50, name = "CodeValue")
    var codeValue: String? = null

    @Column(length = 50, name = "CodeValueExt1")
    var codeValueExt1: String? = null

    @Column(length = 50, name = "CodeValueExt2")
    var codeValueExt2: String? = null

    @Column(length = 50, name = "CodeValueExt3")
    var codeValueExt3: String? = null

    @Column(length = 50, name = "CodeValueExt4")
    var codeValueExt4: String? = null

}