import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styled.scss';

import SelectDataInput from 'app/shared/layout/select-data/select-data';

type Journal = {
  id: number;
  transaction_date: Date;
  cash_register_code: string;
  receipt_no: string;
  journal_no: string;
  journal_data: string;
};

type Pos = {
  code: number;
  name: string;
};

const dummyDataJournal: Journal[] = [
  {
    id: 2,
    cash_register_code: '151',
    transaction_date: new Date('2022-10-27T06:00:00.000Z'),
    receipt_no: '324',
    journal_no: '11142',
    journal_data:
      '--------------------------------\u000d\u000a             開 設              \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:00         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a営業日                2024/06/04\u000d\u000a開設回数                       1\u000d\u000aﾌﾟﾛｸﾞﾗﾑﾊﾞｰｼﾞｮﾝ        2024032911\u000d\u000aMasterVersion         2024060310\u000d\u000aMinorVersion                0002\u000d\u000aﾚｼｰﾄNo:0736                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a@000000000000012616             \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 2,
    cash_register_code: '842',
    transaction_date: new Date('2022-10-27T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a           釣銭機補充           \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:12         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a   金種      枚             金額\u000d\u000a10000円       0               ¥0\u000d\u000a 5000円       2          ¥10,000\u000d\u000a 2000円       0               ¥0\u000d\u000a 1000円      34          ¥34,000\u000d\u000a  500円       0               ¥0\u000d\u000a  100円       0               ¥0\u000d\u000a   50円       0               ¥0\u000d\u000a   10円       0               ¥0\u000d\u000a    5円       0               ¥0\u000d\u000a    1円       0               ¥0\u000d\u000a--------------------------------\u000d\u000a補充金額                 ¥44,000\u000d\u000a(補充後釣銭機合計       ¥49,568)\u000d\u000aﾚｼｰﾄNo:0737                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a@000000000000012617             \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 3,
    cash_register_code: '314',
    transaction_date: new Date('2022-10-28T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a           釣銭機回収           \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:17         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a   金種      枚             金額\u000d\u000a10000円       0               ¥0\u000d\u000a 5000円       1           ¥5,000\u000d\u000a 2000円       0               ¥0\u000d\u000a 1000円       1           ¥1,000\u000d\u000a  500円       0               ¥0\u000d\u000a  100円       0               ¥0\u000d\u000a   50円       0               ¥0\u000d\u000a   10円       0               ¥0\u000d\u000a    5円       0               ¥0\u000d\u000a    1円       0               ¥0\u000d\u000a回収庫                        ¥0\u000d\u000a--------------------------------\u000d\u000a回収金額                  ¥6,000\u000d\u000a(回収後釣銭機合計       ¥43,568)\u000d\u000aﾚｼｰﾄNo:0738                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a@000000000000012618             \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 4,
    cash_register_code: '567',
    transaction_date: new Date('2022-10-29T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a            精算点検            \u000d\u000a         取引別レポート         \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:33         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a営業日  :2024/06/04             \u000d\u000a精算回数:001                    \u000d\u000a--------------------------------\u000d\u000aレジ番号:0151                   \u000d\u000a--------------------------------\u000d\u000a売上部門         0点          ¥0\u000d\u000a売上外部門       0点          ¥0\u000d\u000a部門計           0点          ¥0\u000d\u000a--------------------------------\u000d\u000a売上合計(外税込)              ¥0\u000d\u000a売上合計(外税抜)              ¥0\u000d\u000a純売上(税抜合計)              ¥0\u000d\u000a  ★ 8%                       ¥0\u000d\u000a  ★10%                       ¥0\u000d\u000a消費税                        ¥0\u000d\u000a  ★ 8%                       ¥0\u000d\u000a  ★10%                       ¥0\u000d\u000a                                \u000d\u000a売上外合計(外税込)            ¥0\u000d\u000a売上外合計(外税抜)            ¥0\u000d\u000a税抜合計                      ¥0\u000d\u000a消費税                        ¥0\u000d\u000a                                \u000d\u000a客数             0客            \u000d\u000a点数             0点            \u000d\u000a外税売上         0点          ¥0\u000d\u000a  10%            0点          ¥0\u000d\u000a   8%            0点          ¥0\u000d\u000a外税額                        ¥0\u000d\u000a内税売上         0点          ¥0\u000d\u000a内税額                        ¥0\u000d\u000a非課税売上       0点          ¥0\u000d\u000a外税売上外       0点          ¥0\u000d\u000a外税額（売上外）              ¥0\u000d\u000a内税売上外       0点          ¥0\u000d\u000a内税額（売上外）              ¥0\u000d\u000a非課税売上外                    \u000d\u000a                 0点          ¥0\u000d\u000a税額合計                      ¥0\u000d\u000a課税対象額                    ¥0\u000d\u000a値引合計                      ¥0\u000d\u000a平均単価                      ¥0\u000d\u000a客単価                        ¥0\u000d\u000a--------------------------------\u000d\u000a●精算時入金額                ¥0\u000d\u000a--------------------------------\u000d\u000aﾁｬｰｼﾞ合計        0点          ¥0\u000d\u000a★WAON現金ﾁｬｰｼﾞ                 \u000d\u000a                 0点          ¥0\u000d\u000a★ignica moneyﾁｬｰｼﾞ             \u000d\u000a                 0点          ¥0\u000d\u000a--------------------------------\u000d\u000a経費振替         0件            \u000d\u000a                 0点          ¥0\u000d\u000a--------------------------------\u000d\u000a返品             0件          ¥0\u000d\u000a●ｶｰﾄﾞ返品       0件          ¥0\u000d\u000a★返品/訂正                   ¥0\u000d\u000a取消             0件          ¥0\u000d\u000aWAONﾁｬｰｼﾞ取消    0件          ¥0\u000d\u000aignica moneyﾁｬｰｼﾞ取消           \u000d\u000a                 0件          ¥0\u000d\u000a指定訂正         0点          ¥0\u000d\u000a取引中止         0件          ¥0\u000d\u000a売価変更         0点          ¥0\u000d\u000a--------------------------------\u000d\u000a釣銭準備金                    ¥0\u000d\u000a--------------------------------\u000d\u000a出金合計         0件          ¥0\u000d\u000a--------------------------------\u000d\u000a釣銭機補充       1件     ¥44,000\u000d\u000a釣銭機回収       1件      ¥6,000\u000d\u000a両替             0件            \u000d\u000a万券             0枚            \u000d\u000a領収証           0件            \u000d\u000a--------------------------------\u000d\u000a練習モード                    ¥0\u000d\u000a--------------------------------\u000d\u000aﾚｼｰﾄNo:0741                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a                                \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 5,
    cash_register_code: '901',
    transaction_date: new Date('2022-10-30T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 6,
    cash_register_code: '238',
    transaction_date: new Date('2022-10-31T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 7,
    cash_register_code: '629',
    transaction_date: new Date('2022-11-01T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 8,
    cash_register_code: '745',
    transaction_date: new Date('2022-11-02T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 9,
    cash_register_code: '384',
    transaction_date: new Date('2022-11-03T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 10,
    cash_register_code: '527',
    transaction_date: new Date('2022-11-04T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 11,
    cash_register_code: '678',
    transaction_date: new Date('2022-11-05T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 12,
    cash_register_code: '495',
    transaction_date: new Date('2022-11-06T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 13,
    cash_register_code: '357',
    transaction_date: new Date('2022-11-07T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 14,
    cash_register_code: '263',
    transaction_date: new Date('2022-11-08T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 15,
    cash_register_code: '182',
    transaction_date: new Date('2022-11-09T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\n               点検             \n2023年08月29日(火)22:44\n店:02701 レジNo:6201\n                                \n前回出力日時    2023/08/29 22:25\n今回出力日時    2023/08/29 22:44\n--------------------------------\n                                \nﾁｬｰｼﾞ合計        0点  ¥        0\n--------------------------------\n入出金処理\n--------------------------------\n釣銭機補充       0点  ¥        0\n売上             0点  ¥        0\n釣銭機回収       1点  ¥        0\n残置金額              ¥        0\n現金過不足            ¥        0\n--------------------------------\nﾚｼｰﾄNo:325\n責:045088025レジ担当者\nc',
  },
  {
    id: 16,
    cash_register_code: '498',
    transaction_date: new Date('2022-11-10T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a            精算点検            \u000d\u000a         部門別レポート         \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:33         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a営業日  :2024/06/04             \u000d\u000a精算回数:001                    \u000d\u000a--------------------------------\u000d\u000a* 合計 *                        \u000d\u000a  売上           0点          ¥0\u000d\u000a  粗利                        ¥0\u000d\u000a--------------------------------\u000d\u000a                                \u000d\u000aﾚｼｰﾄNo:0742                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a                                \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 17,
    cash_register_code: '573',
    transaction_date: new Date('2022-11-11T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a                                \u000d\u000a2024年06月04日(火)13:42         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a****<キャッシャーサインオフ>****\u000d\u000a                                \u000d\u000aﾚｼｰﾄNo:0743                     \u000d\u000a責:                             \u000d\u000a@000000000000012624             \u000d\u000a                                \u000d\u000a',
  },
  {
    id: 18,
    cash_register_code: '712',
    transaction_date: new Date('2022-11-12T07:00:00.000Z'),
    receipt_no: '0000000000017',
    journal_no: '796735',
    journal_data:
      '--------------------------------\u000d\u000a            精算点検            \u000d\u000a         取引別レポート         \u000d\u000a                                \u000d\u000a2024年06月04日(火)12:33         \u000d\u000a店:09176 ﾚｼﾞNo:0151             \u000d\u000a                                \u000d\u000a営業日  :2024/06/04             \u000d\u000a精算回数:001                    \u000d\u000a--------------------------------\u000d\u000aレジ番号:0151                   \u000d\u000a--------------------------------\u000d\u000a売上部門         0点          ¥0\u000d\u000a売上外部門       0点          ¥0\u000d\u000a部門計           0点          ¥0\u000d\u000a--------------------------------\u000d\u000a売上合計(外税込)              ¥0\u000d\u000a売上合計(外税抜)              ¥0\u000d\u000a純売上(税抜合計)              ¥0\u000d\u000a  ★ 8%                       ¥0\u000d\u000a  ★10%                       ¥0\u000d\u000a消費税                        ¥0\u000d\u000a  ★ 8%                       ¥0\u000d\u000a  ★10%                       ¥0\u000d\u000a                                \u000d\u000a売上外合計(外税込)            ¥0\u000d\u000a売上外合計(外税抜)            ¥0\u000d\u000a税抜合計                      ¥0\u000d\u000a消費税                        ¥0\u000d\u000a                                \u000d\u000a客数             0客            \u000d\u000a点数             0点            \u000d\u000a外税売上         0点          ¥0\u000d\u000a  10%            0点          ¥0\u000d\u000a   8%            0点          ¥0\u000d\u000a外税額                        ¥0\u000d\u000a内税売上         0点          ¥0\u000d\u000a内税額                        ¥0\u000d\u000a非課税売上       0点          ¥0\u000d\u000a外税売上外       0点          ¥0\u000d\u000a外税額（売上外）              ¥0\u000d\u000a内税売上外       0点          ¥0\u000d\u000a内税額（売上外）              ¥0\u000d\u000a非課税売上外                    \u000d\u000a                 0点          ¥0\u000d\u000a税額合計                      ¥0\u000d\u000a課税対象額                    ¥0\u000d\u000a値引合計                      ¥0\u000d\u000a平均単価                      ¥0\u000d\u000a客単価                        ¥0\u000d\u000a--------------------------------\u000d\u000a●精算時入金額                ¥0\u000d\u000a--------------------------------\u000d\u000aﾁｬｰｼﾞ合計        0点          ¥0\u000d\u000a★WAON現金ﾁｬｰｼﾞ                 \u000d\u000a                 0点          ¥0\u000d\u000a★ignica moneyﾁｬｰｼﾞ             \u000d\u000a                 0点          ¥0\u000d\u000a--------------------------------\u000d\u000a経費振替         0件            \u000d\u000a                 0点          ¥0\u000d\u000a--------------------------------\u000d\u000a返品             0件          ¥0\u000d\u000a●ｶｰﾄﾞ返品       0件          ¥0\u000d\u000a★返品/訂正                   ¥0\u000d\u000a取消             0件          ¥0\u000d\u000aWAONﾁｬｰｼﾞ取消    0件          ¥0\u000d\u000aignica moneyﾁｬｰｼﾞ取消           \u000d\u000a                 0件          ¥0\u000d\u000a指定訂正         0点          ¥0\u000d\u000a取引中止         0件          ¥0\u000d\u000a売価変更         0点          ¥0\u000d\u000a--------------------------------\u000d\u000a釣銭準備金                    ¥0\u000d\u000a--------------------------------\u000d\u000a出金合計         0件          ¥0\u000d\u000a--------------------------------\u000d\u000a釣銭機補充       1件     ¥44,000\u000d\u000a釣銭機回収       1件      ¥6,000\u000d\u000a両替             0件            \u000d\u000a万券             0枚            \u000d\u000a領収証           0件            \u000d\u000a--------------------------------\u000d\u000a練習モード                    ¥0\u000d\u000a--------------------------------\u000d\u000aﾚｼｰﾄNo:0741                     \u000d\u000a責:3333337セルフレジBC          \u000d\u000a                                \u000d\u000a                                \u000d\u000a',
  },
];

const dummyDataPos: Pos[] = [
  {
    code: 1,
    name: 'Pos 1',
  },
  {
    code: 2,
    name: 'Pos 2',
  },
  {
    code: 3,
    name: 'Pos 3',
  },
];

// const dummyDataPos: Pos[] = []

const JournalManagement = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [maxCount, setMaxCount] = useState<string>('');
  const [journals, setJournals] = useState<Journal[]>([]);
  const listDetailJournalRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pos, setPos] = useState<Pos[]>([]);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedTdClasses, setSelectedTdClasses] = useState({});

  const handleSelectRow = index => {
    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = prevSelectedRows.includes(index) ? prevSelectedRows.filter(i => i !== index) : [...prevSelectedRows, index];

      setSelectedTdClasses(prevSelectedTdClasses => {
        const newSelectedTdClasses = { ...prevSelectedTdClasses };
        if (newSelectedRows.includes(index)) {
          newSelectedTdClasses[index] = 'selected-td';
        } else {
          delete newSelectedTdClasses[index];
        }
        return newSelectedTdClasses;
      });

      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    const allIndexes = journals.map((_, index) => index);
    setSelectedRows(allIndexes);

    const allTdClasses = {};
    allIndexes.forEach(index => {
      allTdClasses[index] = 'selected-td';
    });
    setSelectedTdClasses(allTdClasses);
  };

  const handleUnSelectAll = () => {
    setSelectedTdClasses([]);
    setSelectedRows([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchedPos: Pos[] = await new Promise(resolve => setTimeout(() => resolve(dummyDataPos), 1000));

      const fetchedJournal: Journal[] = await new Promise(resolve => setTimeout(() => resolve(dummyDataJournal), 1000));

      if (!fetchedPos || fetchedPos.length === 0) {
        setErrorMessage('Error API Pos');
      } else {
        setPos(fetchedPos);
      }

      if (!fetchedJournal || fetchedJournal.length === 0) {
        setErrorMessage('Error API Journal');
      } else {
        setJournals(fetchedJournal);
      }
    };

    fetchData();
  }, []);

  const selectedJournals = journals.filter((journal, index) => selectedRows.includes(index));

  const setBrowserClass = () => {
    const ua = navigator.userAgent;
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) {
      document.documentElement.classList.add('chrome');
    } else if (/edge/i.test(ua)) {
      document.documentElement.classList.add('edge');
    } else if (/firefox/i.test(ua)) {
      document.documentElement.classList.add('firefox');
    }
  };

  setBrowserClass();

  const validateForm = () => {
    const dateErrorMessage = 'Error date';
    const timeErrorMessage = 'Error time';

    if (!startDate || !endDate) {
      setErrorMessage(dateErrorMessage);
      return false;
    }

    if (startDate > endDate) {
      setErrorMessage(dateErrorMessage);
      return false;
    }

    if (!startTime || !endTime) {
      setErrorMessage(timeErrorMessage);
      return false;
    }

    if (!maxCount) {
      setErrorMessage('Error max count');
      return false;
    }

    const newData = fetchDataBasedOnMaxCount(maxCount);
    setJournals(newData);

    const filteredData = dummyDataJournal.filter(journal => {
      const journalDate = new Date(journal.transaction_date);
      return new Date(startDate) <= journalDate && journalDate <= new Date(endDate);
    });

    setJournals(filteredData.slice(0, Number(maxCount)));
  };

  const handleCloseAlert = () => {
    setErrorMessage(null);
  };

  const fetchDataBasedOnMaxCount = count => {
    return dummyDataJournal.slice(0, count);
  };

  return (
    <div className="main-container">
      <div className="container-left">
        <div className="container ">
          <div className="first-row">
            <div className="col-12">
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  営業日
                  <span className="required">*</span>
                </span>
                <input
                  type="date"
                  className="form-control"
                  id="input-text"
                  aria-label="Sizing
                  example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <span style={{ margin: '0 20px 0 20px', padding: '7px' }}> ~ </span>
                <input
                  type="date"
                  className="form-control"
                  id="input-text"
                  aria-label="Sizing
                  example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  営業日
                  <span className="required">*</span>
                </span>
                <input
                  type="time"
                  className="form-control"
                  id="time-picker"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
                <span style={{ margin: '0 20px 0 20px', padding: '7px' }}> ~ </span>
                <input
                  type="time"
                  className="form-control"
                  id="time-picker"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-group-text" htmlFor="inputGroupSelect01">
                  レジ
                </label>
                <SelectDataInput name="testSelect" id="testSelect" selectData={dummyDataPos} />
                <label className="input-group-text" htmlFor="inputGroupSelect01" style={{ maxHeight: '35px' }}>
                  担当者
                </label>
                <select className="form-select" id="inputGroupSelect02">
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  レシートNo
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="input-text"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
                <span style={{ margin: '0 38px 0 33px', padding: '7px' }}> ~ </span>
                <input
                  type="text"
                  className="form-control"
                  id="input-text"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
              </div>
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  任意文字列
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="input-text-2"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
              </div>
              <div className="btn-toolbar justify-content-between" role="toolbar" aria-label="Toolbar with button groups">
                <div className="input-group flex-nowrap" aria-label="First group">
                  <span className="input-group-text" id="addon-wrapping">
                    表示件数
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="input-text-3"
                    aria-label="Sizing example input"
                    aria-describedby="inputGroup-sizing-default"
                    value={maxCount}
                    onChange={e => setMaxCount(e.target.value)}
                  />
                </div>
                <div className="btn-action ml-auto">
                  <button type="button" className="btn btn-info" onClick={validateForm}>
                    Search
                  </button>
                  <button type="button" className="btn btn-info" onClick={handleUnSelectAll}>
                    Unselect All
                  </button>
                  <button type="button" className="btn btn-info" onClick={handleSelectAll}>
                    Select All
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="second-row">
            <div className="col-12">
              <div>
                <div className="validate">検索結果がXX件を超えたため、最初の10件を表示しています。</div>
                <div className="table-container">
                  <table className="table table-responsive table-striped table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: '15%' }}>レジ番号</th>
                        <th style={{ width: '40%' }}>取引日時</th>
                        <th style={{ width: '25%' }}>レシートNo.</th>
                        <th style={{ width: '20%' }}>ジャーナルNo.</th>
                      </tr>
                    </thead>
                    <tbody className="journal">
                      {journals.map((journal, index) => (
                        <tr
                          key={journal.id}
                          className={selectedRows.includes(index) ? 'selected' : ''}
                          onClick={() => handleSelectRow(index)}
                        >
                          <td className={selectedTdClasses[index] || ''} style={{ width: '15%' }}>
                            {journal.cash_register_code}
                          </td>
                          <td className={selectedTdClasses[index] || ''} style={{ width: '40%', textAlign: 'left' }}>
                            {journal.transaction_date.toLocaleDateString()}
                          </td>
                          <td className={selectedTdClasses[index] || ''} style={{ width: '25%' }}>
                            {journal.receipt_no}
                          </td>
                          <td className={selectedTdClasses[index] || ''} style={{ width: '20%' }}>
                            {journal.journal_no}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-right">
        {selectedJournals.length > 0 &&
          selectedJournals.map((journal, index) => (
            // eslint-disable-next-line react/jsx-key
            <div className="receipt">
              <pre className="list-detail-journal" id={`list-detail-journal-${index}`}>
                {journal.journal_data.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </pre>
            </div>
            // <ListDetailJournal
            //   key={journal.id}
            //   journal={journal}
            //   ref={listDetailJournalRef}
            //   id={`list-detail-journal-${index}`}
            // />
          ))}
      </div>
    </div>
  );
};

export default JournalManagement;
