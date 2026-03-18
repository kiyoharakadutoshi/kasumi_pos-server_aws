import React, { useEffect, useMemo, useState } from 'react';

// Component
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import ListRadioButton, { IRadioButtonValue } from '@/components/radio-button-component/radio-button';
import CashTable from './cash-table';
import ButtonPrimary from '@/components/button/button-primary/button-primary';

// API (Service)
import {
  CashReportReponse,
  exportCashReportList,
  getCashReportList,
  ICashReportRequest,
  IExportCashReportRequest,
} from '@/services/cash-report-service';

// Redux
import { setError } from '@/reducers/error';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { IStoreInfo, IStoreSate } from '@/reducers/store-reducer';
import { clearData } from '@/reducers/special-promotion-reducer';
import { clearDataCashReport } from '@/reducers/cash-report-reducer';

// Helpers
import { isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';
import { KEYDOWN } from '@/constants/constants';

// Styles
import './cash-report.scss';

const width = `${88 / 12}%`;

const TITLE_TABLE = [
  { id: 1, name: 'cash-report.table.code', width },
  { id: 2, name: 'cash-report.table.type', width },
  { id: 3, name: 'cash-report.table.ten_thousand_count', width },
  { id: 4, name: 'cash-report.table.five_thousand_count', width },
  { id: 5, name: 'cash-report.table.two_thousand_count', width },
  { id: 6, name: 'cash-report.table.one_thousand_count', width },
  { id: 7, name: 'cash-report.table.five_hundred_count', width },
  { id: 8, name: 'cash-report.table.one_hundred_count', width },
  { id: 9, name: 'cash-report.table.fifty_count', width },
  { id: 10, name: 'cash-report.table.ten_count', width },
  { id: 11, name: 'cash-report.table.five_count', width },
  { id: 12, name: 'cash-report.table.one_count', width },
  { id: 13, name: 'cash-report.table.last_accessed_date', width: '12%' },
];

const TYPE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 1,
    textValue: 'cash-report.radio.only_for_registers',
  },
  {
    id: 0,
    textValue: 'cash-report.radio.all_registers',
  },
];

const TYPE_OF_MONEY_LIST = [
  { id: 1, name: 'ten_thousand_count' },
  { id: 2, name: 'five_thousand_count' },
  { id: 3, name: 'two_thousand_count' },
  { id: 4, name: 'one_thousand_count' },
  { id: 5, name: 'five_hundred_count' },
  { id: 6, name: 'one_hundred_count' },
  { id: 7, name: 'fifty_count' },
  { id: 8, name: 'ten_count' },
  { id: 9, name: 'five_count' },
  { id: 10, name: 'one_count' },
];

enum TYPE_OPTION {
  ONLY_FOR_REGISTERS = 1,
  ALL_REGISTERS = 0,
}

const LIMIT_RECORD = 1000;

/**
 * SC3301: Checkout machine status reference
 *
 * @returns {JSX.Element} The page for cash report screen
 */
