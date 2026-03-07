package com.luvina.pos.provider.constant;

public class CommonConstants {

    private CommonConstants(){
    }

    public static final Integer KASUMI_COMPANY_CODE = 100;
    public static final String FORMAT_DATE_DEFAULT = "yyyy/MM/dd";
    public static final String FORMAT_TIME_SECOND = "HH:mm:ss";
    public static final String EMPLOYEE_CODE_DEFAULT = "9999";
    public static final String COMPANY_CODE_DEFAULT = "000";
    public static final String STORE_CODE_DEFAULT = "000000";
    public static final String INSTORE_CODE_DEFAULT = "000";
    public static final String CAN_UPDATE_FLAG = "1";
    public static final String URL_FOLDER_APP = "App/Windows";
    public static final String START_FILE_NAME = "posapp_";
    public static final String END_FILE_ZIP = ".zip";
    public static final String END_FILE_MSI = ".msi";
    public static final String BLANK = "";
    public static final String LOCAL_DATE_TIME_FORMAT_MILLIS = "yyyy/MM/dd HH:mm:ss.SSS";
    public static final String LOCAL_DATE_TIME_FORMAT_SECONDS = "yyyy/MM/dd HH:mm:ss";
    public static final String STRING_DATE_TIME_FORMAT_MINUTE = "yyyy/MM/dd HH:mm";
    public enum OperationType {
        LIST_FILES,
        PRESIGN_URL,
    }

}
