DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies`
(
    `record_id`                 bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date          date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time          time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date          date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time          time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag            char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    company_code                int         NOT NULL COMMENT '企業コード',
    company_name                varchar(50) NOT NULL COMMENT '企業名',
    company_name_official       varchar(50)          DEFAULT '' COMMENT '企業名(正式名称)',
    company_name_official_short varchar(50)          DEFAULT '' COMMENT '企業名(正式略称)',
    age_verification_ptn        int         NOT NULL DEFAULT 2 COMMENT '年齢確認パターン',
    registration_number         varchar(14)          DEFAULT '' COMMENT '登録番号',
    PRIMARY KEY (`company_code`),
    UNIQUE KEY `record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = '企業マスタ';


CREATE TRIGGER `companies_UP_Date_Time`
    BEFORE UPDATE
    ON `companies`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores`
(
    `record_id`               bigint       NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date        date         NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time        time         NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date        date         NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time        time         NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag          char(1)      NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`            int          NOT NULL COMMENT '企業コード',
    `store_code`              int          NOT NULL COMMENT '店舗コード',
    `ten_name`                varchar(50)  NOT NULL COMMENT '店舗名称',
    `ten_short_nm`            varchar(30)  NOT NULL COMMENT '店舗名称（略称）',
    `ten_short_nm_en`         varchar(100) COMMENT '店舗名称（英語）',
    `search_keyword`          varchar(1000) COMMENT '検索キーワード',
    `business_type_code`      varchar(10) COMMENT '業態',
    `post_cd`                 varchar(10) COMMENT '郵便番号',
    `address1`                varchar(100) COMMENT '住所1',
    `address2`                varchar(100) COMMENT '住所2',
    `address3`                varchar(100) COMMENT '住所3',
    `tel_num`                 varchar(13)  NOT NULL COMMENT '電話番号',
    `fax_num`                 varchar(13) COMMENT 'FAX番号',
    `mail_address`            varchar(1000) COMMENT '代表メールアドレス',
    `mail_delivery1`          varchar(1000) COMMENT '配信メールアドレス1',
    `mail_delivery2`          varchar(1000) COMMENT '配信メールアドレス2',
    `mail_delivery3`          varchar(1000) COMMENT '配信メールアドレス3',
    `store_detail_page_link`  varchar(2000) COMMENT '店舗詳細ページリンク',
    `last_open_dt`            date COMMENT '最終開店日時',
    `last_close_dt`           date COMMENT '最終精算日時',
    `open_count`              varchar(18)  NOT NULL COMMENT '営業回数',
    `map_latitude`            varchar(12)  NOT NULL COMMENT '緯度',
    `map_longitude`           varchar(12)  NOT NULL COMMENT '経度',
    `coord_threshold_in`      int          NOT NULL COMMENT '店舗認識閾値',
    `coord_threshold_nearby`  int          NOT NULL COMMENT '近隣店舗認識閾値',
    `checkin_mode`            int          NOT NULL COMMENT 'チェックイン方法',
    `checkout_mode`           int          NOT NULL COMMENT 'チェックアウト方法',
    `pwd`                     varchar(128) NOT NULL COMMENT 'パスワード',
    `close_alert_time`        int          NOT NULL COMMENT '営業終了時間アラート',
    `map_flag`                int COMMENT 'MAP表示対象フラグ',
    `system_id`               varchar(10) COMMENT 'システムID',
    `business_day_sun`        int          NOT NULL COMMENT '日曜営業日有無',
    `business_open_sun`       time         NOT NULL COMMENT '日曜営業開始時間',
    `business_close_sun`      time         NOT NULL COMMENT '日曜営業終了時間',
    `business_day_mon`        int          NOT NULL COMMENT '月曜営業日有無',
    `business_open_mon`       time         NOT NULL COMMENT '月曜営業開始時間',
    `business_close_mon`      time         NOT NULL COMMENT '月曜営業終了時間',
    `business_day_tue`        int          NOT NULL COMMENT '火曜営業日有無',
    `business_open_tue`       time         NOT NULL COMMENT '火曜営業開始時間',
    `business_close_tue`      time         NOT NULL COMMENT '火曜営業終了時間',
    `business_day_wed`        int          NOT NULL COMMENT '水曜営業日有無',
    `business_open_wed`       time         NOT NULL COMMENT '水曜営業開始時間',
    `business_close_wed`      time         NOT NULL COMMENT '水曜営業終了時間',
    `business_day_thu`        int          NOT NULL COMMENT '木曜営業日有無',
    `business_open_thu`       time         NOT NULL COMMENT '木曜営業開始時間',
    `business_close_thu`      time         NOT NULL COMMENT '木曜営業終了時間',
    `business_day_fri`        int          NOT NULL COMMENT '金曜営業日有無',
    `business_open_fri`       time         NOT NULL COMMENT '金曜営業開始時間',
    `business_close_fri`      time         NOT NULL COMMENT '金曜営業終了時間',
    `business_day_sat`        int          NOT NULL COMMENT '土曜営業日有無',
    `business_open_sat`       time         NOT NULL COMMENT '土曜営業開始時間',
    `business_close_sat`      time         NOT NULL COMMENT '土曜営業終了時間',
    `code_pay_no_aeonpay`     char(11) COMMENT 'AFS コード決済加盟店番号(AEON PAY)',
    `code_pay_no_etc`         char(11) COMMENT 'AFS コード決済加盟店番号(他社ペイ)',
    `givepoint_flag`          int COMMENT 'ポイント付与有無',
    `coupon_uncheckable_flag` int COMMENT 'クーポン利用確認不可フラグ',
    `unmanned_store_flag`     int COMMENT '無人店舗フラグ',
    `gate_check_pattern`      int COMMENT 'ゲートセキュリティチェック方法',
    `gate_check_frequency`    int COMMENT 'ゲートセキュリティチェック頻度',
    `tran_relay_flag`         int COMMENT '取引データ連携有無',
    PRIMARY KEY (`store_code`, `company_code`),
    UNIQUE KEY `record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = '店舗マスタ';


CREATE TRIGGER `stores_UP_Date_Time`
    BEFORE UPDATE
    ON `stores`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`
