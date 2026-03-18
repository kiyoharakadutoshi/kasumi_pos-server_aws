import { FormProvider, useForm } from 'react-hook-form';
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData from '@/components/table/table-data/table-data';
import React, { useState } from 'react';
import { priceDataDefault } from '@/modules/ishida-price-change/price-constants';
import { IPriceChange, IPriceState } from '@/modules/ishida-price-change/interface-price';
import BottomButton from '@/components/bottom-button/bottom-button';
import useColumns from '@/modules/ishida-price-change/use-column';
import './index.scss';
import { useAppSelector } from '@/config/store';
import { useHook } from '@/modules/ishida-price-change/use-hook';
import ModalCommon, { IModalInfo, IModalType } from '@/components/modal/modal-common';

const IshidaPriceChange = () => {
  const selectedStore: string = useAppSelector((state) => state.storeReducer.selectedStores)?.[0];
  const formConfig = useForm<IPriceState>({ defaultValues: priceDataDefault });
  const { watch, formState } = formConfig;
  const { suggestItemCode, suggestProductCode, clear, confirm, handleOKModal } = useHook(formConfig, selectedStore);
  const { columns } = useColumns(selectedStore, suggestItemCode, suggestProductCode);
  const isDirtyConfirm = watch('isDirtyConfirm');
  const [modalSuccess, setModalSuccess] = useState<IModalInfo>({ isShow: false, type: IModalType.info });

  return (
    <FormProvider {...formConfig}>
      <div className="ishida-price-change">
        <ModalCommon
          modalInfo={modalSuccess}
          handleOK={() => {
            setModalSuccess({ isShow: false, type: IModalType.info });
            handleOKModal();
          }}
        />
        <Header
          hasESC={true}
          title="priceChange.newPrice"
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          hiddenTextESC={true}
          confirmBack={isDirtyConfirm}
        />
        <SidebarStore expanded={true} actionConfirm={clear} hasData={isDirtyConfirm} />
        <TableData<IPriceChange> columns={columns} tableKey={'prices'} data={watch('prices')} enableSelectRow={false} />
        <BottomButton
          clearAction={clear}
          disableConfirm={!isDirtyConfirm}
          confirmAction={() => confirm(setModalSuccess)}
          disabledClear={!formState.isDirty}
        />
      </div>
    </FormProvider>
  );
};

export default IshidaPriceChange;
