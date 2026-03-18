import React from 'react';
import TooltipNumberInputTextControl
  from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import { regex } from '@/modules/sc4501-add-product/regex';

const PopInformation = ({disableUser}) => {

  return (
    <div className="add-new-product__col pop-info">
      <div className="add-new-product__title">POP用情報</div>
      <div className="add-new-product__content">
        {/* 発注入り数 */}
        <TooltipNumberInputTextControl
          name="productInfo.number_of_order"
          className=" element-focus"
          label={'発注入り数'}
          width={'100%'}
          height={'50px'}
          maxLength={6}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="発注入り数"
          thousandSeparator=","
        />

        {/* 発注単位 */}
        <TooltipInputTextControl
          name="productInfo.order_unit"
          className=" element-focus"
          title={'発注単位'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disableUser}
          localizeKey="発注単位"
          errorPlacement="left"
          hasTrimSpace
        />

        {/* ユニット数 */}
        <TooltipNumberInputTextControl
          name="productInfo.number_of_unit"
          className=" element-focus"
          label={'ユニット数'}
          width={'100%'}
          height={'50px'}
          maxLength={6}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="ユニット数"
          thousandSeparator=","
        />

        {/* ユニット単位 */}
        <TooltipInputTextControl
          name="productInfo.unit"
          className=" element-focus"
          title={'ユニット単位'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="ユニット単位"
          hasTrimSpace
        />

        {/* 規格数 */}
        <TooltipNumberInputTextControl
          name="productInfo.standard_number"
          className=" element-focus"
          label={'規格数'}
          width={'100%'}
          height={'50px'}
          maxLength={6}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="規格数"
          thousandSeparator=","
        />

        {/* 規格単位 */}
        <TooltipInputTextControl
          name="productInfo.standard_unit"
          className=" element-focus"
          title={'規格単位'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="規格単位"
          hasTrimSpace
        />

        {/* 保存期限 */}
        <TooltipNumberInputTextControl
          name="productInfo.storage_time"
          className=" element-focus"
          label={'保存期限'}
          height={'50px'}
          disabled={disableUser}
          localizeKey="保存期限"
          maxLength={6}
          thousandSeparator=","
        />

        {/* 保存単位 */}
        <TooltipInputTextControl
          name="productInfo.storage_unit"
          className=" element-focus"
          title={'保存単位'}
          regex={regex}
          width={'100%'}
          height={'50px'}
          maxLength={2}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="保存単位"
        />

        {/* 取引先コード */}
        <TooltipInputTextControl
          name="productInfo.partner_code"
          className=" element-focus"
          title="取引先コード"
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disableUser}
          errorPlacement="left"
          localizeKey="取引先コード"
          hasTrimSpace
        />
      </div>
    </div>
  );
};

export default PopInformation;
