import { yupResolver } from '@hookform/resolvers/yup';
import React, { ReactElement, useMemo, useRef, useState } from 'react';
import { FormProvider, Resolver, useForm } from 'react-hook-form';

// Component imports
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData from '@/components/table/table-data/table-data';

// Redux hooks
import { useAppDispatch, useAppSelector } from '@/config/store';

// Utility functions
import { convertKeys, snakeToCamel } from '@/helpers/convert-key';
import { isNullOrEmpty } from '@/helpers/utils';

// Styles
import { getFocusableElements } from '@/helpers/utils-element-html';
import { Row } from '@tanstack/react-table';
import { ExtendedCSSProperties } from 'app/components/table/table-data/interface-table';
import { focusElementByNameWithTimeOut, isValidDate } from 'app/helpers/utils';
import { object, string } from 'yup';
import CashRegisterModal from './cash-register-detail-modal/sc7301-cash-register-status-modal';
import './sc7301-cash-register-status.scss';

// Service functions
import {
  detailCashRegisterStatusType,
  FormData,
  itemCashRegisterStatusType,
} from '@/modules/sc7301-cash-register-status-reference/CashRegisterDataType';
import { DEFAULT_VALUE } from '@/modules/sc7301-cash-register-status-reference/constant';
import SearchCashRegister from '@/modules/sc7301-cash-register-status-reference/SearchCashRegister';
import useTableColumn from '@/modules/sc7301-cash-register-status-reference/useTableColumn';
import {
  detailCashRegisterResponse,
  exportCashRegisterCSV,
  getDetailCashRegister,
  getListCashRegisterStatus,
} from '@/services/cash-register-status';
import { PINK_FFDBF9, RED_ff6666, YELLOW_FEFBBB } from 'app/constants/color';
import { fullDateToSortDate } from 'app/helpers/date-utils';
import { AxiosResponse } from 'axios';
import { saveAs } from 'file-saver';


/**
 * SC7301: Cash Register Status Reference Component
 *
 * @returns {ReactElement} The page for cash register status reference
 */