(
    `record_id`        bigint       NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date date         NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time time         NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date date         NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time time         NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag   char(1)      NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    company_code       int          NOT NULL COMMENT '企業コード',
    store_code         int          NOT NULL COMMENT '店舗コード',
    user_id            varchar(32)  NOT NULL COMMENT 'ユーザーID',
    password           varchar(100) NOT NULL COMMENT 'パスワード',
    name               varchar(50)  NOT NULL COMMENT 'ユーザー名',
    role_code          varchar(2)   NOT NULL COMMENT '権限コード',
    created_user_id    bigint                DEFAULT 0 COMMENT 'ユーザー生成コード',
    updated_user_id    bigint                DEFAULT 0 COMMENT 'ユーザー更新コード',
    PRIMARY KEY (`user_id`, `company_code`),
    KEY                `record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'ユーザー'
PARTITION BY HASH (company_code)
PARTITIONS 8;
CREATE TRIGGER `users_UP_Date_Time`
    BEFORE UPDATE
    ON `users`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;


DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`
(
    `record_id`        bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag   char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`     int         NOT NULL COMMENT '企業コード',
    `alias_name`       varchar(50) NOT NULL COMMENT '別名',
    `menu_code`        varchar(3)  NOT NULL COMMENT 'メインメニュー番号',
    `name`             varchar(50) NOT NULL COMMENT 'メインメニュー名',
    PRIMARY KEY (`menu_code`, `company_code`),
    KEY                `RECORD_ID` (`RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'メインメニュー設定';


CREATE TRIGGER `permissions_UP_Date_Time`
    BEFORE UPDATE
    ON `permissions`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;


DROP TABLE IF EXISTS `permission_roles`;
CREATE TABLE `permission_roles`
(
    `record_id`        bigint     NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date date       NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time time       NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date date       NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time time       NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag   char(1)    NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    company_code       int        NOT NULL COMMENT '企業コード/企業コード',
    role_code          varchar(2) NOT NULL COMMENT '権限コード/00：システム管理者　01：本部ユーザー　02：店舗ユーザー',
    menu_code          varchar(3) NOT NULL COMMENT 'メインメニュー番号/メインメニュー番号',
    status             smallint   NOT NULL COMMENT '表示フラグ/取得値: 0: 非表示、1: 表示',
    PRIMARY KEY (`menu_code`, `role_code`, `company_code`),
    KEY                `record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'メインメニュー権限';


CREATE TRIGGER `permission_roles_UP_Date_Time`
    BEFORE UPDATE
    ON `permission_roles`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees`
(
    `record_id`          bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date   date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time   time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date   date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time   time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag     char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`       int         NOT NULL COMMENT '企業コード',
    `store_code`         int         NOT NULL COMMENT '店舗コード',
    `employee_code`      varchar(16) NOT NULL COMMENT '従業員コード',
    `employee_role_code` varchar(2) COMMENT '従業員ロールコード',
    `name`               varchar(50) COMMENT '従業員名',
    `last_name`          varchar(50) COMMENT '従業員名(姓名の姓)',
    `first_name`         varchar(50) COMMENT '従業員名(姓名の名)',
    `ret_date`           date COMMENT '退職日',
    PRIMARY KEY (`employee_code`, `store_code`, `company_code`),
    KEY                  `RECORD_ID` (`RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = '従業員マスタ'
PARTITION BY HASH (store_code)
PARTITIONS 8;
CREATE TRIGGER `employees_UP_Date_Time`
    BEFORE UPDATE
    ON `employees`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `instores`;
CREATE TABLE `instores`
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
    `instore_type_code`         varchar(10) COMMENT 'レジ用途',
    `device_class_code`         int COMMENT '区分',
    `node_type_code`            varchar(10) COMMENT 'ノード種別',
    `charging_machine`          int COMMENT 'チャージ専用機',
    `ignica_money_charge`       int COMMENT 'ignicaマネーチャージ対応',
    `waon_charge`               int COMMENT 'WAONチャージ対応',
    `button_layout_code`        varchar(5) COMMENT 'プリセットレイアウト',
    `function_layout_code`      varchar(5) COMMENT 'ファンクションレイアウト',
    `keyboard_layout_code`      varchar(5) COMMENT 'キーボードレイアウト',
    `receipt_message_code`      varchar(50) COMMENT 'レシートメッセージ',
    `ip_address`                varchar(20) COMMENT 'IPアドレス',
    `mac_address`               varchar(50) COMMENT 'MACアドレス',
    `startup_time`              time COMMENT '自動起動時間',
    `customer_count_excluded`   int COMMENT '客数集計除外',
    `morning_discount_excluded` int COMMENT '朝割除外　　　　',
    `mega_discount_excluded`    int COMMENT 'メガ割除外',
    `rate_customer_excluded`    int COMMENT '構成比除外',
    `pos_model`                 varchar(50) COMMENT 'POS機種',
    `cash_machine_model`        varchar(50) COMMENT '釣銭機機種',
    `scanner_model`             varchar(50) COMMENT 'スキャナ機種',
    `tenant_hierarchy_code`     varchar(10) COMMENT 'テナントレジ部門',
    `updated_user`              bigint COMMENT '更新者',
    `note1`                     varchar(2000) COMMENT '備考1',
    `note2`                     varchar(2000) COMMENT '備考2',
    `note3`                     varchar(2000) COMMENT '備考3',
    `receipt_coupon_excluded`   int COMMENT 'レシートクーポン発行除外',
    `used_standard_price`       int COMMENT '定番売価使用',
    PRIMARY KEY (`instore_code`, `store_code`, `company_code`),
    KEY                         `RECORD_ID` (`RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'レジマスタ'
PARTITION BY HASH (store_code)
PARTITIONS 8;
CREATE TRIGGER `instores_UP_Date_Time`
    BEFORE UPDATE
    ON `instores`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;

DROP TABLE IF EXISTS `code_master`;
CREATE TABLE `code_master`
(
    `record_id`        bigint      NOT NULL AUTO_INCREMENT COMMENT 'レコードID',
    record_create_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード作成日付',
    record_create_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード作成時間',
    record_update_date date        NOT NULL DEFAULT (CURRENT_DATE()) COMMENT 'レコード更新日付/トリガーにより更新',
    record_update_time time        NOT NULL DEFAULT (CURRENT_TIME()) COMMENT 'レコード更新時間/トリガーにより更新',
    record_void_flag   char(1)     NOT NULL DEFAULT '' COMMENT 'レコード無効フラグ / "": 有効フラグ、 1:無効フラグ',
    `company_code`     int         NOT NULL COMMENT '企業コード',
    `master_code`      varchar(6)  NOT NULL COMMENT 'コード種別番号',
    `property_name`    varchar(50) COMMENT 'プロパティ名',
    `code_no`          varchar(10) NOT NULL COMMENT 'コード番号',
    `code_value`       varchar(50) COMMENT 'コード値',
    `code_value_ext1`  varchar(15) COMMENT 'コード値_その他1',
    `code_value_ext2`  varchar(15) COMMENT 'コード値_その他2',
    `code_value_ext3`  varchar(15) COMMENT 'コード値_その他3',
    `code_value_ext4`  varchar(15) COMMENT 'コード値_その他4',
    `order`            int COMMENT '並び順',
    `created_user_id`  bigint COMMENT 'ユーザー生成コード',
    `updated_user_id`  bigint COMMENT 'ユーザー更新コード',
    PRIMARY KEY (`master_code`, `code_no`, `company_code`),
    KEY                `RECORD_ID` (`RECORD_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT = 'コードマスタ'
PARTITION BY HASH (company_code)
PARTITIONS 8;
CREATE TRIGGER `code_master_UP_Date_Time`
    BEFORE UPDATE
    ON `code_master`
    FOR EACH ROW SET NEW.record_update_date = CURRENT_DATE, NEW.record_update_time = CURRENT_TIME;




