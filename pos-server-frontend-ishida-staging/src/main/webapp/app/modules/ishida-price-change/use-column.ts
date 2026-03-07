import { useMemo } from 'react';
import { TableColumnDef } from '@/components/table/table-data/table-data';
import { IPriceChange } from '@/modules/ishida-price-change/interface-price';
import { focusElementByNameWithTimeOut } from '@/helpers/utils';

export const useColumns = (
  storeCode: string,
  suggestItemCode: (itemCode: string, index: number) => void,
  suggestProductCode: (myCompanyCode: string, index: number) => void
) => {
  const columns = useMemo<TableColumnDef<IPriceChange>[]>(
    () => [
      {
        accessorKey: 'my_company_code',
        header: 'touchMenu.productCode',
        size: 12,
        type: 'product',
        inputTextProps: {
          focusOut: suggestProductCode,
          addZero: true,
          textAlign: 'right',
          focusOutWhenTabEnter: false,
          focusOutWhenMaxLength: true,
          onMaxLengthProductFirstInput(value, index) {
            if (value?.length === 2) {
              focusElementByNameWithTimeOut(`prices[${index}].product_code`, 50);
            }
          },
        },
      },
      {
        accessorKey: 'item_code',
        header: 'touchMenu.PLU',
        size: 13,
        textAlight: 'center',
        type: 'inputNumber',
        inputTextProps: {
          maxLength: 13,
          textAlign: 'right',
          disabledIfHasRecordId: true,
          addZero: true,
          focusOut: suggestItemCode,
          focusOutWhenTabEnter: false,
          focusOutWhenMaxLength: true,
        },
      },
      {
        accessorKey: 'item_name',
        header: 'priceChange.itemName',
        size: 55,
        type: 'text',
        textAlight: 'left',
        checkError: true,
        textAlign: 'left',
        useNameForm: true,
      },
      {
        accessorKey: 'current_price',
        header: 'priceChange.currentPrice',
        type: 'text',
        size: 10,
        textAlign: 'right',
        formatNumber: true,
        useNameForm: true,
        fixedDigit: true,
        numberFractionDigits: 0,
      },
      {
        accessorKey: 'new_price',
        header: 'priceChange.newPrice',
        size: 10,
        type: 'inputNumber',
        inputTextProps: {
          maxLength: 6,
          minValue: 1,
          textAlign: 'right',
          thousandSeparator: ',',
          errorPlacement: 'left',
        },
      },
    ],
    [storeCode]
  );

  return { columns };
};

export default useColumns;