const CashRegisterStatusReference = (): ReactElement => {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.locale.currentLocale);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const disabledSearch = isNullOrEmpty(selectedStores);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [detailCashRegisterStatus, setDetailCashRegisterStatus] = useState<detailCashRegisterStatusType | null>(null);
  const divCommonRef = useRef(null);
  const { columns } = useTableColumn();

  // Validation schema for the form
  const validationSchema = object<FormData>().shape({
    'productInfo.productName': string().required('MSG_VAL_001'),
    'productInfo.department': string().required('MSG_VAL_001'),
    'productInfo.productGroup': string().required('MSG_VAL_001'),
    'productInfo.type': string().required('MSG_VAL_001'),
    'productInfo.standardSellingPrice': string().required('MSG_VAL_001'),
    'productInfo.memberPrice': string().required('MSG_VAL_001'),
    'productInfo.taxTypeCode': string().required('MSG_VAL_001'),
  });

  // Form configuration
  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
    resolver: yupResolver(validationSchema) as unknown as Resolver,
  });

  const { getValues, setValue, watch, reset } = formConfig;

  // Determine if the detail button should be disabled
  const disabledDetail = useMemo(() => {
    return isNullOrEmpty(getValues('selectedRows'));
  }, [watch('selectedRows')?.length]);

  // Get the list data from the form values
  const listData: itemCashRegisterStatusType[] = useMemo(() => {
    return getValues('dataTable') ?? [];
  }, [watch('dataTable')]);

  // Change background color based on row and cell data
  const changeBackgroundColor = (row: Row<itemCashRegisterStatusType>): ExtendedCSSProperties => {
    const calcBackground = {
      1: PINK_FFDBF9,
      0: YELLOW_FEFBBB,
      2: RED_ff6666,
    };

    return {
      columnName: 'dataMasterStatusAndApplyMasterTime',
      backgroundColor: calcBackground[row.original.dataMasterStatus] ?? '',
    };
  };

  // Handle viewing cash register detail
  const handleViewCashRegisterDetail = () => {
    const getRowSelected = getValues('selectedRows');
    const { storeCode, cashRegisterCode } = getRowSelected[0].original;

    const payload = {
      selected_store: storeCode,
      business_date: fullDateToSortDate(getValues('businessDate')),
      cash_register_code: cashRegisterCode,
    };
    dispatch(getDetailCashRegister(payload))
      .unwrap()
      .then((response: AxiosResponse<detailCashRegisterResponse>) => {
        const dataTable = response.data;
        const convertCamelCaseObject = convertKeys(dataTable, snakeToCamel)?.data as detailCashRegisterStatusType;
        setDetailCashRegisterStatus(convertCamelCaseObject);
        setIsShowModal(true);
      })
      .catch(() => {});
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsShowModal(false);
  };

  // Focus the first element in the form
  const focusFirstElement = (isExpand?: boolean, isDirty?: boolean) => {
    if (isExpand || isDirty) return;
    const element = getFocusableElements(divCommonRef.current) as unknown as HTMLElement[];
    element?.[0]?.focus();
  };

  // Handle searching cash register
  const handleSearchCashRegister = () => {
    const { businessDate, cashRegisterType, dataMasterStatus, cashRegisterStatus, failureStatus } = getValues();

    if (!isValidDate(businessDate)) {
      return;
    }

    // Reset select row when search
    setValue('selectedRows', null);

    const payload = {
      selected_stores: selectedStores,
      business_date: fullDateToSortDate(businessDate),
      cash_register_type: cashRegisterType,
      data_master_status: dataMasterStatus,
      cash_register_status: cashRegisterStatus,
      failure_status: failureStatus,
    };

    dispatch(getListCashRegisterStatus(payload))
      .unwrap()
      .then((response) => {
        const dataTable = response.data?.data?.items;
        const convertCamelCaseObject = convertKeys(dataTable, snakeToCamel);
        setValue('dataTable', convertCamelCaseObject);
        setValue('showNoData', isNullOrEmpty(dataTable));
      })
      .catch(() => setValue('showNoData', true));
  };

  // Handle exporting CSV
  const handleExportCSV = () => {
    const { businessDate, cashRegisterType, cashRegisterStatus, dataMasterStatus, failureStatus } = getValues();

    const cashRegisterCSVParams = {
      selected_stores: selectedStores,
      business_date: fullDateToSortDate(businessDate),
      cash_register_type: cashRegisterType,
      data_master_status: dataMasterStatus,
      cash_register_status: cashRegisterStatus,
      failure_status: failureStatus,
      lang: locale,
    };

    dispatch(exportCashRegisterCSV(cashRegisterCSVParams))
      .unwrap()
      .then((response) => {
        const fileName = `レジ状況照会_${cashRegisterCSVParams.business_date?.replace(/\//g, '')}.csv`;
        saveAs(response.blob, fileName);
      })
      .catch(() => {});
  };

  const actionConfirmStore = () => {
    reset();
    focusElementByNameWithTimeOut('businessDate', 350);
  }

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <Header
        title="レジ状況照会"
        exportCSVByApi
        handleExportSCVByApi={handleExportCSV}
        csv={{
          disabled: disabledSearch,
        }}
        hasESC={true}
        printer={{
          disabled: true,
        }}
      />

      <SidebarStore
        expanded={true}
        onChangeCollapseExpand={focusFirstElement}
        selectMultiple
        hasData={listData?.length > 0}
        actionConfirm={actionConfirmStore}
      />

      <FormProvider {...formConfig}>
        <main className="main-container cash-register-status-reference">
          <CashRegisterModal
            closeModal={handleCloseModal}
            showModal={isShowModal}
            detailCashRegisterStatus={detailCashRegisterStatus}
          />

          <SearchCashRegister
            divCommonRef={divCommonRef}
            handleSearchCashRegister={handleSearchCashRegister}
            handleViewCashRegisterDetail={handleViewCashRegisterDetail}
            disabledSearch={disabledSearch}
            disabledDetail={disabledDetail}
          />

          <div className="cash-register-status-reference__list">
            <TableData<itemCashRegisterStatusType>
              columns={columns}
              showNoData={watch('showNoData')}
              data={listData}
              tableKey="column1"
              changeStyleByRow={changeBackgroundColor}
              rowConfig={(info) => ({
                className:
                  info?.original.failureStatus === 1
                    ? 'cash-register-status-reference__row-error'
                    : 'cash-register-status-reference__row-non',
              })}
              onDoubleClick={handleViewCashRegisterDetail}
            />
          </div>
        </main>
      </FormProvider>
    </div>
  );
};

export default CashRegisterStatusReference;
