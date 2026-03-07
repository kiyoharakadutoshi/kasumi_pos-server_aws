/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { translate } from 'react-jhipster';
import { number, object, string, ValidationError } from 'yup';

// Redux
import { useAppDispatch, useAppSelector } from '@/config/store';
import { IStoreInfo } from '@/reducers/store-reducer';

// Component
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import RadioControl from '@/components/control-form/radio-control';
import SelectControl from '@/components/control-form/select-control';
import DateTimeStartEndControl from '@/components/date-picker/date-time-start-end-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import { CollapseIcon, ExpandIcon } from '@/components/icons';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import ModalCommon, { IModalInfo } from '@/components/modal/modal-common';
import { IRadioButtonValue } from '@/components/radio-button-component/radio-button';
import TableData, { RowBase, TableColumnDef } from '@/components/table/table-data/table-data';

// Modules
import { CouponSetting, DEFAULT_COUPON_SETTING_VALUE, ReceiptCoupon, ReceiptCouponSettingFormData } from '..';
import { transformData } from './transformData';
import { setStatusChoiceAll } from './updateStatusChoice';

// API
import { getHierarchyLevel } from '@/services/hierarchy-level-service';

// Utils
import { focusElementByName, localizeFormat, localizeString } from '@/helpers/utils';

// Styles
import './styles.scss';

export interface IMasterCategory extends RowBase {
  /*  */
  choice?: boolean;
  code_level_one?: any;
  code_level_two?: any;
  code_level_three?: any;
  code_level_four?: any;
  description_level_one?: string;
  description_level_two?: string;
  description_level_three?: string;
  description_level_four?: string;
  company_code?: number;
  store_code?: string;
  discount_md_hierarchy_code?: string;
  md_hierarchy_code?: string;
  md_hierarchy_level?: string;
  apply_date_time?: string;
  description?: string;
  status?: any;
  start_date_time?: string;
  end_date_time?: string;
  start_service_time?: string;
  end_service_time?: string;
  time_service?: number;
  discount_type_code?: number;
  discount_value?: number;
  avaliable_status?: boolean;
}

interface DefaultModalProps {
  isEdit?: boolean;
  closeModal?: () => void;
  showModal?: boolean;
  selectedRow?: ReceiptCoupon;
}

const COUPON_DEMO_EDIT_MODE: CouponSetting = {
  store: '00002',
  title: 'テストクーポン',
  printingPeriod: {
    startDate: '2025/05/11',
    startTime: '09:00',
    endDate: '2025/05/11',
    endTime: '09:00',
  },
  availabilityPeriod: {
    startDate: '2025/05/11',
    startTime: '09:00',
    endDate: '2025/05/11',
    endTime: '09:00',
  },
  couponCode: '01111111111',
  categoryCode: '01',
  frontSide: {
    message: 1,
  },
  backSide: {
    title: 'クーポン詳細',
    message: 1,
  },
  updateDate: '2025/05/01',
  updateBy: 'LUVINA01',
  listHierarchyLevel: null,
};

const MAPPING_ERROR = (mode: string) => ({
  [`${mode}.store`]: '店舗',
  [`${mode}.title`]: 'タイトル',
  [`${mode}.couponCode`]: 'クーポン券コード',
  [`${mode}.categoryCode`]: 'カテゴリ',
  [`${mode}.backSide.title`]: '裏面 : タイトル',
  [`${mode}.printingPeriod.startDate`]: '印字期間',
  [`${mode}.printingPeriod.startTime`]: '印字期間',
  [`${mode}.printingPeriod.endDate`]: '印字期間',
  [`${mode}.printingPeriod.endTime`]: '印字期間',
  [`${mode}.availabilityPeriod.startDate`]: '利用可能期間',
  [`${mode}.availabilityPeriod.startTime`]: '利用可能期間',
  [`${mode}.availabilityPeriod.endDate`]: '利用可能期間',
  [`${mode}.availabilityPeriod.endTime`]: '利用可能期間',
  [`${mode}.frontSide.message`]: '表面: メッセージ',
  [`${mode}.backSide.message`]: '裏面: メッセージ',
});

const AVALIABLE_STATUS: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'categoryDiscountReceiptCouponSettings.modal.yes',
    disabled: false,
  },
  {
    id: 1,
    textValue: 'categoryDiscountReceiptCouponSettings.modal.no',
    disabled: false,
  },
];