const CashReport = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const cashReports: CashReportReponse = useAppSelector(state => state.cashReportReducer.cashReports);
  const storeReducer: IStoreSate = useAppSelector(state => state.storeReducer);
  const lang = useAppSelector(state => state.locale.currentLocale);
  const [type, setType] = useState(TYPE_OPTION.ONLY_FOR_REGISTERS);
  const titleTableLang = TITLE_TABLE.map(item => ({ ...item, name: localizeString(item?.name) }));

  /**
   * Handle search payment machine's status
   */
  const handleSearchPayment = () => {
    if (type !== TYPE_OPTION.ONLY_FOR_REGISTERS && type !== TYPE_OPTION.ALL_REGISTERS) {
      dispatch(setError(localizeFormat('MSG_VAL_019', type)));
      return;
    }

    const selectedStores = storeReducer.stores.filter(store => store.selected).map(store => store.store_code);

    if (isNullOrEmpty(selectedStores)) {
      return;
    }

    const searchParams: Readonly<ICashReportRequest> = {
      type,
      store_code: selectedStores[0],
    };

    dispatch(getCashReportList(searchParams));
  };

  /**
   * Handle export cash report
   */
  const handleExport = () => {
    if (type !== TYPE_OPTION.ONLY_FOR_REGISTERS && type !== TYPE_OPTION.ALL_REGISTERS) {
      dispatch(setError(localizeFormat('MSG_VAL_019', type)));
      return;
    }
    const selectedStores = storeReducer.stores.filter(store => store.selected).map(store => store.store_code);
    if (isNullOrEmpty(selectedStores)) return;
    const exportCashReport: Readonly<IExportCashReportRequest> = {
      type,
      store_code: selectedStores[0],
      lang,
    };

    dispatch(exportCashReportList(exportCashReport));
  };

  /**
   * Check status when selecting store
   */
  const isDisabled = useMemo(() => {
    return storeReducer.selectedStores.length === 0;
  }, [storeReducer.selectedStores.length]);

  /**
   * Handle change selected time service
   *
   * @param storeInfo The store information
   */
  const selectTimeService = (storeInfo: IStoreInfo) => {
    dispatch(
      clearData({
        startTime: storeInfo?.start_hours,
        endTime: storeInfo?.end_hours,
      }),
    );
  };

  /**
   * Change POS machine search conditions
   */
  const handleChangeTypeRadio = (value: IRadioButtonValue) => {
    setType(Number(value.id));
  };

  /**
   * Process event when click button on key board
   */
  const handlleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === KEYDOWN.F12) {
      handleSearchPayment();
    }
  };

  /**
   * The function sets the length of the cells in the header
   *  to be equal to the length of the cells in the tbody.
   *
   * @param {booleam} hasData The cash report has data
   */
  const calculatorWidthCellHeader = (hasData?: boolean) => {
    const table = document.querySelector('.table-cash-setting');

    if (!table) return;
    const theadCells = table.querySelectorAll('thead th') as unknown as HTMLElement[];
    const firstRowCells = table.querySelectorAll('tbody tr:first-child td');

    theadCells.forEach((header, index) => {
      const bodyCell = firstRowCells[index] as HTMLElement;
      if (bodyCell) {
        bodyCell.style.width = hasData ? `${header.offsetWidth + 3}px` : '97vw';
        bodyCell.style.borderBottomRightRadius = '16px';
      }
    });
  };

  /**
   * Handle clear data when change store
   */
  const handleClearData = () => {
    dispatch(clearDataCashReport());
    setType(TYPE_OPTION.ONLY_FOR_REGISTERS);
  };

  /**
   * Listen for resize and keydown events
   */
  useEffect(() => {
    const hasCashReport = cashReports?.data?.items?.length > 0;

    window.addEventListener('keydown', handlleKeyDownEvent);
    window.addEventListener('resize', () => calculatorWidthCellHeader?.(hasCashReport));

    return () => {
      window.removeEventListener('keydown', handlleKeyDownEvent);
      window.removeEventListener('resize', () => calculatorWidthCellHeader?.(hasCashReport));
    };
  });

  /**
   * Calculate cell width in header table when data changes
   */
  useEffect(() => {
    const cashReportCount = cashReports?.data?.items;
    calculatorWidthCellHeader(cashReportCount?.length > 0);
  }, [cashReports?.data?.items?.length]);

  /**
   * Clear data when init screen
   */
  useEffect(() => {
    dispatch(clearDataCashReport());
  }, []);

  return (
    <div className="menu-checkout-wrapper">
      <Header
        title="釣銭機状況照会"
        csv={{ disabled: true, listTitleTable: [], csvData: null, fileName: null }}
        printer={{
          action() {
            handleExport();
          },
        }}
        hasESC={true}
      />
      <SidebarStore onClickSearch={() => {}} firstSelectStore={selectTimeService} actionConfirm={handleClearData} expanded={true} />
      <main className="cash-report-main">
        <div className="cash-report-main__search">
          <span>{localizeFormat('cash-report.store')}</span>
          <ListRadioButton
            name="radio-cash-report"
            isVertical={true}
            value={type}
            listValues={TYPE_OPTION_LIST}
            onChange={handleChangeTypeRadio}
          />

          <ButtonPrimary disabled={isDisabled} className="search-button" text="label.searchF12" onClick={handleSearchPayment} />
        </div>
        {cashReports?.data?.is_exceed_records && (
          <div className="cash-report-main__error">
            <span className="message_warning_over_limit_record">{localizeFormat('MSG_INFO_001', LIMIT_RECORD, LIMIT_RECORD)}</span>
          </div>
        )}
        <CashTable dataCashReport={cashReports?.data?.items} titleTable={titleTableLang} listCount={TYPE_OF_MONEY_LIST} />
      </main>
    </div>
  );
};
export default CashReport;
