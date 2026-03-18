import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { getDate } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/config/store';

import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import SelectControl from '@/components/control-form/select-control';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';

// Data dummy
import {
  convertToMasterSettingsBusiness,
  SETTING_MONTH,
  mapDayOfWeekNameToNumber,
} from './helper/masterSettingsBusinessUtils';

// Component
import CompareForm from '@/components/compare-form/compare-form';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';

// Utils
import { KEYDOWN, USER_ROLE, YEAR_LENGTH } from '@/constants/constants';
import { isNullOrEmpty, localizeString, focusElementByName } from '@/helpers/utils';
import {
  IMasterSettingsBusiness,
  MasterSettingsBusinessInterface,
  keyIMasterSettingsBusiness,
} from './helper/interface';
import { getFocusableElements, handleFocusListElement } from '@/helpers/utils-element-html';

// Service
import { getMasters } from '@/services/master-service';
import { getStoreSchedules, maintenanceStoreSchedules } from '@/services/store-schedules-service';

// Styles
import './styles.scss';
import BottomButton from '@/components/bottom-button/bottom-button';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { UserDetail } from '@/reducers/user-login-reducer';

const DEFAULT_VALUES: MasterSettingsBusinessInterface = {
  dataBusinessDay: [],
  dataBusinessDayDefault: [],
  businessDayStatus: [],
  businessDateFilter: SETTING_MONTH[0].value,
  disableClear: true,
  disableConfirm: true,
  selectedStore: null,
  isSidebarExpand: true,
};

/**
 * MasterSettingsBusiness component
 * @returns MasterSettingsBusiness component
 */
