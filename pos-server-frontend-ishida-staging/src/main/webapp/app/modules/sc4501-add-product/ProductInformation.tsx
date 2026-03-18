import SelectControl from '@/components/control-form/select-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { PopoverTextControl } from '@/components/popover/popover';
import { useAppDispatch } from '@/config/store';
import ProductDetailCompare from '@/modules/sc4501-add-product/ProductDetailCompare';
import { getProductExisted } from '@/services/product-service';
import React, { useEffect, useState } from 'react';

import { STORE_CODE_DEFAULT } from '@/constants/constants';
import hierarchyLevel from '@/hooks/hierarchy-level';
import { getListTaxProduct } from '@/services/tax-service';
import { focusElementByNameWithTimeOut, isNullOrEmpty } from 'app/helpers/utils';
import {
  ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS, MEMBER_PRIDE_METHOD_TYPE_OPTIONS,
  SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS,
} from 'app/modules/sc0102-product-detail-setting';
import { IProductDetail } from '../sc0102-product-detail-setting/sc0102-product-detail-interface';

type ProductInformationType = {
  store: string;
  disabledStore?: boolean;
  disabledUser?: boolean;
  formConfig: any;
  hasError: boolean;
};

const ProductInformation = (props: ProductInformationType) => {
  const { disabledUser, formConfig, hasError } = props;
  const { setValue, getValues, watch, clearErrors } = formConfig;
  const dispatch = useAppDispatch();
  const { handleGetListCodeLevel, getDataHierachy } = hierarchyLevel({ formConfig });
  const [previousDetail, setPreviousDetail] = useState<boolean>(false);

  useEffect(() => {
    handleGetListTax();
    handleGetListCodeLevel('One');
  }, [])

  const handleCheckProductExisted = (plu: string) => {
    setValue('hasItemCode', false);
    if (isNullOrEmpty(plu)) return;
    const params = {
      plu
    };
    clearErrors('productInfo');
    dispatch(getProductExisted(params))
      .unwrap()
      .then(async (response) => {
        const detail = response?.data.data;
        if (detail === null) {
          if (hasError === true || previousDetail === true) {
            setPreviousDetail(false);
            setValue('productInfo', getValues('productInfoDefault'));
            setValue('productInfo.item_code', plu);
          }
        } else {
          setPreviousDetail(true);
          const dataHierachy = await getDataHierachy(detail);
          const data: IProductDetail = {
            ...detail,
            code_level_one: dataHierachy.codeLevelOne,
            code_level_two: dataHierachy.codeLevelTwo,
            code_level_three: dataHierachy.codeLevelThree,
            code_level_four: dataHierachy.codeLevelFour,
            is_sub_total_discount: detail?.is_sub_total_discount ?? 0,
            is_item_manual_discount: detail?.is_item_manual_discount ?? 0,
            membership_price_type: detail?.membership_price_type ?? 1,
            tax_group_code: detail.tax_group_code ?? getValues('listTax')?.[0]?.value as string,
            tax_rate: detail.tax_rate ?? (getValues('listTax')?.[0])?.rate ?? null,
          };
          setValue('productInfo', data);
          setValue('productInfo.my_company_code', detail.my_company_code.slice(-6));
        }
      })
      .catch(() => { });
  };


  const handleGetListTax = () => {
    dispatch(getListTaxProduct({ selected_store: STORE_CODE_DEFAULT }))
      .unwrap()
      .then((response) => {
        const listTax = response.data.data?.items.map((item) => ({
          value: item.code,
          name: item.description,
          rate: item.rate,
        }));

        setValue('listTax', listTax);
        const firstTax = listTax?.[0];
        setValue('productInfo.tax_group_code', firstTax?.value);
        setValue('productInfo.tax_rate', firstTax?.rate);

        setValue('productInfoDefault.tax_group_code', firstTax?.value);
        setValue('productInfoDefault.tax_rate', firstTax?.rate);
      })
      .catch(() => { });
  };

  return (
    <div className="add-new-product__col product-info">
      <div className="add-new-product__title">商品情報</div>
      <div className="add-new-product__content pr-16">
        {/* 1. 商品コード */}
        <TooltipNumberInputTextControl
          name="productInfo.my_company_code"
          label={'商品コード'}
          width={'100%'}
          height={'50px'}
          maxLength={6}
          disabled={disabledUser}
          addZero={true}
          required
        />
        {/* 2. PLUコード */}
        <TooltipNumberInputTextControl
          name="productInfo.item_code"
          label={'PLUコード'}
          width={'100%'}
          height={'50px'}
          maxLength={13}
          disabled={disabledUser}
          addZero={true}
          required
          focusOut={(value: string) => handleCheckProductExisted(value)}
          onMaxLength={() => focusElementByNameWithTimeOut('productInfo.code_level_one', 50)}
          focusOutWhenDataNotChanged={false}
        />

        {/* 5. 部門 */}
        <SelectControl
          name="productInfo.code_level_one"
          label={'部門'}
          className="element-focus"
          itemsName="listCodeLevelOne"
          isHiddenCode={false}
          disabled={disabledUser}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_two');
            handleGetListCodeLevel('Two', item.code, "1")
          }}
        />

        {/* 6. 品群 */}
        <SelectControl
          name="productInfo.code_level_two"
          label={'品群'}
          className="element-focus"
          itemsName="listCodeLevelTwo"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(getValues('productInfo.code_level_one'))}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_three');
            handleGetListCodeLevel('Three', item.code, "2")
          }}
        />

        {/* 7. 品種 */}
        <SelectControl
          name="productInfo.code_level_three"
          label={'品種'}
          className="element-focus"
          itemsName="listCodeLevelThree"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(getValues('productInfo.code_level_two'))}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_four');
            handleGetListCodeLevel('Four', item.code, "3")
          }
          }
        />

        {/* 8. 分類 */}
        <SelectControl
          name="productInfo.code_level_four"
          label={'分類'}
          className="element-focus"
          itemsName="listCodeLevelFour"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(watch('productInfo.code_level_three'))}
          hasBlankItem={true}
        />

        {/* 3. 税種別コード */}
        <div className="add-new-product__group-sub-pulldown">
          <SelectControl
            name="productInfo.tax_group_code"
            label={'税種別コード'}
            className="element-focus"
            itemsName="listTax"
            isHiddenCode={true}
            disabled={disabledUser}
            isRequired
            onChange={(item: any) => setValue('productInfo.tax_rate', item.rate)}
          />
        </div>

        {/* 4. 税率 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.tax_rate"
            className="input-subtext"
            label={'税率'}
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={true}
            textAlign="right"
          />
          <div>%</div>
        </div>

        {/* 9. 単価 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.unit_price" // unit_price DO NOT REMOVE this comment
            className="input-subtext"
            label={'単価'}
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={disabledUser}
            required
            thousandSeparator=","
            textAlign="right"
            localizeKey="単価"
          />
        </div>

        {/* 10. 会员売価 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.member_price"
            className="input-subtext"
            label="会員価格"
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={disabledUser}
            required
            textAlign="right"
            thousandSeparator=","
            localizeKey="会員価格"
          />
        </div>

        {/* 12. 商品名称 */}
        <TooltipInputTextControl
          name="productInfo.product_name"
          title={'商品名称'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disabledUser}
          required
          localizeKey="商品名称"
          hasTrimSpace
        />

        {/* 13. レシート商品名称 */}
        <TooltipInputTextControl
          name="productInfo.receipt_name"
          title={'レシート商品名称'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disabledUser}
          required
          localizeKey="レシート商品名称"
          hasTrimSpace
        />

        {/* 15. 単品値引き除外 */}
        <SelectControl
          label={'単品値引き除外'}
          name="productInfo.is_item_manual_discount"
          items={ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 16. 小計マニュアル値引き除外 */}
        <SelectControl
          label={'小計マニュアル値引き除外'}
          name="productInfo.is_sub_total_discount"
          items={SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 17. 会員価格方式 */}
        <SelectControl
          label={'会員価格方式'}
          name="productInfo.membership_price_type"
          items={MEMBER_PRIDE_METHOD_TYPE_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 18. 登録日 */}
        <PopoverTextControl label={'登録日'} name="productInfo.create_date" />

        {/* 19. 登録者 */}
        <PopoverTextControl label={'登録者'} name="productInfo.created_by" />
        <ProductDetailCompare />
      </div>
    </div>
  );
};

export default ProductInformation;
