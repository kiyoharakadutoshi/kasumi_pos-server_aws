package com.pos.system

import com.pos.system.common.util.FileUtil
import com.pos.system.service.EmailService
import com.zaxxer.hikari.HikariDataSource
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import jakarta.servlet.ServletContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.boot.runApplication
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Bean
import org.springframework.retry.annotation.Backoff
import org.springframework.retry.annotation.EnableRetry
import org.springframework.retry.annotation.Retryable
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.util.StringUtils
import javax.sql.DataSource

@SpringBootApplication
@EnableRetry
@EnableScheduling
class SystemApplication : SpringBootServletInitializer()  {
    @Autowired
    lateinit var emailService: EmailService
    @Value("\${project.version}")
    lateinit var version: String
    @Value("\${project.group}")
    lateinit var group: String

    @Retryable(maxAttempts = 500, backoff = Backoff(value = 30_000, delay = 30_000))
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    fun dataSource(properties: DataSourceProperties): HikariDataSource {
        val dataSource = createDataSource<HikariDataSource>(
            properties,
            HikariDataSource::class.java,
            properties.classLoader
        )
        if (StringUtils.hasText(properties.name)) {
            dataSource.poolName = properties.name
        }
        try {
            dataSource.connection
        } catch (e: Exception) {
            emailService.sendEmail("tranvandat@luvina.net", "Can not startup server", "Please check server App = ${group}, version = $version")
            throw e
        }
        return dataSource
    }

    @SuppressWarnings("unchecked")
    private fun <T> createDataSource(
        connectionDetails: DataSourceProperties, type: Class<out DataSource?>,
        classLoader: ClassLoader
    ): T {
        return DataSourceBuilder.create(classLoader)
            .type(type)
            .driverClassName(connectionDetails.driverClassName)
            .url(connectionDetails.url)
            .username(connectionDetails.username)
            .password(connectionDetails.password)
            .build() as T
    }

    override fun configure(application: SpringApplicationBuilder): SpringApplicationBuilder {
        return application.sources(SystemApplication::class.java)
    }

    @PostConstruct
    fun start() {
        FileUtil.initFolders()

    }

    @PreDestroy
    fun destroy() {
    }

    override fun onStartup(servletContext: ServletContext) {
        super.onStartup(servletContext)
    }

}

fun main(args: Array<String>) {
    runApplication<SystemApplication>(*args)
}
