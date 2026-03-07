import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Row } from '@tanstack/react-table';
import { translate } from 'react-jhipster';


// Components
import ReceiptCouponModal from './receipt-coupon-modal';
import Header from '@/components/header/header';
import BottomButton from '@/components/bottom-button/bottom-button';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import ExcludedStore from '@/components/excluded-store';
import TableData, { RowBase, TableColumnDef } from '@/components/table/table-data/table-data';

// Utils
import { isNullOrEmpty } from '@/helpers/utils';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Redux
import { useAppSelector } from '@/config/store';
import { IStoreInfo } from '@/reducers/store-reducer';

// Utils
import { convertDateServer } from '@/helpers/date-utils';
import { getFocusableElements } from '@/helpers/utils-element-html';

// Styles
import './styles.scss';

export interface CouponSetting {
  store: string,
  title: string,
  printingPeriod: {
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  },
  availabilityPeriod: {
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  },
  couponCode: string,
  backSide: {
    title: string,
    message: number,
  },
  frontSide: {
    message: number,
  },
  updateDate: string,
  updateBy: string,
}

export interface ReceiptCouponSettingFormData extends FormTableDataBase<ReceiptCoupon> {
  listData: []
  excludedStores: IStoreInfo[],
  add?: CouponSetting,
  edit?: CouponSetting
}

export const DEFAULT_COUPON_SETTING_VALUE: CouponSetting = {
  store: '00001',
  title: '',
  printingPeriod: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  },
  availabilityPeriod: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  },
  couponCode: '',
  backSide: {
    title: '',
    message: null
  },
  frontSide: {
    message: null
  },
  updateDate: convertDateServer(new Date()),
  updateBy: 'LUVINA01'
}

export const DEFAULT_VALUE: ReceiptCouponSettingFormData = {
  excludedStores: [],
  listData: [],
  add: DEFAULT_COUPON_SETTING_VALUE,
  edit: DEFAULT_COUPON_SETTING_VALUE
};

// const STORE_09999 = '09999';
const STORE_09999 = '00001';

const LIST_DATA: ReceiptCoupon[] = Array.from({ length: 20 }).map((_, index) => {
  return {
    no: index + 1,
    storeCode: '01019' + 1,
    title: '刺身盛合せ４点盛',
    printingAgency: '2022/11/04 ~ 2022/11/04',
    availablePeriod: '2022/11/04 ~ 2022/11/04',
    couponCode: '00214322',
    operation_type: 2,
  }
});

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}

export interface ReceiptCoupon extends RowBase {
  no: number;
  storeCode: string;
  title: string;
  printingAgency: string;
  availablePeriod: string;
  couponCode: string;
}

export enum MODE_MODAL {
  ADD = 'add',
  EDIT = 'edit'
}

export type Mode = MODE_MODAL.ADD | MODE_MODAL.EDIT;

/**
 * SC2801: The page describes setting receipt coupon, it can create/update receipt coupon
 * 
 * @returns {JSX.Element} The receipt coupon setting page
 */
const ReceiptCouponSetting = (): JSX.Element => {
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const receiptCouponRef = useRef(null);

  // State
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setModal] = useState<Mode>(MODE_MODAL.ADD);

  elementChangeKeyListener(selectedStores[0]);

  const formConfig = useForm<ReceiptCouponSettingFormData>({
    defaultValues: DEFAULT_VALUE,
  });

  const { getValues, setValue, watch, reset, clearErrors } = formConfig;

  /**
   * Define column table
   */
  const columns = useMemo<TableColumnDef<ReceiptCoupon>[]>(() => {
    return [
      {
        header: 'No',
        accessorKey: 'no',
        size: 5,
        textAlign: 'center',
      },
      {
        header: 'receiptCouponSetting.table.storeCode',
        accessorKey: 'storeCode',
        size: 10,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.title',
        accessorKey: 'title',
        size: 25,
        disabled: false,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.printingAgency',
        accessorKey: 'printingAgency',
        size: 25,
        disabled: false,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.availablePeriod',
        accessorKey: 'availablePeriod',
        size: 25,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.couponCode',
        accessorKey: 'couponCode',
        size: 15,
        textAlign: 'left',
      },
    ];
  }, []);

  // Handle change store
  useEffect(() => {
    reset();

    if (selectedStores.includes(STORE_09999)) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [selectedStores[0]]);

  const handleSelectedStores = (stores: IStoreInfo[]): void => {
    setValue('excludedStores', stores);
  };

  // F11 Confirm
  const handleConfirmAction = () => { };

  const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const focusFirstElement = async () => {
    await delay(200);

    if (!receiptCouponRef.current) return;

    const element = getFocusableElements(receiptCouponRef.current, true, true)?.[0] as HTMLDivElement;
    if (element) {
      element.focus();
    }
  };

  /**
   * Handle open modal
   */
  const handleOpenModal = (modeModal: Mode = MODE_MODAL.EDIT) => {
    setShowModal(true);
    setModal(modeModal);
  };

  /**
   * Handle close modal
   * 
   * When close modal, clear error validation
   */
  const handleCloseModal = () => {
    setShowModal(false);
    clearErrors('add');
    clearErrors('edit');
    reset({
      ...watch(),
      add: {}
    });
  };

  const isDisabledConfirm = useMemo(() => {
    return getValues('excludedStores')?.length === 0;
  }, [watch('excludedStores')]);

  return (
    <FormProvider {...formConfig}>
      <div className='receipt-coupon-setting'>
        <Header
          csv={{ disabled: false }}
          printer={{ disabled: true }}
          title={translate('receiptCouponSetting.title')}
          hasESC={true}
        />
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={() => {
            focusFirstElement();
          }}
          selectMultiple
        />
        {
          showModal && (
            <ReceiptCouponModal isEdit={mode === MODE_MODAL.EDIT} closeModal={handleCloseModal} />
          )
        }

        <div className="receipt-coupon-setting-wapper">
          <TableData<ReceiptCoupon>
            data={LIST_DATA}
            columns={columns}
            tableKey="listData"
            multiRowSelection={false}
            onDoubleClick={() => handleOpenModal()}
          />
          <div className={'receipt-coupon-setting-right'} ref={receiptCouponRef}>
            {
              isVisible && (
                <ExcludedStore
                  onClickSearch={() => { }}
                  selectMultiple={true}
                  selectedExcludedStores={handleSelectedStores}
                />
              )
            }
          </div>
        </div>
        <BottomButton
          confirmAction={handleConfirmAction}
          disableDelete={isNullOrEmpty(watch('selectedRows')?.[0])}
          disableConfirm={isDisabledConfirm}
          disableEdit={isNullOrEmpty(watch('selectedRows')?.[0])}
          deleteAction={() => { }}
          editAction={() => handleOpenModal()}
          addAction={() => handleOpenModal(MODE_MODAL.ADD)}
        />
      </div>
    </FormProvider>
  );
};

export default ReceiptCouponSetting;
