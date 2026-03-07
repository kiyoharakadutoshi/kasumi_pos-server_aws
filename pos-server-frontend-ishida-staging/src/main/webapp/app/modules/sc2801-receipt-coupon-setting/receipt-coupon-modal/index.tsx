import React, { useEffect, useMemo, useState } from 'react';
import { translate } from 'react-jhipster';
import { useFormContext } from 'react-hook-form';
import { number, object, string, ValidationError } from 'yup';

// Redux
import { useAppSelector } from '@/config/store';
import { IStoreInfo } from '@/reducers/store-reducer';

// Component
import ModalCommon, { IModalInfo } from '@/components/modal/modal-common';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import SelectControl from '@/components/control-form/select-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import DateTimeStartEndControl from '@/components/date-picker/date-time-start-end-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

// API
import { CouponSetting, DEFAULT_COUPON_SETTING_VALUE, ReceiptCoupon, ReceiptCouponSettingFormData } from '..';

// Utils
import { focusElementByName, localizeFormat } from '@/helpers/utils';

// Styles
import './styles.scss';

interface DefaultModalProps {
  isEdit?: boolean;
  closeModal?: () => void;
  showModal?: boolean;
  selectedRow?: ReceiptCoupon;
}

const COUPON_DEMO: CouponSetting = {
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
  frontSide: {
    message: 1
  },
  backSide: {
    title: 'クーポン詳細',
    message: 1
  },
  updateDate: '2025/05/01',
  updateBy: 'LUVINA01'
}

const MAPPING_ERROR = (mode: string) => ({
  [`${mode}.store`]: '店舗',
  [`${mode}.title`]: 'タイトル',
  [`${mode}.couponCode`]: 'クーポン券コード',
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

/**
 * The receipt coupon modal used to edit/add receipt coupon
 * 
 * @param {function} closeModal The function used to close modal 
 * @param {boolean} isEdit The mode for modal: Edit or Add receipt coupon
 * @returns {JSX.Element} The receipt coupon modal
 */
const ReceiptCouponModal
  : React.FC<DefaultModalProps> = ({
    closeModal,
    isEdit,
  }: DefaultModalProps): JSX.Element => {
    const [modalInfo] = useState<IModalInfo>({ isShow: false });
    const selectedStores = useAppSelector(
      (state) => state.storeReducer.selectedStores
    );
    const stores: IStoreInfo[] = useAppSelector(
      (state) => state.storeReducer.stores
    )?.filter((item: IStoreInfo) => selectedStores.includes(item.store_code));
    const formContext = useFormContext<ReceiptCouponSettingFormData>();
    const { getValues, setValue, setError } = formContext;

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
          message: number().required('MSG_VAL_001')
        }),
        backSide: object().shape({
          title: string().required('MSG_VAL_001'),
          message: number().required('MSG_VAL_001')
        }),
        printingPeriod: objectValidateDatetime,
        availabilityPeriod: objectValidateDatetime
      })
    });

    const validationSchema = object<CouponSetting>().shape({
      edit: object().shape({
        store: string().required('MSG_VAL_001'),
        title: string().required('MSG_VAL_001'),
        couponCode: string().required('MSG_VAL_001'),
        frontSide: object().shape({
          message: number().required('MSG_VAL_001')
        }),
        backSide: object().shape({
          title: string().required('MSG_VAL_001'),
          message: number().required('MSG_VAL_001')
        }),
        printingPeriod: objectValidateDatetime,
        availabilityPeriod: objectValidateDatetime
      })
    });

    const handleConfirmButton = async () => {
      try {
        if (isEdit) {
          await validationSchema.validate({
            edit: getValues('edit')
          }, { abortEarly: false });
        } else {
          await validationSchema2.validate({
            add: getValues('add')
          }, { abortEarly: false });
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

    // TODO: Get list store
    const LIST_STORE: IDropDownItem[] = useMemo(() => {
      return stores.map((store) => {
        return {
          name: store.store_name,
          value: store.store_code,
          code: store.store_code,
        }
      });
    }, [stores]);

    // TODO: Get list message
    const MESSAGE_LIST = Array.from({ length: 4 }).map((__, index) => {
      if (index === 0) {
        return {
          name: '',
          value: null,
          code: null,
        }
      }

      return {
        name: '刺身盛合せ４点盛' + index,
        value: index,
        code: index,
      }
    });

    const modeStatus = useMemo(() => {
      return isEdit ? 'edit' : 'add';
    }, [isEdit]);

    // const addData = useWatch({
    //   control,
    //   name: 'add',
    // });

    // const editData = useWatch({
    //   control,
    //   name: 'edit',
    // });

    // const editData = watch('edit');
    // const addData = watch('add');

    /**
     * The status of confirm button when change form data
     */
    // const confirmButtonStatus = useMemo(() => {
    //   if (isEdit) {
    //     return _.isEqual(editData, COUPON_DEMO);
    //   }
    //   return _.isEqual(addData, DEFAULT_VALUE.add);
    // }, [editData, addData]);

    const confirmButtonStatus = false;

    useEffect(() => {
      if (isEdit) {
        setValue('edit', COUPON_DEMO);
      } else {
        setValue('add', {
          store: selectedStores[0]?.store_code,
          ...DEFAULT_COUPON_SETTING_VALUE
        })
      }
    }, []);

    return (
      <DefaultModal
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
          labelText='label.printingPeriod'
          startDateName={`${modeStatus}.printingPeriod.startDate`}
          startTimeName={`${modeStatus}.printingPeriod.startTime`}
          endDateName={`${modeStatus}.printingPeriod.endDate`}
          endTimeName={`${modeStatus}.printingPeriod.endTime`}
          startDate={getValues(`${modeStatus}.printingPeriod.startDate`)}
          startTime={getValues(`${modeStatus}.printingPeriod.startTime`)}
          endDate={getValues(`${modeStatus}.printingPeriod.endDate`)}
          endTime={getValues(`${modeStatus}.printingPeriod.endTime`)}
          // onChangeStartDate={(date) => convertDateServer(date)}
          // onChangeEndDate={(date) => convertDateServer(date)}
          type='secondary'
          required
        />

        {/* 4. 利用可能期間 */}
        <DateTimeStartEndControl
          labelText='label.availabilityPeriod'
          startDateName={`${modeStatus}.availabilityPeriod.startDate`}
          startTimeName={`${modeStatus}.availabilityPeriod.startTime`}
          endDateName={`${modeStatus}.availabilityPeriod.endDate`}
          endTimeName={`${modeStatus}.availabilityPeriod.endTime`}
          startDate={getValues(`${modeStatus}.availabilityPeriod.startDate`)}
          startTime={getValues(`${modeStatus}.availabilityPeriod.startTime`)}
          endDate={getValues(`${modeStatus}.availabilityPeriod.endDate`)}
          endTime={getValues(`${modeStatus}.availabilityPeriod.endTime`)}
          type='secondary'
          required
        />

        {/* 5. クーポン券コード */}
        <TooltipNumberInputTextControl
          name={`${modeStatus}.couponCode`}
          className="input-condition-keyword"
          label={translate('label.couponCode')}
          maxLength={8}
          disabled={isEdit}
          addZero={true}
          required
        />

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
      </DefaultModal>
    );
  };

export default ReceiptCouponModal;
