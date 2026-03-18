import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Row } from '@tanstack/react-table';
import { translate } from 'react-jhipster';
import { random } from 'lodash';

// Components
import ReceiptCouponModal, { IMasterCategory } from './receipt-coupon-modal';
import Header from '@/components/header/header';
import BottomButton from '@/components/bottom-button/bottom-button';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import ExcludedStore from '@/components/excluded-store';
import TableData, { RowBase, TableColumnDef } from '@/components/table/table-data/table-data';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import SelectControl from '@/components/control-form/select-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';

// Utils
import { isNullOrEmpty, localizeFormat } from '@/helpers/utils';
import { USER_ROLE } from '@/constants/constants';

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
  store: string;
  title: string;
  printingPeriod: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  availabilityPeriod: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  couponCode: string;
  categoryCode: string;
  backSide: {
    title: string;
    message: number;
  };
  frontSide: {
    message: number;
  };
  updateDate: string;
  updateBy: string;
  listHierarchyLevel?: IMasterCategory[];
}

export interface ReceiptCouponSettingFormData extends FormTableDataBase<ReceiptCoupon> {
  searchCondition?: {
    store: number;
    title: string;
    couponCode: string;
  };
  listData: ReceiptCoupon[];
  excludedStores: IStoreInfo[];
  add?: CouponSetting;
  edit?: CouponSetting;
}

export const DEFAULT_COUPON_SETTING_VALUE: CouponSetting = {
  store: '00001',
  title: '',
  printingPeriod: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  },
  availabilityPeriod: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  },
  couponCode: '',
  categoryCode: '',
  backSide: {
    title: '',
    message: null,
  },
  frontSide: {
    message: null,
  },
  updateDate: convertDateServer(new Date()),
  updateBy: 'LUVINA01',
  listHierarchyLevel: null,
};

export const DEFAULT_VALUE: ReceiptCouponSettingFormData = {
  searchCondition: {
    store: 1,
    title: '',
    couponCode: '',
  },
  excludedStores: [],
  listData: [],
  add: DEFAULT_COUPON_SETTING_VALUE,
  edit: DEFAULT_COUPON_SETTING_VALUE,
};

// const STORE_09999 = '09999';
const STORE_09999 = '00001';

// const LIMIT_RECORD = 1000;
const LIMIT_RECORD = 1000;

