import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { translate } from 'react-jhipster';
import { saveAs } from 'file-saver';

// Component
import Header from 'app/components/header/header';
import TableSearchJournal from 'app/modules/search-journal/search-journal-table';
import BottomButton from 'app/components/bottom-button/bottom-button';
import { Position } from 'app/components/date-picker/date-picker';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import DatePickerCustom from 'app/components/date-picker/date-picker-custom';
import JournalList from './journal-list';
import ListRadioButton from 'app/components/radio-button-component/radio-button';
import Dropdown from 'app/components/dropdown/dropdown';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import TimePickerCustom from 'app/components/time-picker/time-picker-custom';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';

// INTERFACE
import {
  initISearchJournal,
  IsAscendingType,
  ISearchJournal,
} from 'app/modules/search-journal/search-journal-interface';

// REDUX
import { IStoreSate } from 'app/reducers/store-reducer';

// VALIDATE
import { validateEmptyData, validateFutureDate, validatePeriodDate, validateReceiptNo } from './validate';

// API
import { getCashRegisterCodeList } from 'app/services/setting-master-service';
import { exportBill, getListEmployees, searchJournals } from 'app/services/search-journal-service';

// STYLES
import './search-journal.scss';

// UTILS
import { convertDateServer, getTimExportCSV } from 'app/helpers/date-utils';
import { isNullOrEmpty } from 'app/helpers/utils';
import { KEYDOWN } from '@/constants/constants';

