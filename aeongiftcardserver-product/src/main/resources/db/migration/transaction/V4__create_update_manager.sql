DROP TABLE IF EXISTS `update_manager`;

CREATE TABLE `update_manager`
(
    record_id               BIGINT NOT NULL AUTO_INCREMENT COMMENT 'レコードID',

    record_create_date      DATE NOT NULL COMMENT 'レコード作成日付',
    record_create_time      TIME NOT NULL COMMENT 'レコード作成時間',

    record_update_date      DATE NOT NULL COMMENT 'レコード更新日付',
    record_update_time      TIME NOT NULL COMMENT 'レコード更新時間',

    record_void_flag        CHAR(1) NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ',
    company_code            varchar(10) NOT NULL COMMENT '企業コード',
    store_code              varchar(10) NOT NULL COMMENT '店舗コード',
    instore_code            varchar(10) NOT NULL COMMENT 'レジ番号',
    update_flag             varchar(1),
    version                 varchar(45),
    last_update             TIMESTAMP,

    PRIMARY KEY (record_id, company_code, store_code, instore_code)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER trg_update_manager_before_insert
BEFORE INSERT ON update_manager
FOR EACH ROW
BEGIN
    SET NEW.record_create_date = CURRENT_DATE();
    SET NEW.record_create_time = CURRENT_TIME();

    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;

CREATE TRIGGER trg_update_manager_before_update
BEFORE UPDATE ON update_manager
FOR EACH ROW
BEGIN
    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;