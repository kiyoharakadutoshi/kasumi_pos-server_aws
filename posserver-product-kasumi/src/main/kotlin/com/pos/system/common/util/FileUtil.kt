package com.pos.system.common.util

import com.pos.system.model.others.ItemPair
import org.slf4j.LoggerFactory
import org.springframework.util.StringUtils
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.IOException
import java.nio.file.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.io.path.*

object FileUtil {

    val PUBLIC_DIR: Path = Paths.get(System.getProperty("user.dir"), "public")
    val ASSETS_DIR: Path = Paths.get(System.getProperty("user.dir"), "assets")
    val APKS_ANDROID11: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LINK_FOLDER_APKS_ANDROID11)
    val APKS_ANDROID10: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LINK_FOLDER_APKS_ANDROID10)
    val WINDOWS_APP_PATH: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LINK_FOLDER_WINDOWS)
    val APKS_CONLUX10: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LINK_FOLDER_APKS_CONLUX10)
    val APKS_CONLUX11: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LINK_FOLDER_APKS_CONLUX11)
    val LOG_DIR: Path = Paths.get(PUBLIC_DIR.toString(), Constants.LOG_FOLDER_NAME)
    val IMAGES_DIR: Path = Paths.get(PUBLIC_DIR.toString(), Constants.IMAGE_FOLDER_NAME)
    var listLogFiles = mutableMapOf<String, ItemPair<LocalDate, Path>>()
    private val log = LoggerFactory.getLogger(FileUtil::class.java)
    val MultipartFile.fileName: String get() = StringUtils.cleanPath(this.originalFilename!!)

    @Throws(IOException::class)
    fun saveFile(multipartFile: MultipartFile,
                 companyCOde: String,
                 storeCode: String,
                 pageNumber: Int,
                 ext: String) {
        try {
            val uploadPath = createFolderIfNeeded(companyCOde, storeCode, pageNumber, ext)
            val newFileName = multipartFile.fileName
            multipartFile.inputStream.use { inputStream ->
                val filePath = uploadPath.resolve(newFileName)
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)
            }
        } catch (ioe: IOException) {
            throw IOException("Could not save image file: $multipartFile", ioe)
        }
    }

    private fun createFolderIfNeeded(vararg dir: Any) : Path {
        var uploadPath = PUBLIC_DIR.resolve("photos")
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath)
        }
        dir.forEach {
            uploadPath = uploadPath.resolve(it.toString())
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath)
            }
        }
        return uploadPath
    }

    fun getApksUpdate(version: String): Array<out File>? {
        val folder = File(
            if (version.contains("conlux10", true)) APKS_CONLUX10.toString()
            else if (version.contains("conlux11", true)) APKS_CONLUX11.toString()
            else if (version.contains("windows", true)) WINDOWS_APP_PATH.toString()
            else if (version.contains("10", true)) APKS_ANDROID10.toString()
            else APKS_ANDROID11.toString()
        )
        if (folder.exists() && folder.isDirectory) {
            folder.listFiles()
            return folder.listFiles()
        }
        return null
    }

    private fun buildFile(dir: Path, vararg fileName: String) : Path {
        var tempPath = dir
        val size = fileName.size
        fileName.forEachIndexed {index, it ->
        tempPath = tempPath.resolve(it)
            if (!tempPath.exists()) {
                if (index == size - 1 && it.contains(".")) {
                    tempPath.createFile()
                } else {
                    tempPath.createDirectory()
                }
            }
        }
        return tempPath
    }

    fun writeImage(macAddress: String, transactionId: String, fileName: String, base64: String) : String? {
        return try {
            if (!IMAGES_DIR.exists()) IMAGES_DIR.createDirectory()
            val path = buildFile(dir = IMAGES_DIR,  macAddress.replace(':', '-'), transactionId, fileName)
            path.outputStream().use {out ->
                out.write(Base64.getDecoder().decode(base64))
            }
            path.toString()
        } catch (e: Exception) {
            null
        }
    }

    fun writeLog(macAddress: String, content: String) {
        var data = listLogFiles[macAddress]
        val now = LocalDate.now()
        if (data == null) {
            data = ItemPair(now)
            listLogFiles[macAddress] = data
        } else {
            data.first = now
        }
        if (!LOG_DIR.exists()) {
            synchronized(this) {
                LOG_DIR.createDirectory()
            }
        }
        val folder = LOG_DIR.resolve(macAddress)
        val currentName = DateTimeFormatter.ofPattern("yyyyMMdd").format(now)

        if (!folder.exists()) {
            folder.createDirectory()
        } else {
            // remove old files
            try {
                val oldName = DateTimeFormatter.ofPattern("yyyyMMdd").format(now.minusMonths( 1))
                folder.toFile().listFiles()?.forEach {
                    if (it.name < oldName) it.delete()
                }
            } catch (e: Exception) {
                log.error(e.toString())
            }
        }
        val file = folder.resolve("$currentName.txt")
        data.second = file

        synchronized(data) {
            if (!file.exists()) {
                file.createFile()
            }
            file.outputStream(StandardOpenOption.APPEND).use {
                it.write(content.toByteArray())
            }
        }
    }

    fun initFolders() {
        if (!PUBLIC_DIR.exists()) PUBLIC_DIR.createDirectory()
        if (!ASSETS_DIR.exists()) ASSETS_DIR.createDirectory()
        if (!IMAGES_DIR.exists()) IMAGES_DIR.createDirectory()
        if (!LOG_DIR.exists()) LOG_DIR.createDirectory()
    }
}