const SearchJournal = () => {
  const dispatch = useAppDispatch();
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const selected_stores_reducer = storeReducer?.stores
    ?.filter((store) => store.selected)
    .map((store) => store.store_code);
  const selectedStoresBeforeConfirm = storeReducer.selectedStores;
  const [presetValue, setPresetValue] = useState<ISearchJournal>(initISearchJournal);
  const [cashRegisterCodeList, setCashRegisterCodeList] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dataSearchJournal, setDataSearchJournal] = useState<ISearchJournal[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(0, 0, 0, 0)));
  const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(23, 59, 0, 0)));
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isShowData, setIsShowData] = useState(true);
  const [currentSortColumn, setCurrentSortColumn] = useState(null);
  const isHaveItemSelected = dataSearchJournal.some((item) => item.selected);
  const [isAscending, setIsAscending] = useState<IsAscendingType>({
    store_code: true,
    cash_register_code: true,
    transaction_date: true,
    receipt_no: true,
    type: true,
    is_training_mode: true,
    subtotal: true,
  });

  const getHoursAndMinutes = (time) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const dataRadio = [
    { id: '0', checkBoxValue: 0, textValue: 'OR' },
    { id: '1', checkBoxValue: 1, textValue: 'AND' },
  ];
  const checkDisable = !storeReducer?.selectedStores || storeReducer?.selectedStores?.length === 0;

  // Handle search when click button
  const handleSearchJournal = () => {
    // validate date
    if (!validateFutureDate(startDate, dispatch)) return;
    if (!validateFutureDate(endDate, dispatch)) return;
    if (!validateEmptyData(_.toString(startDate), 'searchJournal.msgVal.MSG_VAL_001_date', dispatch)) return;
    if (!validateEmptyData(_.toString(endDate), 'searchJournal.msgVal.MSG_VAL_001_date', dispatch)) return;
    if (!validateEmptyData(_.toString(startTime), 'searchJournal.msgVal.MSG_VAL_001_time', dispatch)) return;
    if (!validateEmptyData(_.toString(endTime), 'searchJournal.msgVal.MSG_VAL_001_time', dispatch)) return;
    if (!validatePeriodDate(startDate, endDate, startTime, endTime, dispatch)) return;
    // validate receipt_no
    if (!validateReceiptNo(presetValue.receipt_no_from, presetValue.receipt_no_to, dispatch)) return;

    // handle param
    const param = {
      selected_stores: [...selected_stores_reducer],
      business_date_from: convertDateServer(startDate),
      business_date_to: convertDateServer(endDate),
      business_time_from: getHoursAndMinutes(startTime),
      business_time_to: getHoursAndMinutes(endTime),
      condition_type: Number(presetValue.condition_type) || 0,
      cash_register_code: presetValue.cash_register_code || '',
      employee_code: presetValue.employee_code || '',
      keyword_1: presetValue.keyword_1 || '',
      keyword_2: presetValue.keyword_2 || '',
      receipt_no_from: presetValue.receipt_no_from || '',
      receipt_no_to: presetValue.receipt_no_to || '',
      sort_colum: currentSortColumn,
    };

    // reset checkbox and list journal detail before search
    setSelectedRow([]);
    setDataSearchJournal((prevItems) => prevItems.map((item) => ({ ...item, selected: false })));
    setSelectAll(false);
    dispatch(searchJournals(param))
      .unwrap()
      .then((response) => {
        if (response.data) {
          const { items } = response.data.data;
          setDataSearchJournal(response.data && items);
          response.data && items.length > 0 ? setIsShowData(true) : setIsShowData(false);
          // refresh icon and condition search
          setCurrentSortColumn(null);
          setIsAscending({
            store_code: true,
            cash_register_code: true,
            transaction_date: true,
            receipt_no: true,
            type: true,
            is_training_mode: true,
            subtotal: true,
          });
        }
      })
      .catch(() => {});
  };

  const handleClearSearchCondition = () => {
    //  reset condition search
    setPresetValue(initISearchJournal);
    setCashRegisterCodeList([]);
    setListEmployees([]);
    setStartTime(new Date(new Date().setHours(0, 0, 0, 0)));
    setEndTime(new Date(new Date().setHours(23, 59, 0, 0)));
    setStartDate(new Date());
    setEndDate(new Date());
  };

  useEffect(() => {
    setDataSearchJournal([]);
    setSelectedRow([]);
    // reset sort
    setCurrentSortColumn(null);
    setIsAscending({
      store_code: true,
      cash_register_code: true,
      transaction_date: true,
      receipt_no: true,
      type: true,
      is_training_mode: true,
      subtotal: true,
    });
    // reset message if not found data when search
    setIsShowData(true);
  }, [selectedStoresBeforeConfirm]);

  const handleSelectAll = () => {
    setDataSearchJournal((prevItems) => prevItems.map((item) => ({ ...item, selected: true })));
    setSelectedRow(
      dataSearchJournal.map((item, index) => {
        return {
          index,
          row: { ...item, selected: true },
        };
      })
    );
    setSelectAll(true);
  };

  const unHandleSelectAll = () => {
    setDataSearchJournal((prevItems) => prevItems.map((item) => ({ ...item, selected: false })));
    setSelectedRow([]);
    setSelectAll(false);
  };

  const updateDateTime = (
    type: 'start-date' | 'end-date' | 'start-time' | 'end-time',
    date?: Date,
    hour?: number,
    min?: number,
    second?: number
  ) => {
    switch (type) {
      case 'start-time': {
        const dateStart = new Date(startTime);
        if (hour !== null) {
          dateStart.setHours(hour, min);
        }
        setStartTime(dateStart);
        setPresetValue({ ...presetValue, business_time_from: getHoursAndMinutes(dateStart) });

        break;
      }
      case 'end-time': {
        const dateEnd = new Date(endTime);
        if (hour !== null) {
          dateEnd.setHours(hour, min);
        }
        setEndTime(dateEnd);
        setPresetValue({ ...presetValue, business_time_to: getHoursAndMinutes(dateEnd) });
        break;
      }
      case 'start-date': {
        const dateStart = new Date(startDate);
        if (date !== null) {
          dateStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        }

        setStartDate(dateStart);
        setPresetValue({ ...presetValue, business_date_from: convertDateServer(startDate) });
        break;
      }
      case 'end-date': {
        const dateEnd = new Date(endDate);
        if (date !== null) {
          dateEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        }
        setEndDate(dateEnd);
        setPresetValue({ ...presetValue, business_date_to: convertDateServer(endDate) });
        break;
      }
      default:
        break;
    }
  };

  // get list cash register code
  const getCashRegisters = () => {
    if (selectedStoresBeforeConfirm && selectedStoresBeforeConfirm?.length > 0) {
      dispatch(getCashRegisterCodeList({ selected_stores: [...selected_stores_reducer] }))
        .unwrap()
        .then((response) => {
          if (response.data) {
            const data = response.data?.data?.items;
            const convertCashRegisterCodeList = data?.map((item) => ({
              name: item.code,
              value: item.code,
            }));

            response.data && convertCashRegisterCodeList && setCashRegisterCodeList([...convertCashRegisterCodeList]);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (selectedStoresBeforeConfirm && selectedStoresBeforeConfirm?.length > 0) {
      dispatch(getListEmployees({ selected_stores: selectedStoresBeforeConfirm }))
        .unwrap()
        .then((response) => {
          if (response.data) {
            const { items } = response.data.data;
            const convertListEmployees = items?.map((item) => ({
              code: item.employee_code,
              value: item.employee_code,
              name: item.employee_name,
            }));
            setListEmployees([...convertListEmployees]);

            // if currently employees doesn't exit in drop down
            const checkExistsEmployee = convertListEmployees.some(
              (employee) => employee.value === presetValue?.employee_code
            );
            if (!checkExistsEmployee) {
              setPresetValue({ ...presetValue, employee_code: '' });
            }
          }
        })
        .catch(() => {});
      getCashRegisters();
    }
  }, [selectedStoresBeforeConfirm]);

  const exportCSV = () => {
    const dataSelected = dataSearchJournal.filter((selectedItem) => selectedItem.selected === true);
    if (dataSelected.length <= 0) {
      return;
    }

    const recordIds = dataSelected.map((item) => item?.record_id);
    dispatch(
      exportBill({
        record_ids: recordIds || [],
        sort_column: currentSortColumn,
        sort_value: currentSortColumn ? (!isAscending[currentSortColumn] ? 'asc' : 'desc') : 'asc',
      })
    )
      .unwrap()
      .then((response) => {
        const { blob } = response;
        const fileName = `ジャーナル検索_${getTimExportCSV()}.csv`;

        saveAs(blob, fileName);
      })
      .catch(() => {});
  };

  const handleSortData = (column) => {
    if (dataSearchJournal.length === 0) return;

    if (column) {
      if (currentSortColumn === column?.keyItem) {
        setIsAscending((prev) => ({
          store_code: true,
          cash_register_code: true,
          transaction_date: true,
          receipt_no: true,
          type: true,
          is_training_mode: true,
          subtotal: true,
          [column.keyItem]: !prev[column.keyItem],
        }));
      } else {
        setCurrentSortColumn(column?.keyItem);
        setIsAscending((prev) => ({
          store_code: true,
          cash_register_code: true,
          transaction_date: true,
          receipt_no: true,
          type: true,
          is_training_mode: true,
          subtotal: true,
          [column.keyItem]: !prev[column.keyItem],
        }));
      }

      // sort by keyItem , keyItem != title
      const fieldSort = column?.keyItem;

      const sortedData = isAscending[column?.keyItem]
        ? _.orderBy(dataSearchJournal, [fieldSort] as any, ['asc'])
        : _.orderBy(dataSearchJournal, [fieldSort] as any, ['desc']);
      setDataSearchJournal(sortedData);
    }
  };

  // handle select by keyboard
  useEffect(() => {
    const handleSelectStore = (event: any) => {
      if (event.key === KEYDOWN.F2) {
        event.preventDefault();
        handleSelectAll();
      } else if (event.key === KEYDOWN.F1) {
        event.preventDefault();
        unHandleSelectAll();
      }
    };

    window.addEventListener('keydown', handleSelectStore);
    return () => {
      window.removeEventListener('keydown', handleSelectStore);
    };
  });

  return (
    <div className="search-journal-container">
      <Header
        title="searchJournal.title"
        csv={{
          disabled: dataSearchJournal && !isHaveItemSelected,
          listTitleTable: [],
          csvData: null,
          fileName: null,
        }}
        printer={{
          disabled: dataSearchJournal && !isHaveItemSelected,
        }}
        exportCSVByApi={true}
        isHiddenCSV={false}
        handleExportSCVByApi={exportCSV}
        printData={dataSearchJournal && dataSearchJournal.filter((item) => item.selected === true)}
        isPrintByReactPdf={true}
        hasESC={true}
      />
      <div className="search-journal-main">
        <SidebarStore
          onClickSearch={handleSearchJournal}
          selectMultiple={true}
          dataSearchChange={dataSearchJournal && dataSearchJournal}
          disabledSearch={false}
          expanded={true}
          clearData={handleClearSearchCondition}
          hasData={dataSearchJournal?.length > 0}
        />
        <div className="search-journal">
          <div className="search-journal-body">
            <div className="body-left">
              <div className="body-left__condition-search">
                <div className="list-condition list-condition-flex">
                  <div className="list-condition-left">
                    <div className="list-condition__type-double">
                      <div className="container-title-input">
                        <div className={`wrap-label-date-picker ${checkDisable ? 'disabled' : 'enable'}`}>
                          <p className="list-condition-title min-width-custom">
                            {translate('searchJournal.searchDate')}
                            <span className="required">*</span>
                          </p>
                          <div className="list-condition__type-double__content__item content-item-date date-time-custom">
                            <DatePickerCustom
                              className={`start-date-custom`}
                              isFormatDate={true}
                              initValue={startDate}
                              fontSize={24}
                              left={'-18px'}
                              widthInput="100%"
                              heightDateTime="100%"
                              onChange={(date: Date) => updateDateTime('start-date', date)}
                              dataTypeDate="input-date-left"
                              isDisable={checkDisable}
                            />
                          </div>
                        </div>
                        <div className="list-condition__type-double__content list-condition__type-double__content-date">
                          <div className="list-condition__type-double__content__item content-item-space">
                            <span>～</span>
                          </div>

                          <div className="list-condition__type-double__content__item content-item-date">
                            <DatePickerCustom
                              className={`end-date-custom`}
                              isFormatDate={true}
                              initValue={endDate}
                              fontSize={24}
                              left={'-10px'}
                              widthInput="100%"
                              heightDateTime="50px"
                              onChange={(date: Date) => updateDateTime('end-date', date)}
                              dataTypeDate="input-date-right"
                              isDisable={checkDisable}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="container-title-input">
                        <div className={`wrap-label-date-picker ${checkDisable ? 'disabled' : 'enable'}`}>
                          <p className="list-condition-title list-condition-title-time min-width-custom">
                            {translate('searchJournal.searchTime')}
                            <span className="required">*</span>
                          </p>
                          <div className="list-condition__type-double__content__item input-timer-picker timer-picker-custom">
                            <TimePickerCustom
                              initValue={startTime}
                              fontSize="24px"
                              width="100px"
                              position={Position.Bottom}
                              timePicked={(hour, min) => updateDateTime('start-time', null, hour, min)}
                              dataTypeTime="time-picker-input-left"
                              disabled={checkDisable}
                            />
                          </div>
                        </div>
                        <div className="list-condition__type-double__content list-condition__type-double__content-time">
                          <div className="list-condition__type-double__content__item content-item-space-time">
                            <span>～</span>
                          </div>
                          <div className="list-condition__type-double__content__item input-timer-picker">
                            <TimePickerCustom
                              height="50px"
                              initValue={endTime}
                              fontSize="24px"
                              width="100px"
                              position={Position.Bottom}
                              timePicked={(hour, min) => updateDateTime('end-time', null, hour, min)}
                              dataTypeTime="time-picker-input-right"
                              disabled={checkDisable}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="wrap-drop-down">
                      <div className="list-condition__type-double list-condition-select">
                        <div className="list-condition__type-double__content">
                          <div className="list-condition__type-double__content__item normal-dropdown cash-dropdown">
                            <Dropdown
                              label={translate('searchJournal.cashRegisterType')}
                              disabled={checkDisable}
                              hasBlankItem={true}
                              value={presetValue?.cash_register_code}
                              items={cashRegisterCodeList}
                              onChange={(item) =>
                                setPresetValue({ ...presetValue, cash_register_code: item?.value as any })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="list-condition__type-double list-condition-select">
                      <div className="list-condition__type-double__content">
                        <div className="list-condition__type-double__content__item normal-dropdown">
                          <Dropdown
                            label={translate('searchJournal.employee')}
                            disabled={checkDisable}
                            hasBlankItem={true}
                            value={presetValue?.employee_code}
                            items={listEmployees && listEmployees}
                            onChange={(item) => setPresetValue({ ...presetValue, employee_code: item?.value as any })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="list-condition-right">
                    <div className="list-condition-toggle">
                      <div className="list-condition-toggle-content list-condition-toggle-content-custom">
                        <div className="list-condition-toggle-item">
                          <InputTextCustom
                            className="input-condition-keyword"
                            labelText={translate('searchJournal.stringOfText1')}
                            widthInput={'100%'}
                            heightInput={'50px'}
                            value={presetValue.keyword_1}
                            maxLength={50}
                            onChange={(e: any) => {
                              setPresetValue({ ...presetValue, keyword_1: e.target.value });
                            }}
                            disabled={checkDisable}
                          />
                        </div>
                        <div className="list-condition-toggle-item">
                          <ListRadioButton
                            name="radio-search-journal"
                            isVertical={false}
                            listValues={dataRadio.map((item) => ({
                              id: item.id,
                              textValue: `${item.textValue}`,
                              disabled: checkDisable,
                            }))}
                            value={presetValue?.condition_type || '0'}
                            onChange={(value, index) => {
                              setPresetValue({
                                ...presetValue,
                                condition_type: value.id as any,
                              });
                            }}
                          />
                        </div>
                        <div className="list-condition-toggle-item">
                          <InputTextCustom
                            className="input-condition-keyword"
                            labelText={translate('searchJournal.stringOfText2')}
                            widthInput={'100%'}
                            heightInput={'50px'}
                            value={presetValue.keyword_2}
                            maxLength={50}
                            onChange={(e: any) => {
                              setPresetValue({ ...presetValue, keyword_2: e.target.value });
                            }}
                            disabled={checkDisable}
                          />
                        </div>
                      </div>

                      <div className="list-condition-toggle-switch">
                        <div className="wrap-button-select-all">
                          <div className="list-condition__type-double">
                            <div className="container-title-input">
                              {/* <p className="list-condition-title"></p> */}
                              <div className="list-condition__type-double__content">
                                <div className="list-condition__type-double__content__item">
                                  <InputTextCustom
                                    labelText={translate('searchJournal.personInCharge')}
                                    className="input-receipt-no"
                                    heightInput="50px"
                                    widthInput="255px"
                                    value={presetValue.receipt_no_from}
                                    maxLength={4}
                                    onChange={(e: any) => {
                                      const inputValue = e.target.value;
                                      const validValue = inputValue.replace(/[^0-9]/g, '');
                                      setPresetValue({ ...presetValue, receipt_no_from: validValue });
                                    }}
                                    type="text"
                                    disabled={checkDisable}
                                  />
                                </div>
                                <div className="list-condition__type-double__content__item content-item-space-time">
                                  <span>～</span>
                                </div>
                                <div className="list-condition__type-double__content__item">
                                  <InputTextCustom
                                    heightInput="50px"
                                    widthInput="100px"
                                    value={presetValue.receipt_no_to}
                                    maxLength={4}
                                    onChange={(e: any) => {
                                      const inputValue = e.target.value;
                                      const validValue = inputValue.replace(/[^0-9]/g, '');
                                      setPresetValue({ ...presetValue, receipt_no_to: validValue });
                                    }}
                                    type="text"
                                    disabled={checkDisable}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <ButtonPrimary
                            heightBtn="50px"
                            text="action.f12Search"
                            onClick={handleSearchJournal}
                            disabled={isNullOrEmpty(selectedStoresBeforeConfirm)}
                          />
                          <ButtonPrimary
                            text="searchJournal.unSelectAll"
                            onClick={unHandleSelectAll}
                            disabled={!isHaveItemSelected || dataSearchJournal.length === 0}
                          />
                          <ButtonPrimary
                            text="searchJournal.selectAll"
                            onClick={handleSelectAll}
                            disabled={selectAll || dataSearchJournal.length === 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="body-left__table">
                <TableSearchJournal<ISearchJournal>
                  disableSelect={false}
                  columns={[
                    {
                      title: 'searchJournal.table.store',
                      keyItem: 'store_code',
                      alignItem: 'right',
                      width: 5,
                    },

                    {
                      title: 'searchJournal.table.cashRegister',
                      keyItem: 'cash_register_code',
                      alignItem: 'right',
                      width: 8,
                    },
                    {
                      title: 'searchJournal.table.date',
                      keyItem: 'transaction_date',
                      alignItem: 'center',
                      width: 18,
                    },
                    {
                      title: 'searchJournal.table.receiptNo',
                      keyItem: 'receipt_no',
                      alignItem: 'right',
                      width: 14,
                    },
                    {
                      title: 'searchJournal.table.type',
                      keyItem: 'receipt_name',
                      alignItem: 'left',
                      width: 17,
                    },
                    {
                      title: 'searchJournal.table.is_training_mode',
                      keyItem: 'is_training_mode',
                      alignItem: 'left',
                      width: 7,
                    },
                    {
                      title: 'searchJournal.table.total',
                      keyItem: 'total',
                      alignItem: 'right',
                      width: 10,
                    },
                  ]}
                  bodyItems={dataSearchJournal}
                  bodyItemChange={(data) => {
                    setDataSearchJournal(data);
                    const selectedRows = data.filter((item) => item?.selected === true);
                    const formattedSelectedRows = selectedRows.map((selectedItem) => {
                      const selectedIndex = data.findIndex((item) => item?.record_id === selectedItem.record_id);
                      return {
                        index: selectedIndex,
                        row: selectedItem,
                      };
                    });
                    setSelectedRow(formattedSelectedRows);
                    // if selectedRows number != length data
                    selectedRows.length !== dataSearchJournal.length ? setSelectAll(false) : setSelectAll(true);
                  }}
                  onSelectRow={(row) => {
                    const isRowSelected = selectedRow.find((item) => item.row?.record_id === row.row?.record_id);
                    // update data for Journal Detail
                    // handle for checkbox
                    if (isRowSelected) {
                      setSelectedRow(selectedRow.filter((item) => item.row?.record_id !== row.row?.record_id));
                      // if selectedRows number != length dataSearchJournal
                      setSelectAll(false);
                    } else {
                      const newSelectedRow = [...selectedRow, row];
                      setSelectedRow(newSelectedRow);
                      // if selectedRows number == length dataSearchJournal
                      newSelectedRow.length === dataSearchJournal.length && setSelectAll(true);
                    }
                    setDataSearchJournal(
                      dataSearchJournal.map((item) =>
                        item?.record_id === row.row?.record_id ? { ...item, selected: !item.selected } : item
                      )
                    );
                  }}
                  selectedRow={selectedRow}
                  canShowNoData={isShowData}
                  handleSortData={handleSortData}
                  currentSortColumn={currentSortColumn}
                  isAscending={isAscending}
                />
              </div>
            </div>
            <div className="detail-journal">{<JournalList journals={dataSearchJournal && dataSearchJournal} />}</div>
          </div>
        </div>
      </div>
      <div className="search-journal-footer">
        <BottomButton leftPosition="455px" />
      </div>
    </div>
  );
};
export default SearchJournal;
