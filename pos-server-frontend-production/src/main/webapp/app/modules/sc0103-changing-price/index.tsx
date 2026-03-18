import React, { useEffect, useRef } from 'react';
import { translate } from 'react-jhipster';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

// Component
import Header from '@/components/header/header';
import ActionsButtonBottom from '@/components/bottom-button/actions-button-bottom';
import InputControl from '@/components/control-form/input-control';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { PopoverTextControl } from 'app/components/popover/popover';

// Redux
import { useAppDispatch } from '@/config/store';
import { setReloadDataProduct } from 'app/reducers/product-management-reducer';
import { selectStore } from 'app/reducers/store-reducer';

// Styles
import './styles.scss';

import { focusElementByName, getGroupCode, getProductCode, isEqual, localizeString } from 'app/helpers/utils';
import { updateForePrice } from 'app/services/force-price-list-service';
import { getForcePriceExport, IForcePriceExportParam } from 'app/services/force-price-export-service';
import { useAppSelector } from 'app/config/store';
import { saveAs } from 'file-saver';

interface FormData {
  groupCodeLevel1: string;
  productionCode: string;
  pluCode: string;
  productionName: string;
  todayPrice: number;
  standardPrice: number;
}

export interface IForcePriceUpdate {
  selected_store?: string;
  item_code?: string;
  force_price?: number;
  id_delete_flag?: boolean;
}

const DEFAULT_VALUE: FormData = {
  groupCodeLevel1: '',
  productionCode: '',
  pluCode: '',
  productionName: '',
  todayPrice: null,
  standardPrice: null,
};

/**
 * SC0103: Change selling price immediately
 *
 * @returns {JSX.Element} The page for change price screen
 */
const ChangingPrice = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const query = location.state;
  const isEdit = query?.force_price > 0;
  const locale = useAppSelector(state => state.locale.currentLocale)

  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
  });

  const { setValue, handleSubmit, getValues } = formConfig;
  const disableAction = !query || isEqual(formConfig.watch('todayPrice'), query?.force_price);

  useEffect(() => {
    dispatch(setReloadDataProduct(false));
    if (!query) return;
    setValue('groupCodeLevel1', getGroupCode(query?.my_company_code));
    setValue('productionCode', getProductCode(query?.my_company_code));
    setValue('pluCode', query?.item_code);
    setValue('productionName', query?.description);
    setValue('standardPrice', query?.unit_price);
    setValue('todayPrice', query?.force_price);
    dispatch(selectStore(query.store_code));
    focusElement();
  }, []);

  const focusElement = () => {
    setTimeout(() => {
      const element = document.querySelector(`[name="todayPrice"]`) as unknown as HTMLInputElement;
      element.focus();
    }, 50);
  };

  const handleConfirmAction = (data: FormData) => {
    const dataUpdate: IForcePriceUpdate = {
      selected_store: query?.store_code,
      item_code: data?.pluCode,
      force_price: data?.todayPrice,
    };
    apiUpdateData(dataUpdate);
  };

  const deleteData = () => {
    const data: FormData = getValues();
    const dataUpdate: IForcePriceUpdate = {
      selected_store: query?.store_code,
      item_code: data?.pluCode,
      force_price: query?.force_price,
      id_delete_flag: true,
    };
    apiUpdateData(dataUpdate);
  };

  const apiUpdateData = (dataUpdate: IForcePriceUpdate) => {
    dispatch(updateForePrice({ force_prices: [dataUpdate] }))
      .unwrap()
      .then(() => {
        dispatch(setReloadDataProduct(true));
        navigate(-1);
      })
      .catch(() => {});
  };

  const handleClearData = () => {
    setValue('todayPrice', query?.force_price);
    setTimeout(() => {
      focusElementByName('todayPrice', true);
    }, 50);
  };

  const printPDF = () => {
    const param: Readonly<IForcePriceExportParam> = {
      selected_store: query?.store_code,
      lang: locale,
      plu: query?.item_code
    }

    dispatch(getForcePriceExport(param))
      .unwrap()
      .then(response => {
        const fileName = `${localizeString('forcePriceChange.pdfFile')}_${query?.store_code}.pdf`;
        saveAs(response.blob, fileName);
      }).catch(() => {});
  }

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <Header
        title='forcePriceChange.title'
        csv={{
          disabled: true,
        }}
        printer={{ disabled: !isEdit, action: printPDF }}
        hasESC={true}
        mode={isEdit ? 'edit' : 'add'}
      />

      <FormProvider {...formConfig}>
        <main className="main-container changing-price">
          <div className="changing-price__action">
            <div className="changing-price__action-item">
              {/* Group Code Level 1 - 従業員コード */}
              <InputControl
                name="groupCodeLevel1"
                className="input-condition-keyword element-focus"
                labelText={translate('label.productionCode')}
                widthInput={'14%'}
                heightInput={'50px'}
                disabled={true}
                isRequire={true}
                maxLength={2}
              />

              {/* Production Code - 商品コード＊*/}
              <InputControl
                name="productionCode"
                className="input-condition-keyword element-focus"
                // labelText={translate('label.productionCode')}
                widthInput={'7%'}
                heightInput={'50px'}
                maxLength={50}
                disabled={true}
                isRequire
              />

              {/* PLU Code - PLUコード */}
              <InputControl
                name="pluCode"
                className="input-condition-keyword element-focus"
                labelText={'label.pluCode'}
                widthInput={'calc(24% - 32px)'}
                heightInput={'50px'}
                maxLength={50}
                disabled={true}
                isRequire
              />
            </div>

            <div className="changing-price__action-item">
              {/* Production Name - 商品名称 */}
              <PopoverTextControl name="productionName" className="product-name" label={'label.productionName'} />

              {/* Today Price - 本日売価* */}
              <TooltipNumberInputTextControl
                name="todayPrice"
                className="input-condition-keyword element-focus changing-price__force-price"
                label={'label.todayPrice'}
                height={'50px'}
                maxLength={6}
                required
                disabled={!query}
                textAlign="right"
                thousandSeparator=","
                minValue={1}
                localizeKey="label.todayPrice"
              />

              {/* Standard Price - 定番売価 */}
              <TooltipNumberInputTextControl
                name="standardPrice"
                className="input-condition-keyword element-focus changing-price__force-price"
                label="label.standardPrice"
                height={'50px'}
                maxLength={50}
                disabled={true}
                textAlign="right"
                thousandSeparator=","
              />
            </div>
          </div>
        </main>
        <ActionsButtonBottom
          disableClear={disableAction}
          deleteAction={deleteData}
          disableDelete={!isEdit}
          clearAction={handleClearData}
          confirmAction={() => {
            handleSubmit(handleConfirmAction)();
          }}
          disableConfirm={disableAction}
        />
      </FormProvider>
    </div>
  );
};
export default ChangingPrice;
