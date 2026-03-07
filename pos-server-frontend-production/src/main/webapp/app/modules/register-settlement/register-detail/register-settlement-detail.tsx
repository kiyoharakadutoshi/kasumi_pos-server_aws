import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch } from '@/config/store';
import { Row } from '@tanstack/react-table';

// Component
import { HeaderControl } from '@/components/header/header';
import TooltipDatePicker from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import CompareForm from '@/components/compare-form/compare-form';
import { URL_MAPPING } from '@/router/url-mapping';

// API
import { saveCashRegister } from '@/services/register-settlement-service';

// Utils
import { isNullOrEmpty, localizeString } from '@/helpers/utils';

// CONSTANTS
import { IRegisterSettlementDetail } from '@/modules/register-settlement/register-detail/IRegisterSettlementDetail';
import {
  fieldsAction02,
  fieldsAction03,
  fieldsAction04,
  fieldsAction05,
  fieldsAction06Negative,
  fieldsAction06Plus,
  fieldsAction07,
  mappedData,
  registerDetailDefaultData,
} from '../register-default-data';

// CSS
import './register-settlement-detail.scss';
import { formatNumberWithCommas } from '@/helpers/number-utils';
import BottomButton from '@/components/bottom-button/bottom-button';
import ModalCommon, { IModalType } from '@/components/modal/modal-common';

function RegisterSettlementDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formConfig = useForm({ defaultValues: registerDetailDefaultData });
  const { getValues, setValue, watch } = formConfig;
  const listRegisterDetailTable1 = watch('listRegisterDetail.table1');
  const listRegisterDetailTable2 = watch('listRegisterDetail.table2');
  const { state } = useLocation();

  const columns = React.useMemo<TableColumnDef<IRegisterSettlementDetail>[]>(
    () => [
      {
        accessorKey: 'item_name',
        header: 'register-settlement.item_name',
        size: 40,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const itemName = props?.row?.original?.item_name;
          const formatValue = props?.row?.original?.format;
          if (isNullOrEmpty(formatValue)) {
            return {
              value: itemName,
            };
          } else if (formatValue === 'plus') {
            return {
              value: `＋${itemName}`,
            };
          } else if (formatValue === 'negative') {
            return {
              value: `－${itemName}`,
            };
          }
        },
      },
      {
        accessorKey: 'before_correction',
        header: 'register-settlement.before_correction',
        size: 30,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const beforeCorrection = props?.row?.original?.before_correction || 0;

          return {
            value: formatNumberWithCommas(beforeCorrection),
          };
        },
      },
      {
        accessorKey: 'after_correction',
        header: 'register-settlement.after_correction',
        size: 30,
        textAlign: 'right',
        type: 'inputNumber',
        option(props) {
          return {
            disabled: props?.row?.original.disable || watch('isDisableDataTable'),
          };
        },
        inputTextProps: {
          thousandSeparator: ',',
          textAlign: 'right',
          maxLength: 9,
          focusOut(value, index) {
            const defaultDataList = watch('listRegisterDetailDefault.table1');
            const oldValue = defaultDataList?.[index].after_correction || 0;
            const newValue =
              value === '' || value === '-' ? oldValue : value.replace(/^(-?)0+(?=\d)/, '$1')?.replace(/^-0$/, '0');
            setValue(`listRegisterDetail.table1[${index}].after_correction` as any, newValue);
            handleActionChangeInput(listRegisterDetailTable1, index, 1); // index : index of element input is changing
          },
          isNegative: true,
        },
      },
    ],
    [listRegisterDetailTable1, watch('isDisableDataTable')]
  );
  const columnsV2 = React.useMemo<TableColumnDef<IRegisterSettlementDetail>[]>(
    () => [
      {
        accessorKey: 'item_name',
        header: 'register-settlement.item_name',
        size: 40,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const itemName = props?.row?.original?.item_name;
          const formatValue = props?.row?.original?.format;
          if (isNullOrEmpty(formatValue)) {
            return {
              value: itemName,
            };
          } else if (formatValue === 'plus') {
            return {
              value: `＋${itemName}`,
            };
          } else if (formatValue === 'negative') {
            return {
              value: `－${itemName}`,
            };
          }
        },
      },
      {
        accessorKey: 'before_correction',
        header: 'register-settlement.before_correction',
        size: 30,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const beforeCorrection = props?.row?.original?.before_correction || 0;

          return {
            value: formatNumberWithCommas(beforeCorrection),
          };
        },
      },
      {
        accessorKey: 'after_correction',
        header: 'register-settlement.after_correction',
        size: 30,
        textAlign: 'right',
        type: 'inputNumber',
        option(props) {
          return {
            disabled: props?.row?.original.disable || watch('isDisableDataTable'),
          };
        },
        inputTextProps: {
          thousandSeparator: ',',
          textAlign: 'right',
          maxLength: 9,
          focusOut(value, index) {
            const defaultDataList = watch('listRegisterDetailDefault.table2');
            const oldValue = defaultDataList?.[index].after_correction || 0;
            const newValue =
              value === '' || value === '-' ? oldValue : value.replace(/^(-?)0+(?=\d)/, '$1')?.replace(/^-0$/, '0');
            setValue(`listRegisterDetail.table2[${index}].after_correction` as any, newValue);
            handleActionChangeInput(listRegisterDetailTable2, index, 2); // index : index of element input is changing
          },
          isNegative: true,
        },
      },
    ],
    [listRegisterDetailTable2, watch('isDisableDataTable')]
  );

  const addClassNameRow = (row: Row<IRegisterSettlementDetail>) => {
    return { className: row?.original.isChildren ? `children ${row?.original.key}` : `${row?.original.key}` };
  };

  const handleActionChangeInput = (registerOfTableData, index, tableIndex) => {
    // handle action SC2002-02
    const listFields = registerOfTableData?.map((item) => item?.key);
    const allField = listRegisterDetailTable1?.concat(listRegisterDetailTable2)?.map((item) => item?.key);
    const fieldEdit = listFields[index];
    const listFieldsTable2 = listRegisterDetailTable2?.map((item) => item?.key);
    const indexDesiredCashBalance = listFieldsTable2?.findIndex((item) => item === 'desired_cash_balance');
    if (fieldsAction02.includes(fieldEdit)) {
      const indexes = fieldsAction02.map((item) => listFields.indexOf(item)).filter((indexItem) => indexItem !== -1);
      // calculator total
      const sum = indexes.reduce(
        (acc, indexReduce) =>
          Number(acc) +
          (Number(watch(`listRegisterDetail.table${tableIndex}[${indexReduce}].after_correction` as any)) || 0),
        0
      );
      const indexParent = listFields?.findIndex((item) => item === 'cash_in_total');
      // update value for parent
      const oldValueParent = watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any);
      setValue(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any, sum);
      // if parent into list field plus or negative update desired_cash_balance
      const newDataDesiredCashBalance =
        Number(watch(`listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any)) -
        Number(oldValueParent) +
        Number(watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any));
      setValue(
        `listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any,
        newDataDesiredCashBalance
      );
      // update cash_surplus_or_shortage when desired_cash_balance change event 07
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
    // handle action SC2002-03
    else if (fieldsAction03.includes(fieldEdit)) {
      const indexParent = listFields?.findIndex((item) => item === 'cash_out_total');
      const indexChildren = listFields?.findIndex((item) => item === fieldEdit);
      // update value for parent
      const oldValueParent = watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any);

      setValue(
        `listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any,
        Number(watch(`listRegisterDetail.table${tableIndex}[${indexChildren}].after_correction` as any))
      );
      // if parent into list field plus or negative update desired_cash_balance
      const newDataDesiredCashBalance =
        Number(watch(`listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any)) -
        Number(oldValueParent) * -1 +
        Number(watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any)) * -1;
      setValue(
        `listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any,
        newDataDesiredCashBalance
      );
      // update cash_surplus_or_shortage when desired_cash_balance change event 07
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
    // handle action SC2002-04
    else if (fieldsAction04.includes(fieldEdit)) {
      const indexes = fieldsAction04.map((item) => listFields.indexOf(item)).filter((indexItem) => indexItem !== -1);

      // calculator total
      const sum = indexes.reduce(
        (acc, indexReduce) =>
          Number(acc) +
          (Number(watch(`listRegisterDetail.table${tableIndex}[${indexReduce}].after_correction` as any)) || 0),
        0
      );
      const indexParent = listFields?.findIndex((item) => item === 'voucher_payment_total');
      // update value for parent
      const oldValueParent = watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any);
      setValue(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any, sum);
      // if parent into list field plus or negative update desired_cash_balance
      const newDataDesiredCashBalance =
        Number(watch(`listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any)) -
        Number(oldValueParent) * -1 +
        Number(watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any)) * -1;
      setValue(
        `listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any,
        newDataDesiredCashBalance
      );
      // update cash_surplus_or_shortage when desired_cash_balance change event 07
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
    // handle action SC2002-05
    else if (fieldsAction05.includes(fieldEdit)) {
      const indexes = fieldsAction05.map((item) => listFields.indexOf(item)).filter((indexItem) => indexItem !== -1);

      // calculator total
      const sum = indexes.reduce(
        (acc, indexReduce) =>
          Number(acc) +
          (Number(watch(`listRegisterDetail.table${tableIndex}[${indexReduce}].after_correction` as any)) || 0),
        0
      );
      const indexParent = listFields?.findIndex((item) => item === 'other_payment_total');
      // update value for parent
      const oldValueParent = watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any);

      setValue(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any, sum);
      // if parent into list field plus or negative update desired_cash_balance
      const newDataDesiredCashBalance =
        Number(watch(`listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any)) -
        Number(oldValueParent) * -1 +
        Number(watch(`listRegisterDetail.table${tableIndex}[${indexParent}].after_correction` as any)) * -1;
      setValue(
        `listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any,
        newDataDesiredCashBalance
      );
      // update cash_surplus_or_shortage when desired_cash_balance change event 07
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
    // handle action SC2002-06
    else if (fieldsAction06Plus.includes(fieldEdit) || fieldsAction06Negative.includes(fieldEdit)) {
      const indexes = fieldsAction06Plus
        .concat(fieldsAction06Negative)
        .map((item) => allField.indexOf(item))
        .filter((indexItem) => indexItem !== -1);
      // calculator total
      let tableIndexContainCalculatorField = tableIndex;

      const maxIndex = 22;
      const sum = indexes.reduce((acc, indexReduce) => {
        const safeIndex = indexReduce % (maxIndex + 1); // one table have max 22 row
        if (
          [
            'voucher_payment_total',
            'other_payment_total',
            'qr_payment_app',
            'qr_payment_cash_register',
            'minna_bank',
          ].includes(allField[indexReduce])
        ) {
          tableIndexContainCalculatorField = 2;
        } else {
          tableIndexContainCalculatorField = 1;
        }
        let newValue = Number(
          watch(`listRegisterDetail.table${tableIndexContainCalculatorField}[${safeIndex}].after_correction` as any)
        );
        if (fieldsAction06Negative.includes(allField[indexReduce])) {
          newValue = newValue * -1;
        }
        return Number(acc) + (newValue || 0);
      }, 0);
      // update value for parent
      setValue(`listRegisterDetail.table2[${indexDesiredCashBalance}].after_correction` as any, sum);
      // update cash_surplus_or_shortage when desired_cash_balance change event 07
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
    // handle action SC2002-07
    else if (fieldsAction07.includes(fieldEdit)) {
      handleUpdateCashSurplusOrShortage(indexDesiredCashBalance);
    }
  };

  const handleUpdateCashSurplusOrShortage = (indexDesiredCashBalanceAction) => {
    const listFieldsAction = listRegisterDetailTable2?.map((item) => item?.key);
    const tableIndexAction = 2; // CashBalanceAtTimeOfCheckout and DesiredCashBalanceAction alway into table2
    const indexCashBalanceAtTimeOfCheckout = listFieldsAction?.findIndex(
      (item) => item === 'cash_balance_at_time_of_checkout'
    );
    const indexParent = listFieldsAction?.findIndex((item) => item === 'cash_surplus_or_shortage');
    const newParentValue =
      Number(
        watch(
          `listRegisterDetail.table${tableIndexAction}[${indexCashBalanceAtTimeOfCheckout}].after_correction` as any
        )
      ) -
      Number(
        watch(`listRegisterDetail.table${tableIndexAction}[${indexDesiredCashBalanceAction}].after_correction` as any)
      );
    // update value for parent
    setValue(`listRegisterDetail.table${tableIndexAction}[${indexParent}].after_correction` as any, newParentValue);
  };

  const handleConfirm = () => {
    if (getValues('isDisableDataTable')) {
      setValue('isDisableDataTable', false);
    } else {
      setValue('isDisableDataTable', true);
    }
    // Handle call api 2003
    if (!watch('isDisableDataTable')) {
      const listDataConfirm = listRegisterDetailTable1.concat(listRegisterDetailTable2);
      const newObjData = listDataConfirm?.reduce((acc, item) => {
        acc[item.key] = Number(item.after_correction);
        return acc;
      }, {});

      newObjData.selected_store = state?.selectedStore;
      newObjData.business_date = state?.openBusinessDayDetailPage?.slice(2);
      newObjData.cash_register_code = state.cashRegisterCode;

      dispatch(saveCashRegister(newObjData as any))
        .unwrap()
        .then((res) => {
          if (res?.data?.status === 'Success') {
            navigate(-1);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (isNullOrEmpty(state?.selectedStore)) {
      navigate(`/${URL_MAPPING.SC2001}`);
    }
  }, [state]);

  // Update data to table when joint page

  useEffect(() => {
    const fieldNameFrom2001 = state?.fieldNameDetail || {};
    const newValueFrom2001 = state?.newValueDetail || {};
    const oldValueFrom2001 = state?.oldValueDetail || {};
    setValue(
      'listRegisterDetailDefault.table1',
      mappedData(fieldNameFrom2001, oldValueFrom2001, newValueFrom2001)?.slice(0, 23)
    );
    setValue(
      'listRegisterDetailDefault.table2',
      mappedData(fieldNameFrom2001, oldValueFrom2001, newValueFrom2001)?.slice(23)
    );
    setValue(
      'listRegisterDetail.table1',
      mappedData(fieldNameFrom2001, oldValueFrom2001, newValueFrom2001)?.slice(0, 23)
    );
    setValue('listRegisterDetail.table2', mappedData(fieldNameFrom2001, oldValueFrom2001, newValueFrom2001)?.slice(23));
  }, [state]);

  // Focus input into table
  const checkAndFocusInput = () => {
    setTimeout(() => {
      const enabledInputs = document.querySelectorAll(
        'div.table-data div[data-testid="virtuoso-scroller"] input.tooltip-number-input-text:not([disabled])'
      );

      if (enabledInputs.length > 0) {
        const firstInputRef = enabledInputs[0] as HTMLInputElement;
        firstInputRef.focus();
      }
    }, 100);
  };

  useEffect(() => {
    setTimeout(checkAndFocusInput, 200);
  }, []);

  const handleOpenDirtyModal = () => {
    setValue('isDirtyCheck', true);
  };

  const handleClearAction = () => {
    setValue('isDisableDataTable', false);
    const defaultValueTable1 = watch('listRegisterDetailDefault.table1');
    const defaultValueTable2 = watch('listRegisterDetailDefault.table2');
    setValue('listRegisterDetail.table1', defaultValueTable1);
    setValue('listRegisterDetail.table2', defaultValueTable2);
    // Update status dirty
    setValue('isDirtyCheck', false);
    // Handle focus fist input into table

    setTimeout(checkAndFocusInput, 350);
  };

  return (
    <FormProvider {...formConfig}>
      <div className={'register-settlement-detail'}>
        <HeaderControl
          dirtyCheckName={'isDirty'}
          hasESC={true}
          title="register-settlement.title"
          csv={{ disabled: true }}
          hiddenTextESC={true}
          printer={{ disabled: true }}
          selectedStore={`${state?.selectedStore || ''}:${state?.storeName || ''}`}
        />
        <div className="register-settlement-detail__main">
          <div className="register-settlement-detail__infor">
            <TooltipDatePicker
              labelText="register-settlement.correction_date"
              initValue={state && new Date(state?.openBusinessDayDetailPage)} // update date after transmission form register page
              onChange={() => {}}
              isShortDate={true}
              inputClassName="date-time-start-end__start-date"
              keyError={'specialPromotion.start_date'}
              checkEmpty={true}
              disabled={true}
            />
            <InputTextCustom
              labelText={'register-settlement.cash_register'}
              disabled={true}
              value={state && state.cashRegisterName}
              widthInput={'782px'}
            />
          </div>
          <div className="register-settlement-detail__table">
            <div className="register-settlement-detail__table__item">
              <TableData<IRegisterSettlementDetail>
                columns={columns}
                data={(listRegisterDetailTable1 && listRegisterDetailTable1) || []}
                enableSelectRow={false}
                rowConfig={addClassNameRow}
                tableKey={'listRegisterDetail.table1'}
                valueIncreaseViewport={1000}
              />
            </div>
            <div className="register-settlement-detail__table__item">
              <TableData<IRegisterSettlementDetail>
                columns={columnsV2}
                data={(listRegisterDetailTable2 && listRegisterDetailTable2) || []}
                enableSelectRow={false}
                rowConfig={addClassNameRow}
                tableKey={'listRegisterDetail.table2'}
                valueIncreaseViewport={1000}
              />
            </div>
          </div>
        </div>

        <BottomButton
          disableConfirm={false}
          disabledClear={watch('disableConfirm') || watch('isDisableDataTable')}
          clearAction={handleOpenDirtyModal}
          confirmAction={handleConfirm}
        />
      </div>
      <RegisterDetailCompare />
      {/* Modal dirty check */}
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: watch('isDirtyCheck'),
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={() => {
          handleClearAction();
        }}
        handleClose={() => setValue('isDirtyCheck', false)}
      />
    </FormProvider>
  );
}

export default RegisterSettlementDetail;

const RegisterDetailCompare = () => {
  return (
    <CompareForm name="listRegisterDetail" nameCompare="listRegisterDetailDefault" paramsEqual={['after_correction']} />
  );
};
