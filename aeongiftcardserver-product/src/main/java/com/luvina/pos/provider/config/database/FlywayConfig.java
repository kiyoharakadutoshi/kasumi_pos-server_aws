package com.luvina.pos.provider.config.database;

import jakarta.annotation.PostConstruct;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {
    private final DataSource dataSourceMaster;

    private final DataSource dataSourceTransaction;


    public FlywayConfig(@Qualifier("masterDataSource") DataSource dataSourceMaster,
                        @Qualifier("transactionDataSource") DataSource dataSourceTransaction) {
        this.dataSourceMaster = dataSourceMaster;
        this.dataSourceTransaction = dataSourceTransaction;
    }


    @PostConstruct
    public void flyway() {

        Flyway flywayMaster = Flyway.configure()
                .locations("db/migration/master")
                .dataSource(dataSourceMaster)
                .createSchemas(true)
                .load();
//        flywayMaster.migrate();

        Flyway flywayReport = Flyway.configure()
                .locations("db/migration/transaction")
                .dataSource(dataSourceTransaction)
                .createSchemas(true)
                .load();
//        flywayReport.migrate();

    }

}
