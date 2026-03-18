const rowType = [
  '1:フル',
  '2:ニアフル',
  '3:ニアエンプティ',
  '4:エンプティ',
  '5:残置',
  '6:釣銭準備金',
  '7:両替最大数',
  '8:両替優先順位',
  '9:設定排出枚数',
];

export const generateDataCashMachine = () => {
  return rowType.map(() => {
    return {
      status: Math.floor(Math.random() * 10),
      count_10000: 0,
      count_5000: 0,
      count_2000: 0,
      count_1000: 0,
      count_500: 0,
      count_100: 0,
      count_50: 0,
      count_10: 0,
      count_5: 0,
      count_1: 0,
      cassette: 0,
    };
  });
};

export const dummyData = [
  {
    status: 1,
    count_10000: 0,
    count_5000: 0,
    count_2000: 0,
    count_1000: 0,
    count_500: 0,
    count_100: 0,
    count_50: 0,
    count_10: 0,
    count_5: 0,
    count_1: 0,
    cassette: 0,
  },
  {
    status: 2,
    count_10000: 0,
    count_5000: 0,
    count_2000: 0,
    count_1000: 0,
    count_500: 0,
    count_100: 0,
    count_50: 0,
    count_10: 0,
    count_5: 0,
    count_1: 0,
    cassette: 0,
  },
];
