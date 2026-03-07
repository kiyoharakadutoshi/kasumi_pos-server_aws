package com.pos.system.common.config

import com.pos.system.common.util.FileUtil
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import kotlin.io.path.name

@Configuration
class MvcConfig : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        exposeDirectory(registry)
    }

    private fun exposeDirectory(registry: ResourceHandlerRegistry) {
        val uploadDir = FileUtil.PUBLIC_DIR
        val uploadPath = uploadDir.toFile().absolutePath
        val dr = uploadDir.name
        registry.addResourceHandler("/$dr/**").addResourceLocations("file:/$uploadPath/")
    }
}