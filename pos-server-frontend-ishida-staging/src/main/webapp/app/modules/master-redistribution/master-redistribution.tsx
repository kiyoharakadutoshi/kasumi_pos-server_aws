import React, { useEffect } from 'react';
import './master-redistribution.scss';
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import BottomButton from '@/components/bottom-button/bottom-button';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { FormProvider, useForm } from 'react-hook-form';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { IMasterRedistribution } from '@/modules/master-redistribution/master-redistribution-interface';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { translate } from 'react-jhipster';
import { useAppSelector } from '@/config/store';

function MasterRedistribution() {
  const dataInit: IMasterRedistribution[] = Array.from({ length: 13 }, () => ({
    group_code: '',
    product_code: '',
    plu_code: '',
    product_name: '',
    standard_price: '',
  }));
  const formConfig = useForm({ defaultValues: { dataForm: dataInit } });
  const {
    reset,
    watch,
    setValue,
    formState: { isDirty, dirtyFields },
  } = formConfig;
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const tdElements = document.querySelectorAll('input.tooltip-number-input-text:not([disabled])');
  const [enabledPLU, setEnabledPLU] = React.useState(true);
  elementChangeKeyListener(enabledPLU);

  const [isStatusConfirm, setStatusConfirm] = React.useState(true);
  const dataForm = formConfig.watch('dataForm');

  const columns = React.useMemo<TableColumnDef<IMasterRedistribution>[]>(
    () => [
      {
        accessorKey: 'product_code',
        header: 'master-redistribution.product_code',
        size: 10,
        type: 'product',
        textAlign: 'right',
        disabled: enabledPLU,
        inputTextProps: {
          addZero: true,
          textAlign: 'right',
        },
      },
      {
        accessorKey: 'plu_code',
        header: 'master-redistribution.plu_code',
        size: 13,
        type: 'inputNumber',
        textAlign: 'right',
        disabled: !enabledPLU,
        inputTextProps: {
          addZero: true,
          textAlign: 'right',
          maxLength: 13,
        },
      },
      {
        accessorKey: 'product_name',
        header: 'master-redistribution.product_name',
        type: 'text',
        size: 62,
        textAlign: 'left',
      },
      {
        accessorKey: 'standard_price',
        header: 'master-redistribution.standard_price',
        size: 15,
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
      },
    ],
    [enabledPLU]
  );

  // Handle change store
  useEffect(() => {
    setEnabledPLU(true);
    reset();
  }, [selectedStores[0]]);

  // Focus first input table
  const focusInput = (isExpand: boolean) => {
    if (!isExpand) {
      const firstInputRef = tdElements[0] as HTMLInputElement;
      firstInputRef?.focus();
    }
  };

  //handle status button confirm
  useEffect(() => {
    const areListsEqual =
      dataInit.length === dataForm.length &&
      dataInit.every((obj1, i) =>
        Object.keys(obj1).every((key) => (obj1[key] || '').toString() === (dataForm[i][key] || '').toString())
      );
    setStatusConfirm(areListsEqual);
  }, [formConfig.watch()]);

  return (
    <FormProvider {...formConfig}>
      <div className={'master-redistribution'}>
        <Header
          hasESC={true}
          title={translate('master-redistribution.headerTitle')}
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          hiddenTextESC={true}
        />
        <SidebarStore onClickSearch={() => {}} expanded={true} onChangeCollapseExpand={focusInput} />
        <div className="master-redistribution__search">
          <ButtonPrimary
            text={enabledPLU ? 'master-redistribution.productCodeSwitching' : 'master-redistribution.pluCodeSwitching'}
            onClick={() => {
              setEnabledPLU(!enabledPLU);
            }}
          />
        </div>
        <div className="master-redistribution__table">
          <TableData<IMasterRedistribution>
            enableSelectRow={false}
            columns={columns}
            data={watch('dataForm')}
            tableKey={'dataForm'}
          />
        </div>

        <BottomButton
          clearAction={() => {
            setEnabledPLU(true);
            reset();
          }}
          confirmAction={() => {}}
          disableConfirm={isStatusConfirm}
        />
      </div>
    </FormProvider>
  );
}

export default MasterRedistribution;
