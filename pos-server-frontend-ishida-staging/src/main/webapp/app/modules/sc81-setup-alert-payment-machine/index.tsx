import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, Resolver, useForm, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { array, object, ValidationError } from 'yup';

// Component
import Header from 'app/components/header/header';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import RadioControl from '@/components/control-form/radio-control';
import { ButtonBottomControl } from '@/components/bottom-button/button-bottom-control';

// Redux
import { useAppSelector } from '@/config/store';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Utils
import { focusElementByName, isEqualObject, isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';

// API
import { ISetupAlertPaymentMachine } from './setup-alert-payment-machine-interface';

// Styles
import './styles.scss';

const LIMIT_RECORD = 20;

const defaultRecord: ISetupAlertPaymentMachine = {
  cashier_no: 123,
  ten_thousand_count: null,
  five_thousand_count: 10000,
  two_thousand_count: 10000,
  one_thousand_count: 10000,
  five_hundred_count: 10000,
  one_hundred_count: 10000,
  fifty_count: 10000,
  ten_count: 10000,
  five_count: 10000,
  one_count: 10000,
};

const dataDefault = Array.from({ length: LIMIT_RECORD }, () => ({ ...defaultRecord }));

interface FormData {
  searchCondition?: {
    type: number;
  };

  alertPaymentMachine?: ISetupAlertPaymentMachine[];
  alertPaymentMachineDefault?: ISetupAlertPaymentMachine[];
  disableConfirm?: boolean;
}

const DEFAULT_DATA: FormData = {
  searchCondition: {
    type: 0,
  },

  // alertPaymentMachine: [],
  alertPaymentMachine: dataDefault,
  // alertPaymentMachineDefault: null,
  alertPaymentMachineDefault: dataDefault,
  disableConfirm: false,
};

export const SetupAlertPaymentMachine = () => {
  const [isReplenishment, setIsReplenishment] = useState(true);
  const [isStatusSearch, setIsStatusSearch] = React.useState(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  const validationSchema = object<FormData>().shape({
    alertPaymentMachine: array()
      .test('is-modified', localizeString('MSG_VAL_015'), (value) => {
        return value?.some((item, index) => !isEqualObject(item, watch('alertPaymentMachineDefault')[index]));
      })
      .test('validate-all-input', (items) => {
        if (!items) return true;
        const errors: ValidationError[] = [];
        items.forEach((item, index) => {
          const fields = [
            'five_thousand_count',
            'two_thousand_count',
            'one_thousand_count',
            'five_hundred_count',
            'one_hundred_count',
            'fifty_count',
            'ten_count',
            'five_count',
            'one_count',
          ];

          const values = fields.map((field) => ({ field, value: item[field as keyof ISetupAlertPaymentMachine] }));
          values?.map((v) => {
            if (isNullOrEmpty(v.value)) {
              errors.push(
                new ValidationError(
                  localizeFormat('MSG_VAL_001', localizeString(`setupAlertPaymentMachine.table.${v.field}`)),
                  v.value,
                  `alertPaymentMachine[${index}].${v.field}`
                )
              );
            } else if (v.value > 99999) {
              errors.push(
                new ValidationError(
                  localizeFormat('MSG_VAL_004', localizeString(`setupAlertPaymentMachine.table.${v.field}`), '99,999'),
                  v.value,
                  `alertPaymentMachine[${index}].${v.field}`
                )
              );
            }
          });
        });

        return errors.length > 0 ? new ValidationError(errors) : true;
      }),
  });

  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_DATA,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });
  const { getValues, setValue, setError, clearErrors, reset, watch } = formConfig;

  // Focus first input
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName('alertPaymentMachine[0].five_thousand_count');
    }, 500);
  };

  const dataTable: ISetupAlertPaymentMachine[] = useMemo(() => {
    return getValues('alertPaymentMachine');
  }, [watch('alertPaymentMachine')]);

  elementChangeKeyListener(isReplenishment);

  // Handle change type
  const handleChangeType = () => {
    setIsReplenishment(watch('searchCondition.type') === 0);
    clearErrors();
  };

  // Handle change store
  useEffect(() => {
    reset();
    setIsReplenishment(true);
    setIsStatusSearch(false);
  }, [selectedStores[0]]);

  // Get list AP8101
  useEffect(() => {
    if (isNullOrEmpty(selectedStores[0])) {
      return;
    }
    // Call API
  }, [isReplenishment, selectedStores[0]]);

  const columns = React.useMemo<TableColumnDef<ISetupAlertPaymentMachine>[]>(
    () => [
      {
        accessorKey: 'cashier_no',
        header: 'setupAlertPaymentMachine.table.cashier_no',
        size: 6,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'ten_thousand_count',
        header: 'setupAlertPaymentMachine.table.ten_thousand_count',
        size: 9.4,
        type: 'inputNumber',
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
        disabled: true,
      },
      {
        accessorKey: 'five_thousand_count',
        header: 'setupAlertPaymentMachine.table.five_thousand_count',
        size: 9.4,
        type: 'inputNumber',
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'two_thousand_count',
        header: 'setupAlertPaymentMachine.table.two_thousand_count',
        size: 9.4,
        type: 'inputNumber',
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'one_thousand_count',
        header: 'setupAlertPaymentMachine.table.one_thousand_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'five_hundred_count',
        header: 'setupAlertPaymentMachine.table.five_hundred_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'one_hundred_count',
        header: 'setupAlertPaymentMachine.table.one_hundred_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'fifty_count',
        header: 'setupAlertPaymentMachine.table.fifty_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'ten_count',
        header: 'setupAlertPaymentMachine.table.ten_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          textAlign: 'right',
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'five_count',
        header: 'setupAlertPaymentMachine.table.five_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'one_count',
        header: 'setupAlertPaymentMachine.table.one_count',
        type: 'inputNumber',
        size: 9.4,
        textAlign: 'right',
        inputTextProps: {
          maxLength: 15,
          addZero: false,
          thousandSeparator: true,
          minValue: 0,
          errorPlacement: 'left',
        },
      },
    ],
    []
  );

  // F11 Comfirm
  const handleConfirmAction = async () => {
    const alertPaymentMachine = getValues('alertPaymentMachine');
    try {
      await validationSchema.validate({ alertPaymentMachine }, { abortEarly: false });
      return true;
    } catch (e) {
      if (e instanceof ValidationError) {
        let fieldName = '';
        let message = '';
        if (e.inner.length > 0) {
          e.inner.map((item) => {
            fieldName = item?.path ?? '';
            message = item?.message;
            setError(`${fieldName}` as any, {
              message: localizeFormat(message),
            });
          });
        } else {
          fieldName = e.path;
          message = e.message;
          setError(`${fieldName}` as any, {
            message: localizeFormat(message),
          });
        }
        return;
      }
      return false;
    }
  };

  const handleClearData = () => {
    const alertPaymentMachineDefault = getValues('alertPaymentMachineDefault');
    reset();
    setValue('alertPaymentMachine', alertPaymentMachineDefault);
  };

  return (
    <FormProvider {...formConfig}>
      <div className="setup-alert">
        <Header
          hasESC={true}
          title="setupAlertPaymentMachine.title"
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          hiddenTextESC={true}
          confirmBack={watch('alertPaymentMachine')?.length > 0}
        />

        <div className={'setup-alert__main'}>
          {/* Sidebar */}
          <SidebarStore
            onClickSearch={() => {}}
            expanded={true}
            onChangeCollapseExpand={focusInput}
            clearData={handleClearData}
            hasData={watch('alertPaymentMachine')?.length > 0}
            actionConfirm={handleClearData}
          />

          {/* Input search */}
          <div className={'setup-alert__search'}>
            <span className="setup-alert__label">
              {localizeString('setupAlertPaymentMachine.conditionSearchLabel.type')}
            </span>
            <RadioControl
              isVertical={false}
              name="searchCondition.type"
              listValues={[
                {
                  id: 0,
                  textValue: localizeString('setupAlertPaymentMachine.conditionSearchLabel.replenishmentBaseValue'),
                  disabled: false,
                },
                {
                  id: 1,
                  textValue: localizeString('setupAlertPaymentMachine.conditionSearchLabel.recoveryStandardValue'),
                  disabled: false,
                },
              ]}
              value={watch('searchCondition.type')}
              onChange={handleChangeType}
            />
          </div>

          {/* Table */}
          <div className="setup-alert__table">
            <TableData<ISetupAlertPaymentMachine>
              columns={columns}
              data={dataTable}
              enableSelectRow={false}
              showNoData={isStatusSearch && (dataTable === null || dataTable.length === 0)}
              tableKey="alertPaymentMachine"
              tableType="edit"
            />
          </div>
        </div>
        {/* Footer */}
        <ButtonBottomControl
          name={'disableConfirm'}
          clearAction={handleClearData}
          confirmAction={() => {
            handleConfirmAction();
          }}
        />
      </div>
      <SetupAlertPaymentMachineCompare />
    </FormProvider>
  );
};

export default SetupAlertPaymentMachine;

export const SetupAlertPaymentMachineCompare = () => {
  const { control, setValue } = useFormContext();
  const dataForm: ISetupAlertPaymentMachine[] = useWatch({ control, name: 'alertPaymentMachine' });
  const dataFormDefault: ISetupAlertPaymentMachine[] = useWatch({ control, name: 'alertPaymentMachineDefault' });

  useEffect(() => {
    if (isNullOrEmpty(dataForm) || isNullOrEmpty(dataFormDefault)) {
      setValue('disableConfirm', true);
      return;
    }
    setValue(
      'disableConfirm',
      dataForm?.every((item, index) => isEqualObject(item, dataFormDefault[index]))
    );
  }, [dataForm]);
  return <></>;
};
