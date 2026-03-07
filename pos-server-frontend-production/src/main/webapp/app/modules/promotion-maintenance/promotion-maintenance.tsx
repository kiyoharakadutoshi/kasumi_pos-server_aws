import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { isEqual } from 'lodash';

// Component
import { PagingBottomButtonControl } from '@/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import { HeaderControl } from '@/components/header/header';
import { SidebarStoreControl } from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import { IPromotionMaintenance, IPromotionMaintenanceList } from './interface/promotion-maintenance-interface';
import { getListPromotionMaintenance, updateListPromotionMaintenance } from '@/services/promotion-maintenance-service';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { FuncKeyDirtyCheckButtonControl } from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

// Redux
import { setError as setErr } from '@/reducers/error';
import { useAppDispatch, useAppSelector } from '@/config/store';

// Utils
import { focusFirstInput } from '@/helpers/utils-element-html';
import { focusElementByName, isEqualObject, isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';

// Styles
import './promotion-maintenance.scss';

const repeatObject = (num) => {
  return Array.from({ length: num }, () => ({
    operation_type: null,
    operation_type_before: null,
    copy: null,
    record_id: null,
    record_idx: null,
    isError: false,
    id_delete_flag: false,
    promotion_code: '',
    promotion_name: '',
    promotion_name_default: '',
    promotion_cate: '',
    start_date: null,
    start_date_default: null,
    end_date: null,
    end_date_default: null,
    start_time: '',
    start_time_default: '',
    end_time: '',
    end_time_default: '',
  }));
};
const promotionMaintenanceDefault: IPromotionMaintenance = repeatObject(1)[0];

const limit = 13;
const promotionMaintenanceListDefault: IPromotionMaintenanceList = {
  disableConfirm: true,
  totalItem: 0,
  totalPage: 0,
  currentPage: 1,
  promotionCode: '',
  dataList: repeatObject(limit),
  isDirty: false,
  disabledClear: true,
};

const PromotionMaintenance = () => {
  const formConfig = useForm({
    defaultValues: promotionMaintenanceListDefault,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const dispatch = useAppDispatch();
  const roleCode = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const stores = useAppSelector((state) => state.storeReducer.stores) ?? [];
  const storeIsChoose = stores && stores?.find((item) => item?.store_code === selectedStores?.[0]);
  const { getValues, watch, clearErrors, reset, setValue, setError } = formConfig;
  const totalPage = watch('totalPage');
  const totalItem = watch('totalItem');
  const currentPage = watch('currentPage');
  const formRef = useRef<HTMLDivElement>(null);
  const [disableSearch, setDisableSearch] = useState(false);
  const [conditionSearch, setConditionSearch] = useState(false);

  const setValueColumn = (value: string, index: number) => {
    setValue(`dataList[${index}].promotion_cate` as any, getCatePromotion(value));
    if (getValues('dataList')[index].record_idx === null) {
      const now = new Date();
      const formattedDate =
        now.getFullYear() +
        '/' +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        now.getDate().toString().padStart(2, '0');

      now.setDate(now.getDate() + 1);

      const formattedDateTomorow =
        now.getFullYear() +
        '/' +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        now.getDate().toString().padStart(2, '0');
      setValue(`dataList[${index}].start_date` as any, formattedDate);
      setValue(`dataList[${index}].end_date` as any, formattedDateTomorow);
      setValue(`dataList[${index}].start_time` as any, storeIsChoose?.start_hours);
      setValue(`dataList[${index}].end_time` as any, storeIsChoose?.end_hours);
    }
  };

  const tableColumn = React.useMemo<TableColumnDef<IPromotionMaintenance>[]>(
    () => [
      {
        accessorKey: 'id_delete_flag',
        header: 'promotionMaintenance.id_delete_flag',
        type: 'checkbox',
        size: 5,
        option(props) {
          if (props.row.original.record_idx) {
            return { disabled: false };
          } else {
            return { disabled: true };
          }
        },
      },
      {
        accessorKey: 'promotion_code',
        header: 'promotionMaintenance.promotion_code',
        type: 'inputNumber',
        textAlight: 'left',
        size: 12,
        inputTextProps: {
          maxLength: 5,
          addZero: true,
          focusOut(value, index) {
            setError(`dataList[${index}].start_date` as any, null);
            setError(`dataList[${index}].end_date` as any, null);
            setError(`dataList[${index}].start_time` as any, null);
            setError(`dataList[${index}].end_time` as any, null);
            if (validatePromotionCode(value, index)) {
              setValueColumn(value, index);
            } else {
              setValue(`dataList[${index}].promotion_cate` as any, '');
            }
          },
        },
        option(props) {
          if (props.row.original.record_idx) {
            return { disabled: true };
          } else {
            return { disabled: false };
          }
        },
      },
      {
        accessorKey: 'promotion_name',
        header: 'promotionMaintenance.promotion_name',
        type: 'inputText',
        textAlight: 'left',
        size: 43,
        option(info) {
          return {
            required: info.row?.original?.promotion_cate?.length > 0,
          };
        },
        inputTextProps: {
          maxLength: 50,
          focusOut(value, index) {
            setValue(`dataList[${index}].promotion_name` as any, value.trim());
          },
        },
      },
      {
        accessorKey: 'promotion_cate',
        header: 'promotionMaintenance.promotion_cate',
        type: 'inputText',
        disabled: true,
        textAlight: 'left',
        size: 10,
      },
      {
        accessorKey: 'start_date',
        header: 'promotionMaintenance.start_date',
        size: 12,
        type: 'date',
        option(info) {
          return {
            required: info.row?.original?.promotion_cate?.length > 0,
          };
        },
      },
      {
        accessorKey: 'end_date',
        header: 'promotionMaintenance.end_date',
        size: 12,
        type: 'date',
        option(info) {
          return {
            required: info.row?.original?.promotion_cate?.length > 0,
          };
        },
      },
      {
        accessorKey: 'start_time',
        header: 'promotionMaintenance.start_time',
        size: 8,
        type: 'time',
        option(info) {
          return {
            required: info.row?.original?.promotion_cate?.length > 0,
          };
        },
      },
      {
        accessorKey: 'end_time',
        header: 'promotionMaintenance.end_time',
        size: 8,
        type: 'time',
        option(info) {
          return {
            required: info.row?.original?.promotion_cate?.length > 0,
          };
        },
      },
    ],
    [storeIsChoose]
  );
  const beginCode = ['99', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const CATE_HEADQUARTER = '1:本部';
  const CATE_STORE = '2:店舗';

  // Handle change store
  useEffect(() => {
    setDisableSearch(false);
  }, [selectedStores]);

  // Focus first input
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName('promotionCode');
    }, 500);
  };

  const validatePromotionCode = (promotionCode: string, index: number): boolean => {
    if (isNullOrEmpty(promotionCode)) {
      setError(`dataList[${index}].promotion_code` as any, null);
      formConfig.resetField('dataList[${index}].start_date' as any, { defaultValue: null });
      setValue(`dataList[${index}].start_date` as any, null);
      setValue(`dataList[${index}].end_date` as any, null);
      setValue(`dataList[${index}].start_time` as any, '');
      setValue(`dataList[${index}].end_time` as any, '');
      setValue(`dataList[${index}].promotion_name` as any, '');
      return false;
    }

    if (roleCode === '00' || roleCode === '01') {
      for (let i = 0; i < beginCode.length; i++) {
        if (promotionCode.startsWith(beginCode[i])) {
          setError(`dataList[${index}].promotion_code` as any, null);
          return true;
        }
      }
    } else if (roleCode === '02') {
      if (promotionCode.startsWith('99')) {
        setError(`dataList[${index}].promotion_code` as any, null);
        return true;
      }
    }

    setError(`dataList[${index}].promotion_code` as any, {
      message: localizeFormat('MSG_VAL_019', 'promotionMaintenance.promotion_code'),
    });
    return false;
  };

  function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  const validateDateTime = (index: number): boolean => {
    const row = getValues(`dataList[${index}]` as any) as IPromotionMaintenance;
    const startDateStr = row.start_date;
    const endDateStr = row.end_date;
    const startTimeStr = row.start_time;
    const endTimeStr = row.end_time;
    if (!startDateStr || !endDateStr || !startTimeStr || !endTimeStr) {
      return false;
    }
    if (startDateStr === 'Invalid Date' || endDateStr === 'Invalid Date') {
      return false;
    }
    const startDateStamp = Date.parse(startDateStr);
    const endDateStamp = Date.parse(endDateStr);
    if (startDateStamp > endDateStamp) {
      setError(`dataList[${index}].start_date` as any, {
        message: localizeFormat('MSG_VAL_004', 'promotionMaintenance.start_date', 'promotionMaintenance.end_date'),
      });
      return false;
    }
    if (startTimeStr === 'Invalid Time' || endTimeStr === 'Invalid Time') {
      return false;
    }

    if (startDateStamp === endDateStamp) {
      const startTime = timeToMinutes(startTimeStr);
      const endTime = timeToMinutes(endTimeStr);
      if (startTime > endTime) {
        setError(`dataList[${index}].start_time` as any, {
          message: localizeFormat('MSG_VAL_004', 'promotionMaintenance.start_time', 'promotionMaintenance.end_time'),
        });
        return false;
      }
    }
    setError(`dataList[${index}].start_time` as any, null);
    return true;
  };

  const validatePastDate = (index: number): boolean => {
    const endDateStr = getValues(`dataList[${index}].end_date` as any);
    if (!endDateStr) {
      return false;
    }
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const endDateStamp = Date.parse(endDateStr);
    if (endDateStamp < currentDate.getTime()) {
      setError(`dataList[${index}].end_date` as any, {
        message: localizeString('MSG_VAL_022'),
      });
      return false;
    }
    setError(`dataList[${index}].end_date` as any, null);
    return true;
  };

  const validatePastTime = (index: number): boolean => {
    const endTimeStr = getValues(`dataList[${index}].end_time` as any);
    const endDateStr = getValues(`dataList[${index}].end_date` as any);
    if (!endTimeStr || !endDateStr) {
      return false;
    }
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const endDateStamp = Date.parse(endDateStr);
    if (endDateStamp === currentDate.getTime()) {
      const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      if (endHours * 60 + endMinutes <= currentHours * 60 + currentMinutes) {
        setError(`dataList[${index}].end_time` as any, {
          message: localizeString('MSG_VAL_022'),
        });
        return false;
      }
    }
    setError(`dataList[${index}].end_time` as any, null);
    return true;
  };

  // Get promotion categorya
  const getCatePromotion = (promotionCode: string): string => {
    if (promotionCode.startsWith('99')) {
      return CATE_STORE;
    } else {
      return CATE_HEADQUARTER;
    }
  };

  const getPromotionTypeText = (type: string) => {
    if (type === '1') {
      return CATE_HEADQUARTER;
    } else if (type === '2') {
      return CATE_STORE;
    } else {
      return '';
    }
  };

  const handleSearchPromotion = (pageNumber: number) => {
    clearErrors();
    dispatch(
      getListPromotionMaintenance(
        getValues('promotionCode') === null || getValues('promotionCode').length === 0
          ? {
            store_code: selectedStores[0],
            page_number: pageNumber,
            limit,
          }
          : {
            store_code: selectedStores[0],
            page_number: pageNumber,
            code: getValues('promotionCode'),
            limit,
          }
      )
    )
      .unwrap()
      .then((res) => {
        setDisableSearch(true);
        setConditionSearch(true);
        if (res.data?.data?.total_promotion === undefined || res.data?.data?.total_promotion === 0) {
          setValue('dataList', []);
          setValue('totalItem', 0);
          setValue('currentPage', 1);
          setValue('totalPage', 0);
          return;
        }

        setValue('isDirty', true);

        const promotions = res.data?.data?.promotions;
        let dataList = promotions?.map((item) => {
          const startDate = item.start_date;
          const endDate = item.end_date;
          return {
            operation_type: null,
            operation_type_before: null,
            copy: null,
            record_idx: 1,
            isError: false,
            id_delete_flag: false,
            promotion_code: item.code || '',
            promotion_name: item.name || '',
            promotion_name_default: item.name || '',
            promotion_cate: getPromotionTypeText(item.type),
            start_date: startDate,
            start_date_default: startDate,
            end_date: endDate,
            end_date_default: endDate,
            start_time: item.start_time,
            start_time_default: item.start_time,
            end_time: item.end_time,
            end_time_default: item.end_time,
          };
        });

        const numPage = res.data?.data?.total_page;
        const numItems = res.data?.data?.total_promotion;

        const pad = dataList?.length === undefined ? limit : limit - dataList?.length;
        if (pad > 0) {
          dataList = (dataList || []).concat(repeatObject(pad));
        }
        setValue('totalPage', numPage);
        setValue('totalItem', numItems);
        setValue('dataList', dataList);
        setValue('currentPage', pageNumber);

        setTimeout(() => {
          const item = document.querySelector('input[name="dataList[0].promotion_name"]');
          if (item) {
            (item as HTMLInputElement).select();
            (item as HTMLInputElement).focus();
          }
        }, 50);
      });
  };


  const clearData = () => {
    focusFirstInput(formRef);
    setDisableSearch(false);
    setConditionSearch(false);
    reset();
  };

  const actionPaging = (pagingAction?: 'next' | 'prev' | 'first' | 'last') => {
    let redirectPage;
    switch (pagingAction) {
      case 'first':
        redirectPage = 1;
        break;
      case 'last':
        redirectPage = totalPage;
        break;
      case 'next':
        if (currentPage > totalPage) {
          redirectPage = currentPage;
        } else {
          redirectPage = currentPage + 1;
        }
        break;
      case 'prev':
        redirectPage = Math.max(currentPage - 1, 1);
        break;
      default:
        redirectPage = 1;
        break;
    }

    formConfig
      .handleSubmit(() => {
        updatePromotionMaintenanceList(redirectPage);
      })()
      .then(() => {
        for (let i = 0; i < limit; i++) {
          const element = getValues('dataList')[i];
          if (validatePromotionCode(element.promotion_code, i)) {
            validateDateTime(i);
            validatePastDate(i);
            validatePastTime(i);
          }
        }
      });
  };

  const updatePromotionMaintenanceList = (redirectPage: number) => {
    let haveErrs = false;
    for (let i = 0; i < limit; i++) {
      const element = getValues('dataList')[i];
      const isValidPromotionCode = validatePromotionCode(element.promotion_code, i);
      if (isValidPromotionCode) {
        const isValidDateTime = validateDateTime(i);
        const isValidPastDate = validatePastDate(i);
        const isValidPastTime = validatePastTime(i);
        if (!(isValidDateTime && isValidPastDate && isValidPastTime)) {
          haveErrs = true;
        }
      } else {
        if (!isNullOrEmpty(getValues(`dataList[${i}].promotion_code` as any))) {
          haveErrs = true;
        }
      }
    }

    if (haveErrs) {
      return;
    }

    const dataRequest = getValues('dataList')
      ?.filter((item) => {
        return (
          item.promotion_code !== '' &&
          (!isEqual(item.promotion_name, item.promotion_name_default) ||
            !isEqual(item.start_date, item.start_date_default) ||
            !isEqual(item.end_date, item.end_date_default) ||
            !isEqual(item.start_time, item.start_time_default) ||
            !isEqual(item.end_time, item.end_time_default) ||
            item.id_delete_flag)
        );
      })
      ?.map((item) => {
        return {
          code: item.promotion_code,
          operation_type: item.record_idx === null ? 1 : item.id_delete_flag ? 3 : 2,
          name: item.promotion_name,
          start_date: item.start_date,
          end_date: item.end_date,
          start_time: item.start_time,
          end_time: item.end_time,
          type: item.promotion_cate === CATE_HEADQUARTER ? 1 : 2,
        };
      });

    if (dataRequest.length === 0) {
      setValue('currentPage', redirectPage);
      handleSearchPromotion(getValues('currentPage'));
      return;
    }
    const requestValue = {
      store_code: selectedStores[0],
      promotions: dataRequest,
    };
    return dispatch(updateListPromotionMaintenance(requestValue)).then((response) => {
      if ('Success' === response.payload?.data?.status) {
        if (conditionSearch) {
          // If you have performed a search before, do not reset the table data but get new data and put it into the table to avoid screen flickering.
          setValue('currentPage', redirectPage);
          handleSearchPromotion(getValues('currentPage'));
        } else {
          // If you haven't searched before, reset all screens to add mode.
          reset();
          setValue('currentPage', redirectPage);
        }
      } else {
        setValue('currentPage', currentPage);
        handleSearchPromotion(getValues('currentPage'));
        let errsString = '';
        const errs = response.payload?.data?.data;

        for (const [key, value] of Object.entries(errs)) {
          if (Object.prototype.hasOwnProperty.call(errs, key)) {
            const index = key.match(/\d+/g).map(Number)[0];
            errsString =
              errsString +
              localizeString('promotionMaintenance.promotion_code') +
              ' ' +
              dataRequest[index].code +
              ' : ' +
              localizeString(value[0]) +
              '\n';
          }
        }
        setTimeout(() => {
          const item = document.querySelector('input[name="dataList[0].promotion_name"]');
          (item as HTMLInputElement)?.focus();
        }, 50);

        dispatch(setErr(errsString));
      }
    }).catch(() => { });
  };

  return (
    <FormProvider {...formConfig}>
      <div className="promotion-maintenance__container">
        <HeaderControl
          isHiddenCSV={false}
          dirtyCheckName="isDirty"
          isHiddenPrinter={false}
          printer={{ disabled: true }}
          csv={{ disabled: true }}
          title="promotion-maintenance.title"
          hasESC={true}
          confirmBack={!watch('isDirty')}
        />
        <div className="promotion-maintenance__sidebar">
          <SidebarStoreControl
            disabledSearch={false}
            expanded={true}
            dirtyName="isDirty"
            actionConfirm={() => {
              reset();
              setConditionSearch(false);
            }}
            onChangeCollapseExpand={focusInput}
            hasData={true}
          />
        </div>
        <div className="promotion-maintenance__search">
          <div ref={formRef}>
            <TooltipNumberInputTextControl
              width={'110px'}
              maxLength={5}
              label={'promotion-maintenance.promotion_code'}
              name={'promotionCode'}
              focusOut={(value) => setValue('promotionCode', value)}
              addZero={true}
              disabled={disableSearch}
            />
          </div>
          <div className="promotion-maintenance__toolbox button-normal">
            <FuncKeyDirtyCheckButtonControl
              text="action.f12Search"
              funcKey={'F12'}
              funcKeyListener={{
                selectedStores,
              }}
              dirtyName="isDirty"
              onClickAction={() => handleSearchPromotion(1)}
              okDirtyCheckAction={() => handleSearchPromotion(1)}
              disabled={disableSearch}
            />
          </div>
        </div>
        <div className="promotion-maintenance__table">
          <TableData<IPromotionMaintenance>
            columns={tableColumn}
            data={watch('dataList')}
            enableSelectRow={false}
            tableKey="dataList"
            showNoData={true}
          />
        </div>
        <PagingBottomButtonControl
          clearAction={clearData}
          confirmName={'disableConfirm'}
          disableClear={watch('disabledClear')}
          confirmAction={() => {
            formConfig
              .handleSubmit(() => {
                updatePromotionMaintenanceList(1);
              })()
              .then(() => {
                for (let i = 0; i < limit; i++) {
                  const element = getValues('dataList')[i];
                  if (validatePromotionCode(element.promotion_code, i)) {
                    validateDateTime(i);
                    validatePastDate(i);
                    validatePastTime(i);
                  }
                }
              });
          }}
          limit={limit}
          totalPage={totalItem === 0 ? null : totalPage}
          page={currentPage}
          actionPaging={actionPaging}
          total_record={totalItem}
        />
      </div>
      <PromotionMaintenanceCompare />
      <PromotionMaintenanceDisableClear />
    </FormProvider>
  );
};

export default PromotionMaintenance;

export const PromotionMaintenanceCompare = () => {
  const { control, setValue } = useFormContext();
  const dataForm: IPromotionMaintenance[] = useWatch({ control, name: 'dataList' });
  useEffect(() => {
    if (isNullOrEmpty(dataForm[0])) {
      setValue('disableConfirm', true);
      setValue('isDirty', false);
      return;
    }

    for (let i = 0; i < dataForm.length; i++) {
      const item = dataForm[i];

      if (
        item.id_delete_flag ||
        (!item.record_idx &&
          !isNullOrEmpty(item.promotion_code) &&
          !isEqualObject(item, promotionMaintenanceDefault, [
            'promotion_name',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
          ]))
      ) {
        setValue('disableConfirm', false);
        setValue('isDirty', true);
        return;
      }

      if (
        item.record_idx &&
        (!isEqual(item.promotion_name, item.promotion_name_default) ||
          !isEqual(item.start_date, item.start_date_default) ||
          !isEqual(item.end_date, item.end_date_default) ||
          !isEqual(item.start_time, item.start_time_default) ||
          !isEqual(item.end_time, item.end_time_default))
      ) {
        setValue('disableConfirm', false);
        setValue('isDirty', true);
        return;
      }
    }

    setValue('disableConfirm', true);
  }, [dataForm]);
  return <></>;
};

export const PromotionMaintenanceDisableClear = () => {
  const { control, setValue } = useFormContext();
  const dataForm: IPromotionMaintenance[] = useWatch({ control, name: 'dataList' });
  const disabledClear: boolean = useWatch({ control, name: 'disabledClear' });
  const promotionCodeSearch: string = useWatch({ control, name: 'promotionCode' });
  const currentPage: number = useWatch({ control, name: 'currentPage' });
  useEffect(() => {
    if (promotionCodeSearch) {
      if (disabledClear) {
        setValue('disabledClear', false);
      }
      return;
    }

    if (currentPage > 1) {
      if (disabledClear) {
        setValue('disabledClear', false);
      }
      return;
    }

    if (dataForm.length === 0) {
      setValue('disabledClear', false);
      return;
    }

    for (let i = 0; i < dataForm.length; i++) {
      const item = dataForm[i];

      if (
        !isEqualObject(item, promotionMaintenanceDefault, [
          'promotion_code',
          'promotion_name',
          'start_date',
          'end_date',
          'start_time',
          'end_time',
        ])
      ) {
        setValue('disabledClear', false);
        return;
      }

      if (!disabledClear) {
        setValue('disabledClear', true);
      }
    }
  }, [dataForm, promotionCodeSearch]);

  return <></>;
};
