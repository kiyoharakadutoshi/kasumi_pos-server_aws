package com.luvina.pos.provider.config.Executor;

import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Configuration
public class ExecutorConfig {
    private ExecutorService executor;

    @Bean(destroyMethod = "shutdown")
    public ExecutorService logFileExecutor() {
        this.executor = Executors.newFixedThreadPool(100);
        return this.executor;
    }

    @PreDestroy
    public void destroy() throws InterruptedException {
        executor.shutdown();
        if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
            executor.shutdownNow();
        }
    }
}
