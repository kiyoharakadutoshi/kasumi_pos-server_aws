/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import React, { useState, useRef, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { translate } from 'react-jhipster';
import { useNavigate, useNavigationType } from 'react-router';
import { Row } from '@tanstack/react-table';
import { useAppDispatch, useAppSelector } from '@/config/store';
import _ from 'lodash';
import { subDays } from 'date-fns';
import { URL_MAPPING } from '@/router/url-mapping';

// Component
import Header from '@/components/header/header';
import BottomButton from '@/components/bottom-button/bottom-button';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import RegisterSettlementModal from '@/modules/register-settlement/register-settlement-modal';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';

// API
import {
  getBusinessDate,
  getDisplayInfo,
  getRegisterStatus,
  getValueCashierMachine,
} from '@/services/register-settlement-service';

// Utils
import { formatNumberWithCommas } from '@/helpers/number-utils';
import { IRegisterSettlement } from '@/modules/register-settlement/register-settlement-interface';
import { isNullOrEmpty } from '@/helpers/utils';
import { focusFirstInput } from '@/helpers/utils-element-html';
import { convertDateServer, toDateString } from '@/helpers/date-utils';

// CONSTANTS
import { SERVER_DATE_FORMAT_COMPACT } from '@/constants/date-constants';
import { USER_ROLE } from '@/constants/constants';
import { closeStatusRegister, registerDefaultData, statusRegister } from './register-default-data';

// REDUX
import { handleUpdateOpenBusinessDay } from '@/reducers/register-settlement-reducer';

// STYLES
import './register-settlement.scss';

const DATE_OFFSET = {
  ADMIN: 61,
  USER: 2,
};

const RegisterSettlement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const formRef = useRef<HTMLDivElement>(null);
  const listStore = useAppSelector((state) => state.storeReducer.stores);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores);
  const userRole = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const openBusinessDayDetailPage = useAppSelector(
    (state) => state.registerSettlementReducer.openBusinessDayDetailPage
  );
  const formConfig = useForm({ defaultValues: registerDefaultData });
  const { getValues, watch, reset, setValue } = formConfig;
  const isFirstRender = watch('isFirstRender');
  const listRegisterData = watch('listData');
  const [openModal, setOpenModal] = useState(false);
  const dateOffsetByRole = userRole === USER_ROLE.ADMIN ? DATE_OFFSET.ADMIN : DATE_OFFSET.USER;
  const [minDate, setMinDate] = useState(subDays(new Date(), dateOffsetByRole));
  const [maxDate, setMaxDate] = useState(new Date());
  const [dateForPrint, setdateForPrint] = useState('');
  const [fieldNameDetail, setFieldNameDetail] = useState(null); // all title name for register detail page

  const columns = React.useMemo<TableColumnDef<IRegisterSettlement>[]>(
    () => [
      {
        accessorKey: 'cash_register_code',
        header: 'register-settlement.cash_register',
        size: 40,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const cashRegisterCode = props?.row?.original?.cash_register_code;
          const cashRegisterName = props?.row?.original?.cash_register_name;
          if (cashRegisterName) {
            return {
              value: `${cashRegisterCode}:${cashRegisterName}`,
            };
          }
          return { value: `${cashRegisterCode}` };
        },
      },
      {
        accessorKey: 'cash_register_status',
        header: 'register-settlement.status',
        size: 15,
        type: 'text',
        textAlign: 'center',
        option(props) {
          const cashRegisterStatus = props?.row?.original?.cash_register_status || 1;
          return {
            value: statusRegister[cashRegisterStatus],
          };
        },
      },
      {
        accessorKey: 'close_status',
        header: 'register-settlement.checkout_status',
        type: 'text',
        size: 15,
        textAlign: 'center',
        option(props) {
          const closeStatusValue = props?.row?.original?.close_status || 1;
          return {
            value: closeStatusRegister[closeStatusValue],
          };
        },
      },
      {
        accessorKey: 'current_cash',
        header: 'register-settlement.cash_on_hand_at_checkout',
        size: 15,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const currentCash = props?.row?.original?.current_cash;
          return {
            value: formatNumberWithCommas(currentCash),
          };
        },
      },
      {
        accessorKey: 'settlement_entry',
        header: 'register-settlement.checkout_entry',
        size: 15,
        type: 'button',
        option(info) {
          return { disabled: info.row.original.cash_register_status === 1 };
        },
        buttonInput: {
          onClick(row) {
            const cashRegisterCode = row?.cash_register_code;
            const cashRegisterName = row?.cash_register_name;
            handleClickButtonIntoTable(cashRegisterCode, cashRegisterName);
          },
          name: 'register-settlement.buttonAction',
        },
      },
    ],
    [fieldNameDetail, openBusinessDayDetailPage]
  );

  const addClassNameRow = (row: Row<IRegisterSettlement>) => {
    const statusClassMap: Record<number, string> = {
      1: 'proceed',
      2: 'completed',
      3: 'auto-settled',
    };
    return { className: statusClassMap[row?.original?.cash_register_status || 1] ?? '' };
  };

  const handleClickButtonIntoTable = (cashRegisterCode: string, cashRegisterName: string) => {
    dispatch(
      getValueCashierMachine({
        selected_store: selectedStores[0],
        business_date: toDateString(new Date(openBusinessDayDetailPage), SERVER_DATE_FORMAT_COMPACT),
        cash_register_code: cashRegisterCode,
      })
    )
      .unwrap()
      .then((res) => {
        return res.data.data;
      })
      .then((data) => {
        const storeName = listStore?.find((item) => item?.store_code === selectedStores[0])?.store_name;
        navigate(`/${URL_MAPPING.SC2002}`, {
          state: {
            fieldNameDetail,
            newValueDetail: data?.closed_info_new,
            oldValueDetail: data?.closed_info_old,
            openBusinessDayDetailPage,
            cashRegisterName: cashRegisterName ? `${cashRegisterCode}:${cashRegisterName}` : `${cashRegisterCode}`,
            cashRegisterCode: `${cashRegisterCode}`,
            selectedStore: `${selectedStores[0]}`,
            storeName,
          },
        });
      })
      .catch(() => {});
  };

  const handleSearch = (newStore?: string[], openDate?: string) => {
    // Validate
    const businessOpenDate = openDate ? openDate : _.toString(watch('businessOpenDate'));
    if (!businessOpenDate || businessOpenDate === 'Invalid Date') {
      return;
    }

    dispatch(
      getRegisterStatus({
        selected_store: newStore?.length > 0 ? newStore?.[0] : selectedStores[0],
        business_date: toDateString(new Date(businessOpenDate), SERVER_DATE_FORMAT_COMPACT),
      })
    )
      .unwrap()
      .then((res) => {
        setValue('listData', res?.data.data?.items || [[]]);
      })
      .then(() => {
        // Update open business day for detail page
        dispatch(handleUpdateOpenBusinessDay(businessOpenDate));
      })

      .catch(() => {});
  };

  const handleClickConfirmStore = (checkedStores) => {
    // Reset data before get new data
    reset();
    if (!isFirstRender) {
      handleGetOpenBusiness(checkedStores);
      handleGetDisplayInfo(checkedStores);
    }
    // reset openBusinessDayDetailPage
    dispatch(handleUpdateOpenBusinessDay(null));
  };

  const handlePrint = () => {
    setOpenModal(true);
  };

  const handleGetOpenBusiness = async (checkedStores) => {
    if (isNullOrEmpty(checkedStores)) return null;
    try {
      const res = await dispatch(getBusinessDate({ selected_store: checkedStores })).unwrap();
      const resBusinessOpenDate = res.data.data.business_open_date;
      // Update open business
      if (resBusinessOpenDate) {
        setValue('businessOpenDate', `20${resBusinessOpenDate}`);
        setMinDate(subDays(new Date(watch('businessOpenDate')), dateOffsetByRole));
        setMaxDate(new Date(watch('businessOpenDate')));
        // Date when click print
        setdateForPrint(`20${resBusinessOpenDate}`);
      } else {
        setMinDate(subDays(new Date(), dateOffsetByRole));
        setMaxDate(new Date());
        // Date when click print
        setdateForPrint(convertDateServer(new Date()));
      }
      // Update first call api and return business date
      setValue('isFirstRender', false);
      return resBusinessOpenDate ? `20${resBusinessOpenDate}` : null;
    } catch (error) {
      return null;
    }
  };

  // Get text title for SC2002
  const handleGetDisplayInfo = (checkedStores) => {
    dispatch(getDisplayInfo({ selected_store: checkedStores }))
      .unwrap()
      .then((res) => {
        setFieldNameDetail(res.data.data);
      })
      .catch(() => {});
  };

  // Focus first input
  const focusInput = (isExpand: boolean, _isDirty: boolean, store: string[]) => {
    if (!isExpand) {
      setTimeout(() => {
        focusFirstInput(formRef);
      }, 350);
    }

    if (isFirstRender && !isExpand) {
      handleGetOpenBusiness(store);
      handleGetDisplayInfo(store);
    }
  };

  // Focus first input when  back from detail page
  useEffect(() => {
    // Case for role admin
    if (listRegisterData?.length > 0 && navigationType === 'POP') {
      setTimeout(() => {
        focusFirstInput(formRef);
      }, 350);
    }
    // Case for role user
    if (userRole !== USER_ROLE.ADMIN) {
      setTimeout(() => {
        focusFirstInput(formRef);
      }, 350);
    }
  }, [listRegisterData]);

  // Handle call search when role == user ( auto call because does not have multi store)
  useEffect(() => {
    const handleUpdateRangeDateRoleUser = async () => {
      await handleGetOpenBusiness(selectedStores);
      openBusinessDayDetailPage && setValue('businessOpenDate', openBusinessDayDetailPage);
    };
    if (userRole !== USER_ROLE.ADMIN && !isNullOrEmpty(selectedStores)) {
      handleUpdateRangeDateRoleUser();
      handleGetDisplayInfo(selectedStores);

      if (openBusinessDayDetailPage) {
        // Refresh get list data for case role = user when save or click back from detail page
        handleSearch(selectedStores, openBusinessDayDetailPage);
      }
    }
  }, [selectedStores]);

  // Handle event click back and save data from detail page
  useEffect(() => {
    const handleUpdateRangeDate = async () => {
      await handleGetOpenBusiness(selectedStores);
      setValue('businessOpenDate', openBusinessDayDetailPage);
    };

    if (openBusinessDayDetailPage && !isNullOrEmpty(selectedStores) && userRole === USER_ROLE.ADMIN) {
      // Need condition userRole === USER_ROLE.ADMIN because duplicate call api when role = user
      handleSearch(selectedStores, openBusinessDayDetailPage);
      handleGetDisplayInfo(selectedStores);
      handleUpdateRangeDate(); // Need call api to set min and max date
      setValue('businessOpenDate', openBusinessDayDetailPage);
      setValue('isFirstRender', false);
    }
  }, [selectedStores]);

  return (
    <FormProvider {...formConfig}>
      <div className={'register-settlement'}>
        <Header
          hasESC={true}
          title={translate('register-settlement.title')}
          csv={{ disabled: true }}
          hiddenTextESC={true}
          printer={{ disabled: false, action: handlePrint }}
        />

        {openModal && (
          <RegisterSettlementModal
            businessOpenDate={dateForPrint}
            dateOffsetByRole={dateOffsetByRole}
            selectedStores={selectedStores}
            setOpenModal={setOpenModal}
          />
        )}

        <SidebarStore
          onClickSearch={() => {}}
          expanded={true}
          onChangeCollapseExpand={focusInput}
          actionConfirm={(checkedStores) => {
            handleClickConfirmStore(checkedStores);
          }}
          clearData={() => handleClickConfirmStore}
          hasData={listRegisterData?.length > 0}
        />
        <div className="register-settlement__main">
          <div className="register-settlement__search" ref={formRef}>
            <TooltipDatePickerControl
              labelText={'register-settlement.correction_date'}
              isShortDate={true}
              inputClassName="date-time-start-end__start-date"
              keyError={'register-settlement.correction_date'}
              checkEmpty={true}
              errorPlacement={'bottom'}
              minDate={minDate}
              maxDate={maxDate}
              name={'businessOpenDate'}
              isValidateByRangeDays
            />
            <FuncKeyDirtyCheckButton
              text="action.f12Search"
              funcKey={'F12'}
              funcKeyListener={selectedStores}
              onClickAction={handleSearch}
            />
          </div>
          <div className="register-settlement__list">
            <TableData<IRegisterSettlement>
              columns={columns}
              data={listRegisterData || []}
              enableSelectRow={false}
              rowConfig={addClassNameRow}
              showNoData={listRegisterData?.length === 0}
            />
          </div>
        </div>
        <BottomButton />
      </div>
    </FormProvider>
  );
};

export default RegisterSettlement;
