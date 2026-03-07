import React, { memo, useEffect, useRef, useState } from 'react';
import { Translate } from 'react-jhipster';
import { Count, NormalTableProps } from '../interface-cash';
import { CashReport } from '@/services/cash-report-service';

// Utils
import { localizeString } from '@/helpers/utils';

// Styles
import './cash-table.scss';
import { debounce } from 'lodash';

interface CashReportRowProps {
  rowIndex: number;
  row: CashReport;
  listCount: Count[];
}

const LIMIT_RECORDS = 1000;

/**
 * Payment terminal status tracking table
 */
const CashTable: React.FC<NormalTableProps> = ({ titleTable, dataCashReport, listCount, isExceedRecords }) => {
  const scrollRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Check has scroll to set margin top scroll bar with header table
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !scrollContainerRef.current) return;

    const checkScroll = debounce(() => {
      const shouldHaveScroll = el.scrollHeight > el.clientHeight;

      if (shouldHaveScroll && scrollContainerRef.current) {
        scrollContainerRef.current.classList.add("cash-report-scroll");
      } else {
        scrollContainerRef.current.classList.remove("cash-report-scroll");
      }
    }, 10);

    checkScroll();

    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
  }, [dataCashReport?.length]);

  return (
    <div className={`cash-report${isExceedRecords ? ' cash-report-exceed' : ''}`} ref={scrollContainerRef}>
      <div className="right-header" />
      <div className="cash-table-container" ref={scrollRef}>
        <CashTableData titleTable={titleTable} dataCashReport={dataCashReport} listCount={listCount} />
      </div>
      <div className="color-additional-cash">
        <div className="set-cash">
          <span className="not-add-cash"></span>
          <label className="padding-left">:</label>
          <span className="padding-left">
            <Translate contentKey="cash-report.box-color.no_refill_required" />
          </span>
        </div>
        <div className="set-cash">
          <span className="add-cash"></span>
          <label className="padding-left">:</label>
          <label className="padding-left">
            <Translate contentKey="cash-report.box-color.needs_refill" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CashTable;

const CashReportRow: React.FC<CashReportRowProps> = memo(({ rowIndex, row, listCount }) => {
  return (
    <React.Fragment key={rowIndex}>
      <tr className="row-table">
        <td rowSpan={3} className="cash-no data-item">
          {row.cash_register_code}
        </td>
        <td className="cash-type data-item">{localizeString('label.cash_threshold')}</td>
        {listCount?.map((count) => (
          <td key={count.id} className="cash-thousand-count data-item">
            {row.cash_threshold[count.name]}
          </td>
        ))}
        <td rowSpan={3} className="cash-last-accessed-date data-item">
          {row.remaining_cash.last_retrieved_date}
        </td>
      </tr>
      <tr className="row-table">
        <td className="cash-type data-item">{localizeString('label.remaining_cash')}</td>
        {listCount?.map((count) => (
          <td key={count.id} className="cash-thousand-count data-item">
            {row.remaining_cash[count.name]}
          </td>
        ))}
      </tr>
      <tr className="row-table">
        <td className="cash-type data-item">{localizeString('label.additional_cash')}</td>
        {listCount?.map((count) => (
          <td
            key={count.id}
            className={`cash-thousand-count data-item ${
              !isNaN(Number(row.additional_cash[count.name])) ? 'box-no-refill-required' : 'box-needs-refill'
            }`}
          >
            {row.additional_cash[count.name]}
          </td>
        ))}
      </tr>
    </React.Fragment>
  );
});

/**
 * Payment terminal status tracking table
 */
const CashTableData = memo(function CashTableData({ titleTable, dataCashReport, listCount }: NormalTableProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (dataCashReport?.length === 0) {
      setMessage(localizeString('MSG_ERR_001'));
    } else {
      setMessage('');
    }
  }, [dataCashReport?.length]);

  return (
    <table className="table table-responsive table-cash-setting scroll">
      <thead className="title-table">
        <tr className="header-table">
          {titleTable?.map((data) => {
            return (
              <th key={data.id} style={{ width: data.width }} scope="col" className="header-setting">
                {data?.name}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className={`${dataCashReport?.length === LIMIT_RECORDS ? 'is-exceed-records' : ''}`}>
        {dataCashReport?.length > 0 ? (
          dataCashReport?.map((row, rowIndex) => (
            <CashReportRow rowIndex={rowIndex} listCount={listCount} row={row} key={rowIndex + 'item'} />
          ))
        ) : (
          <tr className="row-table">
            <td className="row_no-data" colSpan={13}>
              <div className="red-text">{message}</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
});
