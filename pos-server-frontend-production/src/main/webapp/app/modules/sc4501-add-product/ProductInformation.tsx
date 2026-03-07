import React from 'react';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import SelectControl from '@/components/control-form/select-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import ProductDetailCompare from '@/modules/sc4501-add-product/ProductDetailCompare';
import { PopoverTextControl } from '@/components/popover/popover';
import { productExisted } from '@/services/product-service';
import { useAppDispatch, useAppSelector } from '@/config/store';
import hierarchyLevel from '@/hooks/hierarchy-level';

import { focusElementByNameWithTimeOut, isNullOrEmpty } from 'app/helpers/utils';
import {
  ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS, MEMBER_PRIDE_METHOD_TYPE_OPTIONS,
  SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS,
} from 'app/modules/sc0102-product-detail-setting';

type ProductInformationType = {
  store: string;
  disabledStore?: boolean;
  disabledUser?: boolean;
  formConfig: any;
};

const ProductInformation = (props: ProductInformationType) => {
  const { store, disabledUser, formConfig } = props;
  const { setValue } = formConfig;
  const dispatch = useAppDispatch();
  const { getIHierarchyLevel, blurInput } = hierarchyLevel({ store, formConfig });
  const stores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);

  const handleCheckProductExisted = (plu: string) => {
    setValue('hasItemCode', false);

    if (isNullOrEmpty(plu)) return;

    const params = {
      selected_stores: stores?.[0],
      plu,
    };

    dispatch(productExisted(params))
      .unwrap()
      .then(() => {
        setValue('errorItemCode', null);
      })
      .catch((error) => {
        if (!error?.validate) return;
        const errorPlu = error?.validate['plu']?.[0];
        if (isNullOrEmpty(errorPlu)) return;

        formConfig.setError(`productInfo.item_code`, { message:  errorPlu});
        formConfig.setValue('errorItemCode', errorPlu);
      });
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
          onMaxLength={() => focusElementByNameWithTimeOut('productInfo.tax_group_code', 50)}
        />
        {/* 3. 税種別コード */}
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

        {/* 5. 部門 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.code_level_one"
            className="input-subtext"
            label={'部門'}
            height={'50px'}
            maxLength={2}
            disabled={disabledUser}
            required
            addZero={true}
            focusOut={() => getIHierarchyLevel('one')}
            localizeKey="部門"
            onMaxLength={() => blurInput('productInfo.code_level_two')}
            focusOutWhenTabEnter={false}
          />
          <div className="popover-suptext">
            <PopoverTextControl name="productInfo.description_level_one" hasBackground={false} />
          </div>
        </div>

        {/* 6. 品群 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.code_level_two"
            className="input-subtext"
            label={'品群'}
            height={'50px'}
            maxLength={4}
            disabled={disabledUser}
            required
            addZero={true}
            focusOut={() => getIHierarchyLevel('two')}
            localizeKey="品群"
            onMaxLength={() => blurInput('productInfo.code_level_three')}
            focusOutWhenTabEnter={false}
          />

          <div className="popover-suptext">
            <PopoverTextControl name="productInfo.description_level_two" hasBackground={false} />
          </div>
        </div>

        {/* 7. 品種 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.code_level_three"
            className="input-subtext"
            label={'品種'}
            height={'50px'}
            maxLength={4}
            disabled={disabledUser}
            required
            addZero={true}
            focusOut={() => getIHierarchyLevel('three')}
            localizeKey="品種"
            onMaxLength={() => blurInput('productInfo.code_level_four')}
            focusOutWhenTabEnter={false}
          />
          <div className="popover-suptext">
            <PopoverTextControl name="productInfo.description_level_three" hasBackground={false} />
          </div>
        </div>

        {/* 8. 分類 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.code_level_four"
            className="input-subtext"
            label={'分類'}
            height={'50px'}
            maxLength={4}
            disabled={disabledUser}
            addZero={true}
            focusOut={() => getIHierarchyLevel('four')}
            onMaxLength={() => blurInput('productInfo.unit_price')}
            focusOutWhenTabEnter={false}
          />

          <div className="popover-suptext">
            <PopoverTextControl name="productInfo.description_level_four" hasBackground={false} />
          </div>
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

        {/* 11. 原価 */}
        <div className="add-new-product__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.original_price"
            className="input-subtext"
            label={'原価'}
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={disabledUser}
            textAlign="right"
            thousandSeparator=","
            localizeKey="原価"
            required
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

        {/* 14. カナ名称 */}
        <TooltipInputTextControl
          name="productInfo.kana_name"
          title={'カナ名称'}
          width={'100%'}
          height={'50px'}
          maxLength={25}
          disabled={disabledUser}
          required
          localizeKey="カナ名称"
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