/**
 * The receipt coupon modal used to edit/add receipt coupon
 *
 * @param {function} closeModal The function used to close modal
 * @param {boolean} isEdit The mode for modal: Edit or Add receipt coupon
 * @returns {JSX.Element} The receipt coupon modal
 */
const ReceiptCouponModal: React.FC<DefaultModalProps> = ({ closeModal, isEdit }: DefaultModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const formContext = useFormContext<ReceiptCouponSettingFormData>();
  const { getValues, setValue, setError, watch } = formContext;

  const [modalInfo] = useState<IModalInfo>({ isShow: false });
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores);
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores)?.filter((item: IStoreInfo) =>
    selectedStores.includes(item.store_code)
  );
  const [statusChoice, setStatusChoice] = useState(false);

  const modeStatus = useMemo(() => {
    return isEdit ? 'edit' : 'add';
  }, [isEdit]);
  const listHierarchyLevel = watch(`${modeStatus}.listHierarchyLevel`);

  const [isShowCategoryTable, setIsShowCategoryTable] = useState(false);

  const objectValidateDatetime = object().shape({
    startDate: string().required('MSG_VAL_001'),
    startTime: string().required('MSG_VAL_001'),
    endDate: string().required('MSG_VAL_001'),
    endTime: string().required('MSG_VAL_001'),
  });

  const validationSchema2 = object<CouponSetting>().shape({
    add: object().shape({
      store: string().required('MSG_VAL_001'),
      title: string().required('MSG_VAL_001'),
      couponCode: string().required('MSG_VAL_001'),
      frontSide: object().shape({
        message: number().required('MSG_VAL_001'),
      }),
      backSide: object().shape({
        title: string().required('MSG_VAL_001'),
        message: number().required('MSG_VAL_001'),
      }),
      printingPeriod: objectValidateDatetime,
      availabilityPeriod: objectValidateDatetime,
    }),
  });

  const validationSchema = object<CouponSetting>().shape({
    edit: object().shape({
      store: string().required('MSG_VAL_001'),
      title: string().required('MSG_VAL_001'),
      couponCode: string().required('MSG_VAL_001'),
      frontSide: object().shape({
        message: number().required('MSG_VAL_001'),
      }),
      backSide: object().shape({
        title: string().required('MSG_VAL_001'),
        message: number().required('MSG_VAL_001'),
      }),
      printingPeriod: objectValidateDatetime,
      availabilityPeriod: objectValidateDatetime,
    }),
  });

  const handleConfirmButton = async () => {
    try {
      if (isEdit) {
        await validationSchema.validate(
          {
            edit: getValues('edit'),
          },
          { abortEarly: false }
        );
      } else {
        await validationSchema2.validate(
          {
            add: getValues('add'),
          },
          { abortEarly: false }
        );
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        e.inner?.forEach((item) => {
          const fieldName = item.path ?? '';
          setError(fieldName as keyof ReceiptCouponSettingFormData, {
            message: localizeFormat(e.inner[0].message, MAPPING_ERROR(isEdit ? 'edit' : 'add')[fieldName]),
          });
        });

        focusElementByName(e.inner?.[0]?.path);
        return;
      }
    }
  };

  // Handle space and tab
  const handleOnKeyDownExpand = (e, row) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      row.getToggleExpandedHandler()();
    }
  };

  /**
   * Define column table
   */
  const columns = React.useMemo<TableColumnDef<IMasterCategory>[]>(
    () => [
      {
        accessorKey: '',
        header: ' ',
        size: 6,
        cell: ({ row }) => (
          <div className="button-expanding" tabIndex={0} onKeyDown={(e) => handleOnKeyDownExpand(e, row)}>
            <div>
              {row.getCanExpand() && (
                <div onClick={row.getToggleExpandedHandler()}>
                  {!row.getIsExpanded() ? <ExpandIcon /> : <CollapseIcon />}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'code_level_one',
        header: 'categoryDiscountReceiptCouponSettings.modal.department',
        size: 17,
        type: 'text',
        textAlign: 'left',
        option(props) {
          return {
            value: props.row.original.code_level_one
              ? `${props?.row?.original?.code_level_one} : ${props?.row?.original?.description_level_one}`
              : '-',
          };
        },
      },
      {
        accessorKey: 'code_level_two',
        header: 'categoryDiscountReceiptCouponSettings.modal.group',
        size: 17,
        type: 'text',
        textAlign: 'left',
        option(props) {
          return {
            value: props.row.original.code_level_two
              ? `${props?.row?.original?.code_level_two} : ${props?.row?.original?.description_level_two}`
              : '-',
          };
        },
      },
      {
        accessorKey: 'code_level_three',
        header: 'categoryDiscountReceiptCouponSettings.modal.kind',
        size: 17,
        type: 'text',
        textAlign: 'left',
        option(props) {
          return {
            value: props.row.original.code_level_three
              ? `${props?.row?.original?.code_level_three} : ${props?.row?.original?.description_level_three}`
              : '-',
          };
        },
      },
      {
        accessorKey: 'code_level_four',
        header: 'categoryDiscountReceiptCouponSettings.modal.classification',
        type: 'text',
        size: 17,
        textAlign: 'left',
        option(props) {
          return {
            value: props.row.original.code_level_four
              ? `${props?.row?.original?.code_level_four} : ${props?.row?.original?.description_level_four}`
              : '-',
          };
        },
      },
      {
        accessorKey: 'avaliable_status',
        header: 'categoryDiscountReceiptCouponSettings.modal.avaliableStatus',
        size: 10,
        type: 'radio-expanding',
      },
      {
        accessorKey: 'choice',
        header: 'categoryDiscountReceiptCouponSettings.modal.appliedToLowerHierarchicalLevels',
        size: 16,
        type: 'checkbox-expanding',
      },
    ],
    []
  );

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

  // TODO: Get list message
  const MESSAGE_LIST = Array.from({ length: 4 }).map((__, index) => {
    if (index === 0) {
      return {
        name: '',
        value: null,
        code: null,
      };
    }

    return {
      name: '刺身盛合せ４点盛' + index,
      value: index,
      code: index,
    };
  });

  const confirmButtonStatus = false;

  useEffect(() => {
    if (isEdit) {
      setValue('edit', COUPON_DEMO_EDIT_MODE);
    } else {
      setValue('add', {
        store: selectedStores[0]?.store_code,
        ...DEFAULT_COUPON_SETTING_VALUE,
      });
    }
  }, []);

  const handleGetListHierachy = () => {
    // Clear data in table and mode table before search
    setValue(`${modeStatus}.listHierarchyLevel`, null);
    dispatch(
      getHierarchyLevel({
        level: 1,
        filter_code: getValues(`${modeStatus}.categoryCode`),
      })
    )
      .unwrap()
      .then((res) => {
        const hierarchyLevelData = res?.data?.data;
        if (hierarchyLevelData?.items && hierarchyLevelData?.items?.length > 0) {
          setValue(`${modeStatus}.listHierarchyLevel`, transformData(hierarchyLevelData?.items));
        } else {
          setValue(`${modeStatus}.listHierarchyLevel`, []);
        }
      })
      .then(() => {
        setIsShowCategoryTable(true);
      })
      .catch(() => {});
  };

  return (
    <DefaultModal
      className="receipt-coupon-setting-modal"
      disableConfirm={isEdit && confirmButtonStatus}
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={`label.${isEdit ? 'editMode' : 'createMode'}`}
      cancelAction={closeModal}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      confirmAction={handleConfirmButton}
    >
      <ModalCommon modalInfo={modalInfo} />

      {/* 1. 店舗 */}
      <SelectControl
        label="label.store"
        name={`${modeStatus}.store`}
        items={LIST_STORE || []}
        onChange={(e) => e.value}
        value={getValues(`${modeStatus}.store`)}
        disabled={isEdit}
        isRequired
      />

      {/* 2. タイトル */}
      <TooltipInputTextControl
        name={`${modeStatus}.title`}
        className="input-condition-keyword"
        title={translate('label.title')}
        required={true}
      />

      {/* 3. 印字週間 */}
      <DateTimeStartEndControl
        labelText="label.printingPeriod"
        startDateName={`${modeStatus}.printingPeriod.startDate`}
        startTimeName={`${modeStatus}.printingPeriod.startTime`}
        endDateName={`${modeStatus}.printingPeriod.endDate`}
        endTimeName={`${modeStatus}.printingPeriod.endTime`}
        startDate={getValues(`${modeStatus}.printingPeriod.startDate`)}
        startTime={getValues(`${modeStatus}.printingPeriod.startTime`)}
        endDate={getValues(`${modeStatus}.printingPeriod.endDate`)}
        endTime={getValues(`${modeStatus}.printingPeriod.endTime`)}
        type="secondary"
        required
      />

      {/* 4. 利用可能期間 */}
      <DateTimeStartEndControl
        labelText="label.availabilityPeriod"
        startDateName={`${modeStatus}.availabilityPeriod.startDate`}
        startTimeName={`${modeStatus}.availabilityPeriod.startTime`}
        endDateName={`${modeStatus}.availabilityPeriod.endDate`}
        endTimeName={`${modeStatus}.availabilityPeriod.endTime`}
        startDate={getValues(`${modeStatus}.availabilityPeriod.startDate`)}
        startTime={getValues(`${modeStatus}.availabilityPeriod.startTime`)}
        endDate={getValues(`${modeStatus}.availabilityPeriod.endDate`)}
        endTime={getValues(`${modeStatus}.availabilityPeriod.endTime`)}
        type="secondary"
        required
      />

      {/* 5. クーポン券コード */}
      <div className="default-modal-container__modal-body__coupon-code">
        <TooltipNumberInputTextControl
          name={`${modeStatus}.couponCode`}
          className="input-condition-keyword"
          label={translate('label.couponCode')}
          maxLength={8}
          disabled={isEdit}
          addZero={true}
          required
        />
        <div className="default-modal-container__modal-body__coupon-code__category-search">
          <TooltipNumberInputTextControl
            name={`${modeStatus}.categoryCode`}
            className="input-condition-keyword element-focus"
            width={'100px'}
            maxLength={2}
            addZero={true}
            errorPlacement="left"
          />
          <ButtonPrimary
            text={localizeString('productReport.conditionSearchLabel.search')}
            onClick={handleGetListHierachy}
          />
        </div>
      </div>

      {/* 6. 表面 */}
      <div className="front-side-box">
        <label>表面</label>
        {/* メッセージ */}
        <SelectControl
          label="label.message"
          name={`${modeStatus}.frontSide.message`}
          items={MESSAGE_LIST || []}
          onChange={(e) => e.value}
          value={getValues(`${modeStatus}.frontSide.message`)}
          isRequired
        />
      </div>

      {/* 7. 裏面 */}
      <div className="back-side-box">
        <label>裏面</label>
        {/* タイトル */}
        <TooltipInputTextControl
          name={`${modeStatus}.backSide.title`}
          className="input-condition-keyword"
          title={translate('label.title')}
          maxLength={50}
          required
        />

        {/* 8. メッセージ */}
        <SelectControl
          label="label.message"
          name={`${modeStatus}.backSide.message`}
          items={MESSAGE_LIST || []}
          onChange={(e) => e.value}
          value={getValues(`${modeStatus}.backSide.message`)}
          // disabled={isEdit}
          isRequired
        />
      </div>

      {/* 9. 更新日 */}
      <TooltipInputTextControl
        name={`${modeStatus}.updateDate`}
        className="input-condition-keyword"
        title={translate('label.updateDate')}
        maxLength={50}
        disabled
      />

      {/* 10. 更新者 */}
      <TooltipInputTextControl
        name={`${modeStatus}.updateBy`}
        className="input-condition-keyword"
        title={translate('label.updateBy')}
        maxLength={50}
        disabled
      />

      {/* 11. Select/Unselect options */}
      {isShowCategoryTable && (
        <div className="wrap-search-category">
          <div className="wrap-search-category__note">
            <RadioControl
              isVertical={false}
              name="searchCondition.businessType"
              listValues={AVALIABLE_STATUS}
              disabled={true}
            />
          </div>

          <ButtonPrimary
            text="masterCategory.button.checkBoxAll"
            onClick={() => {
              const dataUpdate = setStatusChoiceAll(getValues(`${modeStatus}.listHierarchyLevel`), !statusChoice);
              setValue(`${modeStatus}.listHierarchyLevel`, dataUpdate);
              setStatusChoice(!statusChoice);
            }}
          />
        </div>
      )}

      {/* 12. Table */}
      {isShowCategoryTable && (
        <TableData<IMasterCategory>
          data={listHierarchyLevel}
          columns={columns}
          tableKey={`${modeStatus}.listHierarchyLevel`}
          enableSelectRow={false}
          onDoubleClick={() => {}}
          showNoData={true}
          isCalculateHeightTable
        />
      )}
    </DefaultModal>
  );
};

export default ReceiptCouponModal;
