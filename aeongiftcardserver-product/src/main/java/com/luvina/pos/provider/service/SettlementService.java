package com.luvina.pos.provider.service;

import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.domain.transaction.SettlementHistory;
import com.luvina.pos.provider.domain.transaction.primarykey.SettlementHistoryId;
import com.luvina.pos.provider.dto.cms.TransactionDataDto;
import com.luvina.pos.provider.exception.FtpConnectionException;
import com.luvina.pos.provider.exception.FtpSendFileException;
import com.luvina.pos.provider.repository.custom.TransactionJdbcSearch;
import com.luvina.pos.provider.repository.transaction.SettlementHistoryRepository;
import com.luvina.pos.provider.util.ConvertUtils;
import com.luvina.pos.provider.util.EbcdicConverterUtils;
import com.luvina.pos.provider.util.FileUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.io.*;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service responsible for generating and exporting settlement transaction files.
 * This service processes transaction data in batches and exports them to EBCDIC-formatted files
 * for integration with external payment systems.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SettlementService {

    private final SftpService sftpService;

    private final SettlementHistoryRepository settlementHistoryRepository;

    private final TransactionJdbcSearch transactionJdbcRepository;

    /**
     * Number of records to fetch per database query
     */
    private static final Integer BATCH_SIZE = 500;

    /**
     * Maximum buffer size before flushing to file (100KB)
     */
    private static final int MAX_BUFFER_SIZE = 100 * 1024;

    /**
     * Maximum file size limit (2GB)
     */
    private static final long MAX_FILE_SIZE = 2L * 1024 * 1024 * 1024;

    private static final byte[] RECORD_CLASSIFICATION_HEADER = {(byte) 0xF1}; // 1

    private static final byte[] RECORD_CLASSIFICATION_DATA = {(byte) 0xF2}; // 2

    private static final byte[] RECORD_CLASSIFICATION_TRAILER = {(byte) 0xF8}; // 8

    private static final byte[] RECORD_CLASSIFICATION_END = {(byte) 0xF9}; // 9

    private static final byte[] AGGREGATION_LEVEL = {(byte) 0xF4}; // 1

    private static final byte[] TRANSACTION_TYPE = {(byte) 0xF1, (byte) 0xF0}; // 10

    private static final byte[] REAL_DATA = {(byte) 0xF0};

    private static final byte[] CREDIT_COMPANY_CODE = EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(63046, 5);

//    private static final byte[] TEST_DATA = {(byte) 0xF1}; // 1

    private static final byte[] TAX_FEES_7B = EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(0, 7);

    private static final byte[] TAX_FEES_11B = EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(0, 11);

    private static final String FORMAT_DATE_YYMMDD = "yyMMdd";

    private static final Integer STATUS_SUCCESS = 0;

    private static final Integer STATUS_ERROR = 1;

    private static final Integer STATUS_NOT_SEND_FILE = 2;

    @Value("${settlement.batch.folder-temp}")
    private String pathFolderTemp;

    /**
     * Main entry point for settlement file generation process.
     * Fetches transactions from last settlement time to current batch start time,
     * exports them to EBCDIC files, and updates settlement history.
     */
    public void sendFileSettlement(LocalDateTime endDateTime) throws SQLException, IOException {
        log.info("Target file output {}", pathFolderTemp);
        Integer companyCode = CommonConstants.KASUMI_COMPANY_CODE;

        // Get last settlement time as start point
        LocalDateTime startDateTime = settlementHistoryRepository.getLastSettlementTime(companyCode);

        String pathFile = createFilePath(1, endDateTime);
        Map<String, Integer> result;
        try (Context context = new Context(pathFile, endDateTime)) {
            exportFile(startDateTime, endDateTime, context);
            result = context.finish();
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            saveSettlementHistory(endDateTime, 0, "", STATUS_ERROR, e.getMessage());
            //TODO: Implement email notification for errors
            throw e;
        }
        pushFileSftp(endDateTime, result);
    }

    private void pushFileSftp(LocalDateTime endDateTime, Map<String, Integer> result) {
        String time = ConvertUtils.convertLocalDateTimeToString(endDateTime, FORMAT_DATE_YYMMDD);
        String pathFolder = pathFolderTemp + File.separator + CommonConstants.KASUMI_COMPANY_CODE + File.separator +
                time + File.separator;
        FileUtils.processFilesInFolder(pathFolder,
                file -> {
                    String pathFile = file.getAbsolutePath();
                    if (!file.isFile() || file.length() == 0) {
                        log.info("file {} is empty or is not a file", file.getAbsoluteFile());
                        saveSettlementHistory(endDateTime, 0, pathFile, STATUS_NOT_SEND_FILE, null);
                        return;
                    }
                    log.info("start push sftp file {}", file.getAbsoluteFile());
                    try {
                        sftpService.upload(file.getName(), file);
                        // Save settlement history record
                        saveSettlementHistory(endDateTime, result.get(pathFile), pathFile, STATUS_SUCCESS, null);
                    }  catch (Exception e) {
                        log.error(e.getMessage(), e);
                        saveSettlementHistory(endDateTime, result.get(pathFile), pathFile, STATUS_ERROR, e.getMessage());
                        throw new RuntimeException(e);
                    }
                }
        );
    }

    /**
     * Exports transaction data to EBCDIC file(s) by fetching data in batches.
     * Creates new files if size limit is reached.
     *
     * @param startDateTime Start of transaction period
     * @param endDateTime   End of transaction period
     * @param context       File writing context containing buffer and metadata
     * @throws SQLException If database query fails
     * @throws IOException  If file writing fails
     */
    private void exportFile(LocalDateTime startDateTime, LocalDateTime endDateTime, Context context)
            throws SQLException, IOException {
        boolean isDone;
        int offset = 0;
        int fileIndex = 1;

        do {
            // Fetch transaction batch from database
            List<TransactionDataDto> transactionList = transactionJdbcRepository.getTransactionSettlement(
                    CommonConstants.KASUMI_COMPANY_CODE, startDateTime, endDateTime, BATCH_SIZE, offset);

            int size = transactionList.size();
            if (size == 0) {
                break; // No more records to process
            }

            // Check if this is the last batch
            isDone = size < BATCH_SIZE;

            // Process all transactions in current batch
            fileIndex = processTransactionBatch(transactionList, context, fileIndex);

            // Write trailer and end records for last batch
            if (isDone) {
                writeTrailer(context);
                writeEnd(context);
                flushToFile(context);
            }

            // Move to next page
            offset += BATCH_SIZE;
        } while (!isDone);
    }

    /**
     * Processes a batch of transactions and writes them to file.
     * Handles file splitting when size limit is reached and sub-file creation
     * when store code or transaction type changes.
     *
     * @param transactionList List of transactions to process
     * @param context         File writing context
     * @param fileIndex       Current file index number
     * @return Updated file index if new file was created
     * @throws IOException If file writing fails
     */
    private int processTransactionBatch(List<TransactionDataDto> transactionList, Context context, int fileIndex)
            throws IOException {
        Integer newFileIndex = fileIndex;

        for (TransactionDataDto transactionDto : transactionList) {
            // Check if file size limit is reached - create new file if needed
            if (context.isFullData()) {
                ++newFileIndex;
                // Close current file with trailer and end records
                writeTrailer(context);
                writeEnd(context);
                flushToFile(context);

                // Create new file and reset context
                String pathFile = createFilePath(newFileIndex, context.getStartDateTime());
                context.forwardFile(pathFile);
            }

            // Check if this starts a new sub-file (different store or transaction type)
            if (context.isNewSubFile(transactionDto)) {
                // Write trailer for previous sub-file (if not the first)
                if (!context.isFirstSubFile()) {
                    writeTrailer(context);
                }
                // Initialize new sub-file
                context.forwardSubFile(transactionDto);
                writeHeader(context, transactionDto);
            }
            context.increaseTotalRecordInFile();
            // Write transaction data record
            writeData(context, transactionDto);

            // Update running totals
            context.addAmount(transactionDto);
            context.increaseCount();
        }

        return newFileIndex;
    }

    /**
     * Creates file path for settlement file.
     *
     * @param index File sequence number
     * @return Full file path
     */
    private String createFilePath(int index, LocalDateTime localDateTime) {
        String time = ConvertUtils.convertLocalDateTimeToString(localDateTime, FORMAT_DATE_YYMMDD);
        String fileName = "6301900000_____000" + String.format("%02d", index);
        return pathFolderTemp + File.separator + CommonConstants.KASUMI_COMPANY_CODE + File.separator + time +
                File.separator + fileName;
    }

    /**
     * Writes end record to file (120 bytes).
     * This is the final record in the file indicating end of data.
     *
     * @param context File writing context
     * @throws IOException If writing fails
     */
    private void writeEnd(Context context) throws IOException {
        addData(context, RECORD_CLASSIFICATION_END);
        skipData(context, 119);
        context.increaseSizeFile(120);
    }

    /**
     * Writes trailer record for a sub-file (120 bytes).
     * Contains summary information: record count and total amount.
     *
     * @param context        File writing context
     * @throws IOException If writing fails
     */
    private void writeTrailer(Context context) throws IOException {
        addData(context, RECORD_CLASSIFICATION_TRAILER); // 1 Byte
        addData(context, AGGREGATION_LEVEL); // 1 Byte
        addData(context, TRANSACTION_TYPE); // 2 Byte
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(context.getTypeHeader(), 1)); // 1 Byte
        skipData(context, 7);
        addData(context, EbcdicConverterUtils.convertLeftCharacterEBCDIC(context.getCodePayNoAeongiftHeader(), String.class,15)); // 15 Byte

        // Summary data
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(context.getCount(), 6));
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(context.getTotalAmount(), 11));
        addData(context, TAX_FEES_11B);
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(context.getTotalAmount(), 11));
        skipData(context, 54);

        context.increaseSizeFile(120);
    }

    /**
     * Writes data record for a single transaction (120 bytes).
     * Contains transaction details: gift card code, date, and amount.
     *
     * @param context        File writing context
     * @param transactionDto Transaction data to write
     * @throws IOException If writing fails
     */
    private void writeData(Context context, TransactionDataDto transactionDto) throws IOException {
        addData(context, RECORD_CLASSIFICATION_DATA); // 1 Byte
        addData(context, AGGREGATION_LEVEL); // 1 Byte
        addData(context, TRANSACTION_TYPE); // 2 Byte
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(transactionDto.getType(), 1)); // 1 Byte
        skipData(context, 7);
        addData(context, EbcdicConverterUtils.convertLeftCharacterEBCDIC(context.getCodePayNoAeongiftHeader(), String.class,15)); // 15 Byte

        // Transaction details
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(transactionDto.getGiftCardCode(), 16));
        String dateOfSale = ConvertUtils.convertLocalDateTimeToString(transactionDto.getTransactionDt(), FORMAT_DATE_YYMMDD);
        addData(context, EbcdicConverterUtils.convertRightCharacterEBCDIC(dateOfSale, String.class, 6));

        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(transactionDto.getAmount(), 7));
        addData(context, TAX_FEES_7B);
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(transactionDto.getAmount(), 7));
        String approvalNumber = ConvertUtils.lastChars(transactionDto.getApprovalNumber(), 6);
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(approvalNumber, 6));
        skipData(context, 44);

        context.increaseSizeFile(120);
    }

    /**
     * Writes header record for a new sub-file (120 bytes).
     * Contains store information and date details.
     *
     * @param context        File writing context
     * @param transactionDto Transaction containing store details
     * @throws IOException If writing fails
     */
    private void writeHeader(Context context, TransactionDataDto transactionDto) throws IOException {
        addData(context, RECORD_CLASSIFICATION_HEADER); // 1 Byte
        addData(context, AGGREGATION_LEVEL); // 1 Byte
        addData(context, TRANSACTION_TYPE); // 2 Byte
        addData(context, EbcdicConverterUtils.convertNumberHalfSizeEBCDIC(transactionDto.getType(), 1));
        skipData(context, 7);
        addData(context, EbcdicConverterUtils.convertLeftCharacterEBCDIC(context.getCodePayNoAeongiftHeader(), String.class,15)); // 15 Byte
        addData(context, EbcdicConverterUtils.convertRightCharacterEBCDIC(transactionDto.getStoreName(), String.class,
                25)); // 25 Byte
        addData(context, CREDIT_COMPANY_CODE); // 5 Byte

        String dateOfHanding = ConvertUtils.convertLocalDateTimeToString(context.getStartDateTime(), FORMAT_DATE_YYMMDD);
        addData(context, EbcdicConverterUtils.convertRightCharacterEBCDIC(dateOfHanding, String.class, 6));
        addData(context, EbcdicConverterUtils.convertRightCharacterEBCDIC(dateOfHanding, String.class, 6)); // Aggregation date
        skipData(context, 7);
        addData(context, EbcdicConverterUtils.convertRightCharacterEBCDIC(dateOfHanding, String.class, 6)); // System date
        addData(context, REAL_DATA); // 1 byte
        skipData(context, 37);

        context.increaseSizeFile(120);
    }

    /**
     * Saves settlement history record to database.
     */
    private void saveSettlementHistory(LocalDateTime settlementTime, Integer totalRecord, String pathFile,
                                       Integer status, String errorMessage) {
        SettlementHistoryId settlementHistoryId = new SettlementHistoryId();
        settlementHistoryId.setCompanyCode(CommonConstants.KASUMI_COMPANY_CODE);
        settlementHistoryId.setOutputDatetime(settlementTime);
        settlementHistoryId.setPathFileOutput(pathFile);

        SettlementHistory settlementHistory = new SettlementHistory();
        settlementHistory.setId(settlementHistoryId);
        settlementHistory.setFileSendingTime(STATUS_SUCCESS.equals(status) ? LocalDateTime.now() : null);
        settlementHistory.setTotalRecord(totalRecord);
        settlementHistory.setStatus(status);
        settlementHistory.setErrorMessage(ConvertUtils.limitToChars(errorMessage, 500));
        settlementHistoryRepository.save(settlementHistory);
    }

    /**
     * Adds data to buffer and flushes to file if buffer is full.
     * Thread-safe method to prevent concurrent modification.
     *
     * @param context File writing context
     * @param data    Byte array to add
     * @throws IOException If writing fails
     */
    private synchronized void addData(Context context, byte[] data) throws IOException {
        if (data == null || data.length == 0) {
            return;
        }

        context.getByteList().add(data);
        context.increaseBufferSize(data.length);

        // Flush buffer if it exceeds maximum size
        if (context.getCurrentBuffSize() >= MAX_BUFFER_SIZE) {
            flushToFile(context);
        }
    }

    /**
     * Flushes buffered data to file and clears buffer.
     * Thread-safe method to prevent concurrent writes.
     *
     * @param context File writing context
     * @throws IOException If writing fails
     */
    private synchronized void flushToFile(Context context) throws IOException {
        if (!CollectionUtils.isEmpty(context.getByteList())) {
            context.getFos().write(convertWithArrayCopy(context.getByteList()));
        }
        context.getByteList().clear();
        context.clearBufferSize();
    }

    /**
     * Converts list of byte arrays into single byte array.
     *
     * @param byteList List of byte arrays to merge
     * @return Single merged byte array
     */
    private byte[] convertWithArrayCopy(List<byte[]> byteList) {
        int totalLength = byteList.stream().mapToInt(a -> a.length).sum();
        byte[] result = new byte[totalLength];

        int currentPosition = 0;
        for (byte[] array : byteList) {
            System.arraycopy(array, 0, result, currentPosition, array.length);
            currentPosition += array.length;
        }
        return result;
    }

    /**
     * Adds padding bytes (0x40 in EBCDIC space character) to file.
     *
     * @param context     File writing context
     * @param totalLength Number of padding bytes to add
     * @throws IOException If writing fails
     */
    private void skipData(Context context, int totalLength) throws IOException {
        byte[] padding = new byte[totalLength];
        Arrays.fill(padding, (byte) 0x40);
        addData(context, padding);
    }

    /**
     * Context class for managing file writing state and buffers.
     * Maintains metadata about current file, sub-file, and running totals.
     */
    @Data
    class Context implements Closeable {

        /**
         * File output stream for writing
         */
        private FileOutputStream fos;

        /**
         * Path file
         */
        private String pathFile;

        /**
         * Buffer list for pending writes
         */
        private List<byte[]> byteList;

        /**
         * Current buffer size in bytes
         */
        private Integer currentBuffSize;

        /**
         * Start date/time of settlement period
         */
        private LocalDateTime startDateTime;

        /**
         * Running total of transaction amounts
         */
        private Long totalAmount;

        /**
         * Current sub-file store code (-1 indicates no sub-file)
         */
        private String codePayNoAeongiftHeader;

        /**
         * Current sub-file transaction type (-1 indicates no sub-file)
         */
        private Integer typeHeader;

        /**
         * Count of records in current sub-file
         */
        private Integer count;

        /**
         * Total of records in File
         */
        private Integer totalRecordInFile;

        /**
         * Key: file name
         * Value: total number of records in that file
         */
        private Map<String, Integer> fileRecordCountMap;

        /**
         * Total bytes written to current file
         */
        private Long totalByteInFile;

        private static final String CODE_PAY_NO_AEON_GIFT_DEFAULT = "99999999999";

        /**
         * Initializes context with file path and start date/time.
         *
         * @param path          File path to write to
         * @param startDateTime Settlement period start time
         * @throws FileNotFoundException If file cannot be created
         */
        public Context(String path, LocalDateTime startDateTime) throws IOException {
            this.pathFile = path;
            this.currentBuffSize = 0;
            this.count = 0;
            this.byteList = new ArrayList<>();
            String parentFolder = FileUtils.getParentDirectory(path);
            FileUtils.clearFolderContent(parentFolder);
            FileUtils.ensureParentDirectoriesExist(path);
            this.fos = new FileOutputStream(path, true);
            this.codePayNoAeongiftHeader = CODE_PAY_NO_AEON_GIFT_DEFAULT;
            this.typeHeader = -1;
            this.totalAmount = 0L;
            this.startDateTime = startDateTime;
            this.totalByteInFile = 0L;
            this.totalRecordInFile = 0;
            this.fileRecordCountMap = new HashMap<>();
        }

        /**
         * Checks if this is the first sub-file in the file.
         *
         * @return true if no sub-file has been written yet
         */
        public boolean isFirstSubFile() {
            return CODE_PAY_NO_AEON_GIFT_DEFAULT.equals(codePayNoAeongiftHeader) && typeHeader.equals(-1);
        }

        /**
         * Checks if transaction belongs to a new sub-file.
         * Sub-files are grouped by store code and transaction type.
         *
         * @param transactionDto Transaction to check
         * @return true if transaction requires new sub-file
         */
        public boolean isNewSubFile(TransactionDataDto transactionDto) {
            return !this.codePayNoAeongiftHeader.equals(transactionDto.getCodePayNoAeongift())
                    || !this.typeHeader.equals(transactionDto.getType());
        }

        /**
         * Adds transaction amount to running total.
         *
         * @param transactionDto Transaction to add
         */
        public synchronized void addAmount(TransactionDataDto transactionDto) {
            totalAmount += transactionDto.getAmount();
        }

        /**
         * Increments record count for current sub-file.
         */
        public synchronized void increaseCount() {
            ++this.count;
        }

        /**
         * Increments record count for current sub-file.
         */
        public synchronized void increaseTotalRecordInFile() {
            ++this.totalRecordInFile;
        }

        /**
         * Updates context to track new sub-file group.
         *
         * @param transactionDto Transaction starting new sub-file
         */
        public synchronized void forwardSubFile(TransactionDataDto transactionDto) {
            this.codePayNoAeongiftHeader = transactionDto.getCodePayNoAeongift();
            this.typeHeader = transactionDto.getType();
            this.count = 0;
            this.totalAmount = 0L;
        }

        /**
         * Switches to new file and resets context state.
         *
         * @param pathFileNew Path for new file
         * @throws IOException If file creation fails
         */
        public synchronized void forwardFile(String pathFileNew) throws IOException {
            this.fos.close();
            FileUtils.ensureParentDirectoriesExist(pathFileNew);
            this.fos = new FileOutputStream(pathFileNew, true);
            this.count = 0;
            this.currentBuffSize = 0;
            this.byteList = new ArrayList<>();
            this.codePayNoAeongiftHeader = CODE_PAY_NO_AEON_GIFT_DEFAULT;
            this.typeHeader = -1;
            this.totalAmount = 0L;
            this.totalByteInFile = 0L;
            String pathFileOld = this.pathFile;
            this.fileRecordCountMap.put(pathFileOld, this.totalRecordInFile);
            this.pathFile = pathFileNew;
            this.totalRecordInFile = 0;
        }

        /**
         * Checks if adding trailer and end records would exceed file size limit.
         *
         * @return true if file is full (240 bytes = 2 records of 120 bytes each)
         */
        public boolean isFullData() {
            return this.totalByteInFile + 240 >= MAX_FILE_SIZE;
        }

        /**
         * Increases current buffer size.
         *
         * @param length Bytes to add to buffer size
         */
        public synchronized void increaseBufferSize(int length) {
            this.currentBuffSize += length;
        }

        /**
         * Increases total file size counter.
         *
         * @param length Bytes written to file
         */
        public synchronized void increaseSizeFile(int length) {
            this.totalByteInFile += length;
        }

        /**
         * Resets buffer size to zero after flush.
         */
        public synchronized void clearBufferSize() {
            this.currentBuffSize = 0;
        }

        public Map<String, Integer> finish(){
            this.fileRecordCountMap.put(this.pathFile, this.totalRecordInFile);
            return this.fileRecordCountMap;
        }

        /**
         * Closes file output stream.
         *
         * @throws IOException If close operation fails
         */
        @Override
        public void close() throws IOException {
            fos.close();
        }
    }
}