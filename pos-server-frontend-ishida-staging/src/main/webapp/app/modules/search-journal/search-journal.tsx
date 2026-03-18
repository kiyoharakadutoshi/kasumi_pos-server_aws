import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import { FormProvider, Resolver, useForm } from 'react-hook-form';

// COMPONENTS
import Header from 'app/components/header/header';
import TableSearchJournal from 'app/modules/search-journal/search-journal-table';
import BottomButton from 'app/components/bottom-button/bottom-button';
import JournalList from './journal-list';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';
import SelectControl from '@/components/control-form/select-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import RadioControl from '@/components/control-form/radio-control';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';

// INTERFACE
import {
  IsAscendingType,
  ISearchJournal,
  SearchJournalFormInterface,
} from 'app/modules/search-journal/search-journal-interface';

// REDUX
import { IStoreSate } from 'app/reducers/store-reducer';

// CONSTANTS
import { KEYDOWN } from '@/constants/constants';
import { CONDITION_TYPE, DEFAULT_SEARCH_JOURNAL, MASTER_CODE, SORT_DEFAULT } from './constant/default-data';

// API
import { getCashRegisterCodeList } from 'app/services/setting-master-service';
import { exportBill, getListEmployees, searchJournals } from 'app/services/search-journal-service';
import { getMasters } from '@/services/master-service';

// UTILS
import { compareDate, getTimExportCSV } from 'app/helpers/date-utils';
import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { focusFirstInput } from '@/helpers/utils-element-html';

// STYLES
import './search-journal.scss';

