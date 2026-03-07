package com.luvina.pos.provider.repository.custom;

import com.luvina.pos.provider.dto.cms.TransactionDataDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@Slf4j
public class TransactionJdbcSearch {


    private final DataSource dataSource;

    public TransactionJdbcSearch(@Qualifier("transactionDataSource") DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<TransactionDataDto> getTransactionSettlement(int companyCode, LocalDateTime startDate, LocalDateTime endDate, Integer limit, Integer offset) throws SQLException {

        StringBuilder sql = new StringBuilder("""
                select
                	t.transaction_dt,
                	t.gift_card_code,
                	t.amount,
                	t.type,
                	t.approval_number,
                	s.code_pay_no_aeongift,
                	s.ten_name
                from
                	transaction as t
                	inner join M_KSM.stores as s
                	on
                	(t.store_code = s.store_code and
                	s.company_code = t.company_code and
                	s.record_void_flag <> '1' )
                where
                	t.record_void_flag <>'1' and
                	s.code_pay_no_aeongift is not null and
                	t.company_code = ?
                """);

        if (startDate != null) {
            sql.append("""
                    and (t.record_create_date > DATE(?)
                    or (
                        t.record_create_date = DATE(?)
                        AND t.record_create_time > TIME(?)
                        )
                    )
                    """);
        }

        if (endDate != null) {
            sql.append("""
                    and (t.record_create_date < DATE(?)
                        or (
                            t.record_create_date = DATE(?)
                            AND t.record_create_time <= TIME(?)
                        )
                    )
                    """);

        }

        sql.append("""
                order by s.code_pay_no_aeongift, t.type
                limit ? offset ?
                """);

        PreparedStatement pstmt;

        try (Connection con = dataSource.getConnection()) {
            int paramIndex = 0;
            pstmt = con.prepareStatement(sql.toString());
            pstmt.setLong(++paramIndex, companyCode);

            if (startDate != null) {
                var startTimeStamp =  Timestamp.valueOf(startDate);
                pstmt.setTimestamp(++paramIndex, startTimeStamp);
                pstmt.setTimestamp(++paramIndex, startTimeStamp);
                pstmt.setTimestamp(++paramIndex, startTimeStamp);
            }

            if (endDate != null) {
                var endTimeStamp =  Timestamp.valueOf(endDate);
                pstmt.setTimestamp(++paramIndex, endTimeStamp);
                pstmt.setTimestamp(++paramIndex, endTimeStamp);
                pstmt.setTimestamp(++paramIndex, endTimeStamp);
            }

            pstmt.setInt(++paramIndex, limit);
            pstmt.setInt(++paramIndex, offset);
            ResultSet rs = pstmt.executeQuery();
            List<TransactionDataDto> transactionDataDtoList = new ArrayList<>();
            while (rs.next()) {
                TransactionDataDto transactionDataDto = new TransactionDataDto();
                String codePayNoAeongift = rs.getString("code_pay_no_aeongift");
                codePayNoAeongift = codePayNoAeongift == null ? null : codePayNoAeongift
                        .replace(" ", "")
                        .replace("-", "")
                        .replace("ー", "")  // fullwidth space
                        .replace("　", ""); // fullwidth hyphen;
                transactionDataDto.setCodePayNoAeongift(codePayNoAeongift);
                transactionDataDto.setTransactionDt(rs.getTimestamp("transaction_dt").toLocalDateTime());
                transactionDataDto.setGiftCardCode(rs.getString("gift_card_code"));
                transactionDataDto.setAmount(rs.getInt("amount"));
                transactionDataDto.setType(rs.getInt("type"));
                transactionDataDto.setStoreName(rs.getString("ten_name"));
                transactionDataDto.setApprovalNumber(rs.getString("approval_number"));
                transactionDataDtoList.add(transactionDataDto);
            }
            return transactionDataDtoList;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw e;
        }
    }
}
