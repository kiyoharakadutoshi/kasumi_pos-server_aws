package com.luvina.pos.provider.domain.base;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Base abstract class for entities which will hold definitions for created,
 * last modified by attributes.
 */
@Getter
@Setter
@MappedSuperclass
@JsonIgnoreProperties(value = {"recordCreateDate", "recordCreateTime", "recordUpdateDate", "recordUpdateTime"}, allowGetters = true)
public abstract class AbstractAuditingEntity {

    @Column(name = "record_id", insertable = false, updatable = false, unique = true)
    private Long recordId;

    @ColumnDefault("(curdate())")
    @Column(name = "record_create_date", updatable = false)
    private LocalDate recordCreateDate;

    @ColumnDefault("(curtime())")
    @Column(name = "record_create_time", updatable = false)
    private LocalTime recordCreateTime;

    @ColumnDefault("(curdate())")
    @Column(name = "record_update_date", updatable = false)
    private LocalDate recordUpdateDate;

    @ColumnDefault("(curtime())")
    @Column(name = "record_update_time", updatable = false)
    private LocalTime recordUpdateTime;

    @Column(name = "record_void_flag", length = 1, nullable = false)
    private String recordVoidFlag = "";

    @PrePersist
    protected void onCreate() {
        this.recordCreateDate = LocalDate.now();
        this.recordCreateTime = LocalTime.now();
        this.recordUpdateDate = LocalDate.now();
        this.recordUpdateTime = LocalTime.now();
        this.recordVoidFlag = "";
    }

    @PreUpdate
    protected void onUpdate() {
        this.recordUpdateDate = LocalDate.now();
        this.recordUpdateTime = LocalTime.now();
    }
}
