package com.pos.system.common.util

object Constants {
    const val STRING_DATE_FORMAT_JAPANESE = "yyyy年MM月dd日(EEE)HH:mm"
    const val DATE_TIME_FORMAT = "yyyy/MM/dd HH:mm"
    const val DATE_FORMAT = "yyyyMMdd"

    const val IS_CROSS_ALLOW = true
    const val POS_TOKEN_CONFIRM_URL = "https://t3.usmh-fjservice.com/pos/v1/pos-token/confirm"
    const val URL_CUSTOMER_POINT_PAYMENT = "money/charge"
    const val URL_CUSTOMER_SALES_SETTLE = "sales/settle"
    const val URL_MONEY_CURRENT = "money/current"
    const val URL_FLOW25 = "Charge_journal"
    const val URL_CASHCHANGER_VERIFICATE = "cashchanger/verificate"
    const val URL_CUSTOMER_SALES_CANCEL = "sales/cancel"
    const val URL_SETTING_CASH_CHANGER_GET = "setting/cashchanger/get"
    const val URL_SETTING_DEVICE_GET = "setting/device/get"
    const val URL_CASH_CHANGER_REPLENISH = "cashchanger/replenish"
    const val URL_CASH_CHANGER_RECOVER = "cashchanger/recover"
    const val URL_CASH_CHANGER_REGISTER = "cashchanger/register"
    const val URL_SALES_INFO = "sales/info"
    const val URL_POS_TOKEN = "pos-token"
    const val URL_START_UP = "startup"

    const val DEFAULT_STORE_CODE = "000000"
    const val DEFAULT_INSTORE_CODE = "000"
    const val LINK_FOLDER_APKS_ANDROID11 = "/apks/android11/"
    const val LINK_FOLDER_APKS_ANDROID10 = "/apks/android10/"
    const val LINK_FOLDER_APKS_CONLUX10 = "/apks/conlux10/"
    const val LINK_FOLDER_APKS_CONLUX11 = "/apks/conlux11/"
    const val LINK_FOLDER_WINDOWS = "/windows/"
    const val LOG_FOLDER_NAME = "Logs"
    const val IMAGE_FOLDER_NAME = "images"
    const val BASE_URL_FUJI = "https://t3.usmh-fjservice.com/pos/v1/"
    const val HARD_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBdXRoIiwianRpIjoiYmU0Mzg4OGUtYjhiNS00N2Q3LWI5MTUtZDI2OGRhNTU1ZDM1IiwiZXhwIjoyMjQzMzAzMzQ3LCJuYmYiOjE3MDY3NTkzNDcsImlzcyI6Ikx1dmluYSIsInBheWxvYWQiOnsiY29tcGFueV9jb2RlIjoiMjAwIiwic3RvcmVfY29kZSI6IjAyNzAxIiwiaW5zdG9yZV9jb2RlIjoiNjIwMSIsIm9zX3R5cGUiOiIiLCJhbmRyb2lkIjoiIiwib3NfdmVyc2lvbiI6IiIsImFwcF92ZXJzaW9uIjoiIiwibWFjX2FkZHJlc3MiOiIiLCJpcF9hZGRyZXNzIjoiIn19.rSQQy9KJ2RIXFIRJY2DPdd1NGXVlpkbxp_fBlFglwpY"
    const val STATUS_CODE_NAME = "code"
    const val BLANK = ""
    const val CAN_UPDATE_FLAG = "1"

    val ENDPOINTS_PUBLIC = arrayOf(
//        "/",
//        "/index.html",
        "/pos/v1/check-status",
        "/websocket/**",
        "/public/**",
    )

    enum class Company(val code: String) {
        KASUMI("100"),
        MARUETSU("200"),
        MAXVALUE("300")
    }
}