const MasterSettingsBusiness = () => {
  const dispatch = useAppDispatch();
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores);
  const userDetail: UserDetail = useAppSelector(state => state.loginReducer.userLogin?.user_detail);
  const ref = useRef(null);

  const formConfig = useForm<MasterSettingsBusinessInterface>({
    defaultValues: DEFAULT_VALUES,
  });
  const { setValue, watch, getValues } = formConfig;
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);

  const columns = React.useMemo<TableColumnDef<IMasterSettingsBusiness>[]>(() => {
    return [
      {
        accessorKey: 'businessDateFisrt',
        header: 'budgetRegistration.table.monthDay',
        size: 5,
        cell(props) {
          const value = props.row.original.businessDateFisrt;
          return value ? getDate(new Date(value)) : '';
        },
      },
      {
        accessorKey: 'businessDayWeekFirst',
        header: 'budgetRegistration.table.weekDay',
        size: 5,
        type: 'text',
      },
      {
        accessorKey: 'businessDayFirst',
        header: '運用情報',
        size: 25,
        type: 'drop-down',
        option(props) {
          return {
            valueDropDown: watch('businessDayStatus'),
            value: props.row.original.businessDayFirst,
            isHidden: isNullOrEmpty(props.row.original.businessDayFirst),
          };
        },
      },
      {
        accessorKey: 'businessDateSecond',
        header: 'budgetRegistration.table.monthDay',
        size: 5,
        cell(props) {
          const value = props.row.original.businessDateSecond;
          return value ? getDate(new Date(value)) : '';
        },
      },
      {
        accessorKey: 'businessDayWeekSecond',
        header: 'budgetRegistration.table.weekDay',
        type: 'text',
        size: 5,
      },
      {
        accessorKey: 'businessDaySecond',
        header: '運用情報',
        size: 25,
        type: 'drop-down',
        option(props) {
          return {
            valueDropDown: watch('businessDayStatus'),
            value: props.row.original.businessDaySecond,
            isHidden: isNullOrEmpty(props.row.original.businessDaySecond),
          };
        },
      },
      {
        accessorKey: 'businessDateThird',
        header: 'budgetRegistration.table.monthDay',
        size: 5,
        cell(props) {
          const value = props.row.original.businessDateThird;
          return value ? getDate(new Date(value)) : '';
        },
      },
      {
        accessorKey: 'businessDayWeekThird',
        header: 'budgetRegistration.table.weekDay',
        type: 'text',
        size: 5,
      },
      {
        accessorKey: 'businessDayThird',
        header: '運用情報',
        size: 25,
        type: 'drop-down',
        option(props) {
          return {
            valueDropDown: watch('businessDayStatus'),
            value: props.row.original.businessDayThird,
            isHidden: isNullOrEmpty(props.row.original.businessDayThird),
          };
        },
      },
    ];
  }, [watch('businessDayStatus')]);

  // get list status name
  useEffect(() => {
    dispatch(getMasters({ master_code: ['MC0010'] }))
      .unwrap()
      .then((res) => {
        const data = res?.data?.data;
        if (data) {
          const listBusinessDayStatus = data.flatMap((entry) =>
            entry?.items?.map((item) => ({
              name: item.event_group_name,
              code: item.setting_data_type,
              value: Number(item.setting_data_type),
            }))
          );
          setValue('businessDayStatus', listBusinessDayStatus);
        }
      })
      .catch(() => { });
  }, []);

  // Get a list of focusable elements and sort the focus order accordingly
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((userDetail.role_code === USER_ROLE.STORE || !watch('isSidebarExpand')) && (e.key === KEYDOWN.Tab || e.key === KEYDOWN.Enter)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Get the latest focusable list on every key press
        const focusableElements = getFocusableElements(ref?.current, false).sort((a, b) => {
          const nameA = a.getAttribute('name');
          const nameB = b.getAttribute('name');
          const getColIndex = (name: string) => {
            if (name.includes('businessDayFirst')) return 0;
            if (name.includes('businessDaySecond')) return 1;
            if (name.includes('businessDayThird')) return 2;
            return 99;
          };
          const getRowIndex = (name: string) => {
            const match = name.match(/\[(\d+)\]/);
            return match ? parseInt(match[1], 10) : 0;
          };
          if (nameA == null || nameB == null) {
            return a.compareDocumentPosition(b) && Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
          }
          const colA = getColIndex(nameA);
          const colB = getColIndex(nameB);
          if (colA !== colB) return colA - colB;
          const rowA = getRowIndex(nameA);
          const rowB = getRowIndex(nameB);
          return rowA - rowB;
        });
        handleFocusListElement(focusableElements, e);
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [watch('dataBusinessDayDefault'), watch('isSidebarExpand')]);

  elementChangeKeyListener(watch('isSidebarExpand'));
  elementChangeKeyListener(watch('dataBusinessDayDefault'));

  // reset businessDateFilter when change selectedStore;
  useEffect(() => {
    setValue('businessDateFilter', SETTING_MONTH[0].value);
    setValue('selectedStore', selectedStores[0]);
  }, [selectedStores[0]]);

  /**
   * This simulates an API call to fetch business day data and sets it in the form.
   */
  const handleSearchbusinessDate = () => {
    dispatch(
      getStoreSchedules({
        store_code: watch('selectedStore'),
        business_date_filter: watch('businessDateFilter'),
      })
    )
      .unwrap()
      .then((res) => {
        const data = res?.data?.data?.items;
        let masterSettingsBusinessList = convertToMasterSettingsBusiness(getValues('businessDateFilter'), data);
        setValue('dataBusinessDayDefault', masterSettingsBusinessList);
        setValue('dataBusinessDay', masterSettingsBusinessList);
      })
      .then(() => {
        focusFirstDropdown();
      })
      .catch(() => { });
  };

  /**
   * Clear when click clear button and change store.
   * Clear table to init status and change businessDateFilter to current month
   */
  const handleClear = () => {
    setValue('dataBusinessDayDefault', []);
    setValue('dataBusinessDay', []);
    setValue('businessDateFilter', SETTING_MONTH[0].value);
    focusBusinessDateFilter();
  };

  /**
   * save and update store chedules
   */
  const handleConfirm = () => {
    const { selectedStore, businessDateFilter, dataBusinessDay } = watch();
    let businessDays = dataBusinessDay
      .flatMap((item) => [
        {
          business_date: item.businessDateFisrt,
          business_day_week: mapDayOfWeekNameToNumber.get(item.businessDayWeekFirst),
          business_day: item.businessDayFirst,
        },
        {
          business_date: item.businessDateSecond,
          business_day_week: mapDayOfWeekNameToNumber.get(item.businessDayWeekSecond),
          business_day: item.businessDaySecond,
        },
        {
          business_date: item.businessDateThird,
          business_day_week: mapDayOfWeekNameToNumber.get(item.businessDayWeekThird),
          business_day: item.businessDayThird,
        },
      ])
      .filter((item) => !isNullOrEmpty(item.business_date));
    dispatch(
      maintenanceStoreSchedules({
        store_code: selectedStore,
        business_date_filter: businessDateFilter,
        items: businessDays,
      })
    )
      .unwrap()
      .then(() => {
        handleClear();
      })
      .catch(() => { });
  };

  // update clear button status
  useEffect(() => {
    const { businessDateFilter, dataBusinessDay } = getValues();
    setValue('disableClear', businessDateFilter === SETTING_MONTH[0].value && isNullOrEmpty(dataBusinessDay));
  }, [watch('businessDateFilter'), watch('dataBusinessDay')]);

  const hasData = useMemo(() => !isNullOrEmpty(getValues('dataBusinessDay')), [watch('dataBusinessDay')]);

  // Focus first input (Business Date Filter dropdown)
  const focusBusinessDateFilter = () => {
    setTimeout(() => {
      focusElementByName('businessDateFilter');
    }, 500);
  };


  // Focus first dropdown when search
  const focusFirstDropdown = () => {
    setTimeout(() => {
      focusElementByName('dataBusinessDay[0].businessDayFirst');
    }, 300);
  };

  useEffect(() => {
    if(userDetail.role_code === USER_ROLE.STORE) {
      focusBusinessDateFilter();
    }
  }, [])

  return (
    <FormProvider {...formConfig}>
      <div className="master-settings-business" ref={ref}>
        <ModalCommon
          modalInfo={{
            type: IModalType.confirm,
            isShow: showDirtyCheck,
            message: localizeString('MSG_CONFIRM_002'),
          }}
          handleOK={() => {
            handleClear();
            setShowDirtyCheck(false);
          }}
          handleClose={() => setShowDirtyCheck(false)}
        />
        <div className="master-settings-business__header">
          <Header
            hasESC={true}
            title="masterSettingBusiness.title"
            csv={{ disabled: true }}
            hiddenTextESC={true}
            printer={{ disabled: true }}
            confirmBack={hasData}
          />
        </div>
        <div className="master-settings-business__main">
          <SidebarStore
            onClickSearch={() => { }}
            expanded={true}
            selectMultiple={false}
            hasData={hasData}
            clearData={handleClear}
            onChangeCollapseExpand={() => {
              focusBusinessDateFilter();
              setValue('isSidebarExpand', !watch('isSidebarExpand'));
            }}
            firstSelectStore={selectedStores[0]}
          />
          <div className="master-settings-business__main-search">
            <div className={'dropdown-month'}>
              <SelectControl
                name="businessDateFilter"
                className="budget-registration__setting-month-selection"
                label={localizeString('masterSettingBusiness.selectTitle')}
                items={SETTING_MONTH.map((item) => ({ ...item, name: item.name.slice(YEAR_LENGTH) }))}
                isRequired
                hasBlankItem={false}
                disabled={hasData}
              />
            </div>

            <div className={'button-search'}>
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                name={'action.f12Search'}
                onClickAction={() => {
                  handleSearchbusinessDate();
                }}
                disabled={hasData}
              />
            </div>
          </div>
          {/* Table */}
          <div className="master-settings-business__main-table">
            <TableData<IMasterSettingsBusiness>
              columns={columns}
              data={watch('dataBusinessDay') || []}
              enableSelectRow={false}
              tableKey="dataBusinessDay"
              showNoData={false}
              rowConfig={() => {
                return {
                  className: `${isNullOrEmpty()} day-hidden`,
                };
              }}
            />
          </div>
        </div>
        {/* Footer */}
        <BottomButton
          clearAction={() => {
            if (!watch('disableConfirm')) {
              setShowDirtyCheck(true);
            } else {
              handleClear();
            }
          }}
          confirmAction={handleConfirm}
          disabledClear={watch('disableClear')}
          disableConfirm={watch('disableConfirm')}
        />
        <BusinessDateCompare />
      </div>
    </FormProvider>
  );
};

const BusinessDateCompare = () => {
  return (
    <CompareForm name="dataBusinessDay" nameCompare="dataBusinessDayDefault" paramsEqual={keyIMasterSettingsBusiness} />
  );
};

export default MasterSettingsBusiness;
