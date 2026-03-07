DROP TABLE IF EXISTS `transaction`;

CREATE TABLE `transaction`
(
    record_id               BIGINT NOT NULL AUTO_INCREMENT COMMENT 'レコードID',

    record_create_date      DATE NOT NULL COMMENT 'レコード作成日付',
    record_create_time      TIME NOT NULL COMMENT 'レコード作成時間',

    record_update_date      DATE NOT NULL COMMENT 'レコード更新日付',
    record_update_time      TIME NOT NULL COMMENT 'レコード更新時間',

    record_void_flag        CHAR(1) NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ',
    company_code            int NOT NULL COMMENT '企業コード',
    store_code              int NOT NULL COMMENT '店舗コード',
    instore_code            varchar(10) NOT NULL COMMENT 'レジ番号',
    transaction_dt          datetime(3) NOT NULL,
    employee_code           varchar(10) NOT NULL,
    amount                  int NOT NULL,
    previous_account_balance       int NOT NULL,
    following_account_balance      int NOT NULL,
    gift_card_code          varchar(16) NOT NULL,
    type                    smallint NOT NULL,

    PRIMARY KEY (company_code, store_code, instore_code, transaction_dt),
    KEY `record_id` (`record_id`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER trg_transaction_before_insert
BEFORE INSERT ON transaction
FOR EACH ROW
BEGIN
    SET NEW.record_create_date = CURRENT_DATE();
    SET NEW.record_create_time = CURRENT_TIME();

    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;

DROP TABLE IF EXISTS `settlement_history`;
CREATE TABLE `settlement_history`
(
    record_id               BIGINT NOT NULL AUTO_INCREMENT COMMENT 'レコードID',

    record_create_date      DATE NOT NULL COMMENT 'レコード作成日付',
    record_create_time      TIME NOT NULL COMMENT 'レコード作成時間',

    record_update_date      DATE NOT NULL COMMENT 'レコード更新日付',
    record_update_time      TIME NOT NULL COMMENT 'レコード更新時間',

    record_void_flag        CHAR(1) NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ',
    company_code            int NOT NULL COMMENT '企業コード',
    output_datetime          datetime(3) NOT NULL,

    PRIMARY KEY (company_code, output_datetime),
    KEY `record_id` (`record_id`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

  CREATE TRIGGER trg_settlement_history_before_insert
  BEFORE INSERT ON settlement_history
  FOR EACH ROW
  BEGIN
      SET NEW.record_create_date = CURRENT_DATE();
      SET NEW.record_create_time = CURRENT_TIME();

      SET NEW.record_update_date = CURRENT_DATE();
      SET NEW.record_update_time = CURRENT_TIME();
  END;
