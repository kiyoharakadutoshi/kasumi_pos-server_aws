DROP TABLE IF EXISTS `machine_status_history`;

CREATE TABLE `machine_status_history`
(
    record_id               BIGINT NOT NULL AUTO_INCREMENT COMMENT 'レコードID',

    record_create_date      DATE NOT NULL COMMENT 'レコード作成日付',
    record_create_time      TIME NOT NULL COMMENT 'レコード作成時間',

    record_update_date      DATE NOT NULL COMMENT 'レコード更新日付',
    record_update_time      TIME NOT NULL COMMENT 'レコード更新時間',

    record_void_flag        CHAR(1) NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ',

    ip_address              CHAR(20) NOT NULL,
    mac_address             CHAR(20) NOT NULL,

    record_update_timestamp DATETIME NOT NULL,

    PRIMARY KEY (ip_address, mac_address),

    KEY `record_id` (`record_id`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER trg_machine_status_history_before_insert
BEFORE INSERT ON machine_status_history
FOR EACH ROW
BEGIN
    SET NEW.record_create_date = CURRENT_DATE();
    SET NEW.record_create_time = CURRENT_TIME();

    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;

CREATE TRIGGER trg_machine_status_history_before_update
BEFORE UPDATE ON machine_status_history
FOR EACH ROW
BEGIN
    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;