import { useMemo } from 'react';
import { useAppSelector } from '@/config/store';

const rowType = {
  1: '1:フル',
  2: '2:ニアフル',
  3: '3:ニアエンプティ',
  4: '4:エンプティ',
  5: '5:残置',
  6: '6:釣銭準備金',
  7: '7:両替最大数',
  8: '8:両替優先順位',
  9: '9:設定排出枚数',
};

const MAX_LENGTH_INPUT = 4;

const UseTableColumn = ({ setDisableConfirm, mode }) => {
  const cash_changer_settings = useAppSelector(
    (state) => state.settingMasterReducer.cash_register_detail.cash_changer_settings
  );

  const handleInputChange = (value: string, rowIndex: number, columnName: string) => {
    if (mode !== 'Edit') return;
    if (Number(value) !== cash_changer_settings[rowIndex][columnName]) {
      setDisableConfirm(false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'type',
        header: 'settingCashMachine.table.header.type',
        type: 'text',
        align: 'left',
        size: 20,
        option({ row }) {
          return {
            value: rowType[row.original.status],
          };
        },
      },
      {
        accessorKey: 'count_10000',
        header: 'settingCashMachine.table.header.10000円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_10000'),
        },
      },
      {
        accessorKey: 'count_5000',
        header: 'settingCashMachine.table.header.5000円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_5000'),
        },
      },
      {
        accessorKey: 'count_2000',
        header: 'settingCashMachine.table.header.2000円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_2000'),
        },
      },
      {
        accessorKey: 'count_1000',
        header: 'settingCashMachine.table.header.1000円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_1000'),
        },
      },
      {
        accessorKey: 'count_500',
        header: 'settingCashMachine.table.header.500円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_500'),
        },
      },
      {
        accessorKey: 'count_100',
        header: 'settingCashMachine.table.header.100円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_100'),
        },
      },
      {
        accessorKey: 'count_50',
        header: 'settingCashMachine.table.header.50円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_50'),
        },
      },
      {
        accessorKey: 'count_10',
        header: 'settingCashMachine.table.header.10円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_10'),
        },
      },
      {
        accessorKey: 'count_5',
        header: 'settingCashMachine.table.header.5円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_5'),
        },
      },
      {
        accessorKey: 'count_1',
        header: 'settingCashMachine.table.header.1円',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'count_1'),
        },
      },
      {
        accessorKey: 'cassette',
        header: 'カセット',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          isNegative: true,
          maxLength: MAX_LENGTH_INPUT,
          textAlign: 'right',
          focusOut: (value: string, rowIndex: number) => handleInputChange(value, rowIndex, 'cassette'),
        },
      },
    ];
  }, []);

  return { columns };
};

export default UseTableColumn;
