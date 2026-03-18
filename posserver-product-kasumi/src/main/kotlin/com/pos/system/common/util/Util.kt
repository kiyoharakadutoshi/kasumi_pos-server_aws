package com.pos.system.common.util

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.common.util.Constants.STRING_DATE_FORMAT_JAPANESE
import com.pos.system.model.dto.DataToken
import com.pos.system.model.dto.LoginRequest
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.client.RestTemplate
import java.io.IOException
import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.*


object Util {

    fun addYears(years: Int = 1): Date {
        var date = Date()
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.add(Calendar.YEAR, years)
        date = calendar.time
        return date
    }

    val currentDateJPLocale: String
        get() {
            val sdf = SimpleDateFormat(STRING_DATE_FORMAT_JAPANESE, Locale.JAPANESE)
            val cal = Calendar.getInstance()
            return sdf.format(cal.time)
        }

    val timeStampNow get() = Timestamp(Date().time)

    fun convertToTimestamp(inputDate: Long): Timestamp {
        return Timestamp(inputDate)
    }

    fun <T> postAPI(url: String,
                    token: String,
                    request: Any? = null,
                    clazz: Class<T>): ResponseEntity<T?> {
        val res = RestTemplate()
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        headers.setBearerAuth(token)
        val entity = HttpEntity(request, headers)
        return res.postForEntity(url, entity, clazz)
    }

    fun decodeJWT(authorization: String?): LoginRequest? {
        if (authorization == null) {
            return null
        }
        return try {
            val chunks = authorization.split(".")
            val decoder = Base64.getUrlDecoder()
            ObjectMapper().run {
                configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                val json = readValue(decoder.decode(chunks[1]), HashMap::class.java)//.toString()//.get("company_code")
                val data = json["sid"]
                if (data != null) {
                    readValue(data.toString(), LoginRequest::class.java)
                } else {
                    convertValue(json["payload"], LoginRequest::class.java)
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    fun checkIfServiceRunning(serviceName: String): Boolean {
        try {
            val process = Runtime.getRuntime().exec("sc query $serviceName")
            Scanner(process.inputStream, Charsets.UTF_8).use { reader ->
                while (reader.hasNextLine()) {
                    if (reader.nextLine().contains("RUNNING")) {
                        return true
                    }
                }
            }
        } catch (e: IOException) {
            e.printStackTrace()
        }
        return false
    }

    val dataToken get() = (SecurityContextHolder.getContext().authentication.principal as? DataToken)?.getTokenValue()

    fun filterNumber(input: String?): String {
        if (input.isNullOrEmpty()) return "0"
        return input.filter {
            it.isDigit()
        }
    }

    fun <T> String.toObject(clazz: Class<T>) : T? {
        return try {
            ObjectMapper().run {
                configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                readValue(this@toObject, clazz)
            }
        } catch (e: Exception) {
            return null
        }
    }
}