const LIST_DATA: ReceiptCoupon[] = Array.from({ length: 20 }).map((_, index) => {
  return {
    no: index + 1,
    storeCode: '0000' + random(9) + ' : 舖名称',
    title: '刺身盛合せ４',
    printingAgency: '2022/11/04 ~ 2022/11/04',
    availablePeriod: '2022/11/04 ~ 2022/11/04',
    couponCode: '00214322',
    operation_type: undefined,
  };
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
  EDIT = 'edit',
}

export type Mode = MODE_MODAL.ADD | MODE_MODAL.EDIT;

/**
 * SC96: The page describes category discount setting receipt coupon, it can create/update receipt coupon
 *
 * @returns {JSX.Element} The category discount receipt coupon setting page
 */
const CategoryDiscountReceiptCouponSettings = (): JSX.Element => {
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const receiptCouponRef = useRef(null);

  // State
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setModal] = useState<Mode>(MODE_MODAL.ADD);
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores)?.filter((item: IStoreInfo) =>
    selectedStores.includes(item.store_code)
  );
  const userRole = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const [clearData, setClearData] = useState<boolean>(false);

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
        header: 'categoryDiscountReceiptCouponSettings.table.no',
        accessorKey: 'no',
        size: 4,
        textAlign: 'center',
      },
      {
        header: 'categoryDiscountReceiptCouponSettings.table.storeCode',
        accessorKey: 'storeCode',
        size: 19,
        type: 'text',
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.title',
        accessorKey: 'title',
        size: 19,
        disabled: false,
        type: 'text',
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.printingAgency',
        accessorKey: 'printingAgency',
        size: 22,
        disabled: false,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.availablePeriod',
        accessorKey: 'availablePeriod',
        size: 22,
        textAlign: 'left',
      },
      {
        header: 'receiptCouponSetting.table.couponCode',
        accessorKey: 'couponCode',
        size: 14,
        textAlign: 'left',
      },
    ];
  }, []);

  // Handle change store
  useEffect(() => {
    if (selectedStores.includes(STORE_09999)) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [selectedStores[0]]);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleSelectedStores = (stores: IStoreInfo[]): void => {
    setValue('excludedStores', stores);
  };

  // F11 Confirm
  const handleConfirmAction = () => { };

  const focusFirstElement = () => {
    setTimeout(() => {
      const element = getFocusableElements(receiptCouponRef.current) as unknown as HTMLElement[];
      if (element === null) {
        return;
      }
      element[0]?.focus();
    }, 500);
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
      add: {},
    });
  };

  const isDisabledConfirm = useMemo(() => {
    return getValues('excludedStores')?.length === 0;
  }, [watch('excludedStores')]);

  const isDisabledSearchCondition = useMemo(() => {
    return isNullOrEmpty(stores) || stores.length === 0;
  }, [stores]);

  const isDisabledButtonDeleteEdit = useMemo(() => {
    return isNullOrEmpty(watch('selectedRows')?.[0]) || stores.length < 1;
  }, [watch('selectedRows'), stores]);

  // TODO: Get list store
  const LIST_STORE: IDropDownItem[] = useMemo(() => {
    return stores.map((store) => {
      return {
        name: store.store_name,
        value: store.store_code,
        code: store.store_code,
      };
    });
  }, [stores]);

  const handleClearData = (checkedStores: string[]) => {
    reset();
    setClearData(!clearData);
    // Call API get
    if (checkedStores[0] === '00005' || checkedStores.length === 0) {
      setValue('listData', null);
    } else {
      setValue('listData', LIST_DATA);
    }
  };

  // Handle call search when role == user ( auto call because does not have multi store)
  useEffect(() => {
    if (userRole !== USER_ROLE.ADMIN && !isNullOrEmpty(selectedStores)) {
      setValue('listData', LIST_DATA);
      focusFirstElement();
    }
  }, [selectedStores]);

  return (
    <FormProvider {...formConfig}>
      <div className="category-discount-receipt-coupon-settings">
        <Header
          csv={{ disabled: false }}
          printer={{ disabled: true }}
          title={translate('categoryDiscountReceiptCouponSettings.title')}
          hasESC={true}
        />
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={focusFirstElement}
          selectMultiple
          clearData={() => handleClearData}
          hasData={watch('listData')?.length > 0}
          actionConfirm={(checkedStores) => handleClearData(checkedStores)}
        />
        {showModal && <ReceiptCouponModal isEdit={mode === MODE_MODAL.EDIT} closeModal={handleCloseModal} />}

        {/* Input search */}
        <div className={'category-discount-receipt-coupon-settings__search'} ref={receiptCouponRef}>
          <div className={`category-discount-receipt-coupon-settings__store`}>
            {/* 店名 */}
            <SelectControl
              label="categoryDiscountReceiptCouponSettings.searchCondition.store"
              name={'searchCondition.store'}
              items={LIST_STORE || []}
              onChange={(e) => e.value}
              value={getValues('searchCondition.store')}
              hasBlankItem={true}
              disabled={isDisabledSearchCondition}
            />
          </div>
          <div className={'category-discount-receipt-coupon-settings__input-title'}>
            <TooltipInputTextControl
              name="searchCondition.title"
              className="input-condition-keyword element-focus"
              title={'categoryDiscountReceiptCouponSettings.searchCondition.title'}
              width={'100%'}
              maxLength={50}
              errorPlacement="left"
              disabled={isDisabledSearchCondition}
            />
          </div>
          <div className={'category-discount-receipt-coupon-settings__input-coupon'}>
            <TooltipNumberInputTextControl
              label={'categoryDiscountReceiptCouponSettings.searchCondition.couponCode'}
              name={'searchCondition.couponCode'}
              width={'150px'}
              maxLength={8}
              addZero={true}
              type="number"
              disabled={isDisabledSearchCondition}
            />
            <FuncKeyDirtyCheckButton
              text="action.f12Search"
              funcKey={'F12'}
              onClickAction={() => {
                handleConfirmAction();
              }}
              disabled={isDisabledSearchCondition}
              funcKeyListener={selectedStores}
            />
          </div>
        </div>
        {/* Table */}
        <div
          className={`category-discount-receipt-coupon-settings-table ${LIST_DATA.length >= LIMIT_RECORD ? 'category-discount-receipt-coupon-settings-table-exceed' : ''}`}
        >
          <div>
            {LIST_DATA.length >= LIMIT_RECORD && (
              <div className="category-discount-receipt-coupon-settings-table__error">
                <span className="category-discount-receipt-coupon-settings-table_limit_record">
                  {localizeFormat('MSG_INFO_001', LIMIT_RECORD, LIMIT_RECORD)}
                </span>
              </div>
            )}
            <TableData<ReceiptCoupon>
              data={watch('listData') ?? []}
              columns={columns}
              multiRowSelection={false}
              onDoubleClick={() => handleOpenModal()}
              showNoData={stores.length > 0}
            />
          </div>
          <div className={'category-discount-receipt-coupon-settings-right'}>
            {isVisible && (
              <ExcludedStore
                onClickSearch={() => { }}
                selectMultiple={true}
                selectedExcludedStores={handleSelectedStores}
                clearData={clearData}
              />
            )}
          </div>
        </div>
        <BottomButton
          confirmAction={handleConfirmAction}
          disableDelete={isDisabledButtonDeleteEdit}
          disableConfirm={isDisabledConfirm}
          disableAdd={stores.length < 1}
          disableEdit={isDisabledButtonDeleteEdit}
          deleteAction={() => { }}
          editAction={() => handleOpenModal()}
          addAction={() => handleOpenModal(MODE_MODAL.ADD)}
        />
      </div>
    </FormProvider>
  );
};

export default CategoryDiscountReceiptCouponSettings;