const SearchJournal = () => {
  const dispatch = useAppDispatch();
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const selected_stores_reducer = storeReducer?.stores
    ?.filter((store) => store.selected)
    .map((store) => store.store_code);
  const selectedStoresBeforeConfirm = storeReducer.selectedStores;
  const [selectAll, setSelectAll] = useState(false);
  const [dataSearchJournal, setDataSearchJournal] = useState<ISearchJournal[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [isShowData, setIsShowData] = useState(true);
  const [currentSortColumn, setCurrentSortColumn] = useState(null);
  const isHaveItemSelected = dataSearchJournal.some((item) => item.selected);
  const [isAscending, setIsAscending] = useState<IsAscendingType>(SORT_DEFAULT);
  const formRef = useRef<HTMLDivElement>(null);

  /**
   * Create schema for validation of search condition form
   */
  const validationSchema = object<SearchJournalFormInterface>().shape({
    searchCondition: object().shape({
      business_date_from: string()
        .required()
        .test('is-validate-date', localizeFormat('MSG_VAL_049'), (value) => {
          const businessDateFrom = dayjs(value, 'YYYY/MM/DD').format('MM/DD/YYYY');

          if (compareDate(businessDateFrom) === 1 || value === 'Invalid Date' || !value) return false;
          return true;
        }),
      business_date_to: string()
        .required()
        .test('is-validate-date', localizeFormat('MSG_VAL_049'), (value) => {
          const businessDateTo = dayjs(value, 'YYYY/MM/DD').format('MM/DD/YYYY');
          if (compareDate(businessDateTo) === 1 || value === 'Invalid Date' || !value) return false;
          return true;
        })
        .test(
          'compare-date',
          localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.dateFrom', 'searchJournal.msgVal.dateTo'),
          function (value) {
            const { business_date_from } = this.parent;
            if (compareDate(value, business_date_from) === -1) return false;
            return true;
          }
        ),
      business_time_from: string()
        .required()
        .test('is-validate-time', localizeFormat('MSG_VAL_016', 'searchJournal.searchTime'), function (value) {
          if (value === 'Invalid Time' || !value) return false;
          return true;
        }),
      business_time_to: string()
        .required()
        .test('is-validate-time', localizeFormat('MSG_VAL_016', 'searchJournal.searchTime'), function (value) {
          if (value === 'Invalid Time' || !value) return false;
          return true;
        })
        .test(
          'is-future-date',
          localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.timeFrom', 'searchJournal.msgVal.timeTo'),
          function (value) {
            const { business_time_from } = this.parent;
            const businessTimeFrom = dayjs(business_time_from, 'HH:mm');
            const businessTimeTo = dayjs(value, 'HH:mm');

            if (businessTimeFrom.isAfter(businessTimeTo)) {
              return false;
            }
            return true;
          }
        ),
      receipt_no_to: string()
        .nullable()
        .test(
          'valid-receipt-no',
          localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.receiptFrom', 'searchJournal.msgVal.receiptTo'),
          function (value) {
            const { receipt_no_from } = this.parent;
            if (Number(receipt_no_from) > Number(value) && receipt_no_from && value) {
              return false;
            }
            return true;
          }
        ),
    }),
  });

  // Initialize form configuration using react-hook-form
  const formConfig = useForm({
    defaultValues: DEFAULT_SEARCH_JOURNAL,
    resolver: yupResolver(validationSchema) as unknown as Resolver<SearchJournalFormInterface>,
    mode: 'onBlur',
  });

  const {
    watch,
    setValue,
    getValues,
    trigger,
    formState: { isValid },
  } = formConfig;

  // Focus first input
  const focusInput = () => {
    setTimeout(() => {
      focusFirstInput(formRef);
    }, 350);
  };

  // Handle search when click button
  const handleSearchJournal = () => {
    if (!isValid) return;

    const searCondition = getValues('searchCondition');
    // handle param
    const param = {
      selected_stores: [...selected_stores_reducer],
      business_date_from: searCondition.business_date_from || '',
      business_date_to: searCondition.business_date_to || '',
      business_time_from: searCondition.business_time_from || '00:00',
      business_time_to: searCondition.business_time_to || '23:59',
      condition_type: searCondition.condition_type || 0,
      cash_register_code: searCondition.cash_register_code || '',
      employee_code: searCondition.employee_code || '',
      keyword_1: searCondition.keyword_1 || '',
      keyword_2: searCondition.keyword_2 || '',
      receipt_no_from: searCondition.receipt_no_from || '',
      receipt_no_to: searCondition.receipt_no_to || '',
      receipt_name: searCondition.receipt_name || '',
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
          setIsAscending(SORT_DEFAULT);
        }
      })
      .catch(() => {});
  };

  const handleClearSearchCondition = () => {
    //  reset condition search
    setValue('searchCondition', DEFAULT_SEARCH_JOURNAL.searchCondition);
  };

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
          ...SORT_DEFAULT,
          [column.keyItem]: !prev[column.keyItem],
        }));
      } else {
        setCurrentSortColumn(column?.keyItem);
        setIsAscending((prev) => ({
          ...SORT_DEFAULT,
          [column.keyItem]: !prev[column.keyItem],
        }));
      }

      // sort by keyItem , keyItem != title
      const fieldSort = column?.keyItem;
      const sortedData = _.orderBy(
        dataSearchJournal,
        [
          (item) => {
            const value = item[fieldSort];
            if (fieldSort === 'total') {
              if (!value) {
                return -Infinity;
              }
              const cleaned = value.replace(/[￥,]/g, '');
              return Number(cleaned);
            }
            return value || -Infinity;
          },
          (item) => item.record_id,
        ],
        [isAscending[column?.keyItem] ? 'asc' : 'desc']
      );

      setDataSearchJournal(sortedData);
    }
  };

  // Handle select by keyboard
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

  // Get list cash register code
  useEffect(() => {
    const getCashRegisters = () => {
      dispatch(getCashRegisterCodeList({ selected_stores: [...selected_stores_reducer] }))
        .unwrap()
        .then((response) => {
          if (response.data) {
            const data = response.data?.data?.items;
            const convertCashRegisterCodeList = data?.map((item) => ({
              name: item.code,
              value: item.code,
            }));
            convertCashRegisterCodeList && setValue('listCashRegisterCode', [...convertCashRegisterCodeList]);
          }
        })
        .catch(() => {});
    };

    if (selectedStoresBeforeConfirm?.length > 0) {
      getCashRegisters();
    }
  }, [selectedStoresBeforeConfirm]);

  // Get list employees
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
            setValue('listEmployees', convertListEmployees);
          }
        })
        .catch(() => {});
    }
  }, [selectedStoresBeforeConfirm]);

  // Get list receipt name
  useEffect(() => {
    if (selectedStoresBeforeConfirm && selectedStoresBeforeConfirm?.length > 0) {
      dispatch(getMasters({ master_code: [MASTER_CODE] }))
        .unwrap()
        .then((res) => {
          const data = res?.data?.data;
          if (data) {
            const listReceiptNameResponse = data.flatMap((entry) =>
              entry?.items?.map((item) => ({
                code: item.event_group_name,
                name: item.event_group_name,
                value: item.event_group_name,
              }))
            );
            setValue('listReceiptName', listReceiptNameResponse);
          }
        })
        .catch(() => {});
    }
  }, [selectedStoresBeforeConfirm]);

  // Handle disable search condition
  useEffect(() => {
    if (selectedStoresBeforeConfirm?.length === 0) {
      setValue('checkDisable', true);
    } else {
      setValue('checkDisable', false);
    }
  }, [selectedStoresBeforeConfirm]);

  // Trigger validation search condition fields when they change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'searchCondition.business_date_from') {
        trigger('searchCondition.business_date_to');
      }

      if (name === 'searchCondition.business_time_from') {
        trigger('searchCondition.business_time_to');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('searchCondition')]);

  // Trigger receipt no to when change receipt no from
  const handleTriggerReceiptNoFrom = () => {
    trigger('searchCondition.receipt_no_to');
  };

  // Reset data when change selected stores
  useEffect(() => {
    setDataSearchJournal([]);
    setSelectedRow([]);
    // reset sort
    setCurrentSortColumn(null);
    setIsAscending(SORT_DEFAULT);
    // reset message if not found data when search
    setIsShowData(true);
    //  reset condition search
    handleClearSearchCondition();
  }, [selectedStoresBeforeConfirm]);

  return (
    <FormProvider {...formConfig}>
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
          confirmBack={dataSearchJournal?.length > 0}
        />
        <div className="search-journal-main">
          {/* Side bar */}
          <SidebarStore
            onClickSearch={handleSearchJournal}
            selectMultiple={true}
            dataSearchChange={dataSearchJournal && dataSearchJournal}
            disabledSearch={false}
            expanded={true}
            clearData={handleClearSearchCondition}
            onChangeCollapseExpand={focusInput}
            hasData={dataSearchJournal?.length > 0}
          />
          {/* Search condition */}
          <div className="search-journal">
            <div className="search-journal-body">
              <div className="body-left">
                <div className="body-left__condition-search">
                  <div className="list-condition">
                    <div className="list-condition--left">
                      <div className="wrap-date-time-picker" ref={formRef}>
                        <TooltipDatePickerControl
                          required={true}
                          name={'searchCondition.business_date_from'}
                          labelText="searchJournal.searchDate"
                          disabled={watch('checkDisable')}
                          checkEmpty={true}
                          keyError={'searchJournal.msgVal.dateFrom'}
                          errorPlacement="right"
                          maxDate={new Date()}
                          messageError={localizeFormat('MSG_VAL_049')}
                        />
                        <span>～</span>
                        <TooltipDatePickerControl
                          required={true}
                          name={'searchCondition.business_date_to'}
                          disabled={watch('checkDisable')}
                          checkEmpty={true}
                          keyError={'searchJournal.msgVal.dateTo'}
                          errorPlacement="right"
                          maxDate={new Date()}
                          messageError={localizeFormat('MSG_VAL_049')}
                        />
                      </div>
                      <div className="wrap-date-time-picker">
                        <TooltipTimePickerControl
                          disabled={watch('checkDisable')}
                          labelText="searchJournal.searchTime"
                          name={`searchCondition.business_time_from`}
                          required
                          checkEmpty
                          keyError="searchJournal.msgVal.timeFrom"
                          timePlacement="bottom"
                          errorPlacement="right"
                          isPopover
                        />

                        <span>～</span>
                        <TooltipTimePickerControl
                          disabled={watch('checkDisable')}
                          name={`searchCondition.business_time_to`}
                          required
                          checkEmpty
                          keyError="searchJournal.msgVal.timeTo"
                          timePlacement="bottom"
                          errorPlacement="right"
                          isPopover
                        />
                      </div>

                      <SelectControl
                        className="cash-register-code-select"
                        name={'searchCondition.cash_register_code'}
                        label="searchJournal.cashRegisterType"
                        items={watch('listCashRegisterCode') ?? []}
                        hasBlankItem
                        disabled={watch('checkDisable')}
                      />

                      <div className="wrap-receipt-no">
                        <TooltipNumberInputTextControl
                          name="searchCondition.receipt_no_from"
                          label={'searchJournal.personInCharge'}
                          maxLength={4}
                          disabled={watch('checkDisable')}
                          focusOut={handleTriggerReceiptNoFrom}
                        />
                        <span>～</span>
                        <TooltipNumberInputTextControl
                          name="searchCondition.receipt_no_to"
                          maxLength={4}
                          disabled={watch('checkDisable')}
                        />
                      </div>
                    </div>
                    <div className="list-condition--right">
                      <div className="wrap-input-key-word">
                        <TooltipInputTextControl
                          name="searchCondition.keyword_1"
                          title={'searchJournal.stringOfText1'}
                          maxLength={50}
                          hasTrimSpace
                          disabled={watch('checkDisable')}
                        />
                        <TooltipInputTextControl
                          name="searchCondition.keyword_2"
                          maxLength={50}
                          hasTrimSpace
                          disabled={watch('checkDisable')}
                        />
                      </div>
                      <RadioControl
                        name={`searchCondition.condition_type`}
                        value={watch('searchCondition.condition_type') ?? 0}
                        listValues={CONDITION_TYPE.map((item) => ({
                          id: item.id,
                          textValue: `${item.textValue}`,
                          disabled: watch('checkDisable'),
                        }))}
                      />

                      <SelectControl
                        className="employee-code-select"
                        name={'searchCondition.receipt_name'}
                        label="searchJournal.table.type"
                        items={watch('listReceiptName') ?? []}
                        isHiddenCode
                        hasBlankItem
                        disabled={watch('checkDisable')}
                      />

                      <div className="container-input-and-button">
                        <SelectControl
                          className="employee-code-select"
                          name={'searchCondition.employee_code'}
                          label="searchJournal.employee"
                          items={watch('listEmployees') ?? []}
                          hasBlankItem
                          disabled={watch('checkDisable')}
                        />
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
    </FormProvider>
  );
};
export default SearchJournal;
