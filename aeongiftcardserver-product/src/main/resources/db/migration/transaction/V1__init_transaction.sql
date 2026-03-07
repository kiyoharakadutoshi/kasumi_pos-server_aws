DROP TABLE IF EXISTS `journals`;
CREATE TABLE `journals`
(
    `record_id`        bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag   char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    record_dt          datetime    NOT NULL COMMENT '取引日時',
    company_code       int         NOT NULL COMMENT '企業コード',
    store_code         int         NOT NULL COMMENT '店舗コード',
    instore_code       varchar(10) NOT NULL COMMENT 'レジ番号',
    account_id         varchar(16) NOT NULL COMMENT '元取引の担当者コード',
    prcno              int         NOT NULL COMMENT 'レシート番号',
    record_time        time GENERATED ALWAYS AS (TIME(record_dt)
) STORED
,type smallint COMMENT '取引タイプ'
,print_code_data varchar(24) DEFAULT '' COMMENT 'バーコード生成用データ'
,prcname varchar(50) DEFAULT '' COMMENT 'レシート区分'
,jrndata text COMMENT 'Thông tin phiếu in (dùng để search full_text)'
,jrndata_json json COMMENT '表示用の印刷票JSONデータ'
 , PRIMARY KEY (`record_dt`,`prcno`,`account_id`,`instore_code`,`store_code`,`company_code`),
KEY `record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'ジャーナル'
PARTITION BY HASH (store_code)
PARTITIONS 32;
CREATE TRIGGER `journals_UP_Date_Time`
    BEFORE UPDATE
    ON `journals`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;


DROP TABLE IF EXISTS `transaction`;
CREATE TABLE `transaction`
(
    `record_id`                 bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date          date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time          time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date          date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time          time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag            char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`              int         NOT NULL COMMENT '企業コード',
    `store_code`                int         NOT NULL COMMENT '店舗コード',
    `instore_code`              varchar(10) NOT NULL COMMENT 'レジ番号',
    `transaction_dt`            datetime(3) NOT NULL COMMENT 'Thời gian thực hiện giao dịch',
    `employee_code`             varchar(10) NOT NULL COMMENT 'Mã nhân viên phụ trách',
    `amount`                    int         NOT NULL COMMENT 'Số tiền',
    `previous_account_balance`  int         NOT NULL COMMENT 'Số tiền của thẻ trước khi giao dịch ',
    `following_account_balance` int         NOT NULL COMMENT 'Số tiền của thẻ sau khi giao dịch ',
    `gift_card_code`            varchar(16) NOT NULL COMMENT 'Mã thẻ',
    `type`                      smallint    NOT NULL COMMENT 'Loại giao dịch',
    PRIMARY KEY (`transaction_dt`, `instore_code`, `store_code`, `company_code`),
    KEY                         `RECORD_ID` (`RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'メインメニュー設定'
PARTITION BY HASH (store_code)
PARTITIONS 32;
CREATE TRIGGER `transaction_UP_Date_Time`
    BEFORE UPDATE
    ON `transaction`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `settlement_history`;
CREATE TABLE `settlement_history`
(
    `record_id`                bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date         date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time         time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date         date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time         time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag           char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`             int         NOT NULL COMMENT '企業コード',
    `store_code`               int         NOT NULL COMMENT '店舗コード',
    `instore_code`             varchar(10) NOT NULL COMMENT 'レジ番号',
    `output_datetime`          datetime(3) NOT NULL COMMENT 'Thời gian thực hiện quyết toán',
    `previous_output_datetime` datetime(3) NOT NULL COMMENT 'Thời gian thực hiện quyết toán trước đó',
    `usage_count`              int         NOT NULL COMMENT 'Số lương giao dịch thanh toán',
    `usage_amount_total`       int         NOT NULL COMMENT 'Tổng số tiền trong giao dịch thanh toán',
    `refund_count`             int         NOT NULL COMMENT 'Số lương giao dịch hoàn trả',
    `refund_amount_total`      int         NOT NULL COMMENT 'Tổng số tiền trong giao dịch hoàn trả',
    `employee_code`            varchar(16) NOT NULL COMMENT 'Mã nhận viên phụ trách',
    PRIMARY KEY (`output_datetime`, `previous_output_datetime`, `instore_code`, `store_code`, `company_code`),
    KEY                        `RECORD_ID` (`RECORD_ID`)


) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'メインメニュー設定'

PARTITION BY HASH (store_code)
PARTITIONS 8;
CREATE TRIGGER `settlement_history_UP_Date_Time`
    BEFORE UPDATE
    ON `settlement_history`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

