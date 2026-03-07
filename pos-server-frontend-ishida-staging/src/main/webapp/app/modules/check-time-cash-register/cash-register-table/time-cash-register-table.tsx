import React, { Fragment, useMemo, useState } from 'react';
import { Translate } from 'react-jhipster';
import './time-cash-register-table.scss';
import { formatNumber, localizeString } from 'app/helpers/utils';
import { DataReport, ListCashRegister } from 'app/services/check-time-cash-register-service';

const TimeCashRegisterTable = ({ data, currentPage, totalPage }) => {
  const [cashRegisterCodeList, setCashRegisterCodeList] = useState<ListCashRegister[]>([]);

  // Use useMemo to update cashRegisterCodeList when data or currentPage changes
  useMemo(() => {
    setCashRegisterCodeList(data[currentPage]);
  }, [data, currentPage]);

  // Function to calculate and render the ratio with optional highlight
  const calcRenderRatio = (exclude: number, ratio: number, is_highlight: boolean) => {
    const renderLogic = {
      1: () => null, // return null if ratio === 1
      highlight: () => `※${formatNumber(ratio, 1, ratio === 0)}`, // return highlighted ratio
      default: () => formatNumber(ratio, 1, ratio === 0), // return default ratio
    };

    return exclude === 1
      ? renderLogic[1]()
      : is_highlight && ratio !== null
        ? renderLogic.highlight()
        : renderLogic.default();
  };

  return (
    <div className="table-data-cash-container">
      <div className="table-header-right" />
      <div className="table-data-cash">
        <table className="table-custom">
          <thead
            className="table-header-fixed"
            style={
              {
                '--number-column':
                  cashRegisterCodeList?.reduce(
                    (acc, current) => acc + (current.rate_customer_excluded === 1 ? 3 : 4),
                    0
                  ) ?? 0,
              } as React.CSSProperties
            }
          >
            {/* Start header table row 1*/}
            <tr className="row-first">
              {/* Start column header No and Time */}
              <th colSpan={2} scope="col" className="header-setting firstCol">
                <Translate contentKey="checkTimeCashRegister.table.cashier" />
              </th>
              {/* End column header No and Time */}

              {/* Start column header pos machine */}
              {cashRegisterCodeList?.map((item, index: number) => {
                const numberColumn = item.rate_customer_excluded === 1 ? 3 : 4;
                return (
                  <Fragment key={index}>
                    {item.cash_register_code !== null && (
                      <th colSpan={numberColumn} className={`header-setting cashier`}>
                        {item.cash_register_code}
                      </th>
                    )}

                    {/* Start column header total data of all pos machines */}
                    {/* Condition render in last page */}
                    {currentPage === totalPage && item.cash_register_code === null && (
                      <th scope="col" className={`header-setting col-last`} colSpan={3}>
                        <Translate contentKey="checkTimeCashRegister.table.storeTotal" />
                      </th>
                    )}
                    {/* End column header total data of all pos machines */}
                  </Fragment>
                );
              })}
              {/* End column header pos machine */}
            </tr>
            {/* End header table row 1*/}

            {/* Start header table row 2 */}
            <tr>
              {/* Start column header No and Time */}
              <th className="header-setting setting-no">No</th>
              <th scope="col" className="header-setting">
                <Translate contentKey="checkTimeCashRegister.table.timeperiod" />
              </th>
              {/* End column header No and Time */}

              {/* Start column header pos machine */}
              {cashRegisterCodeList?.map((item, index: number) => {
                return (
                  <React.Fragment key={index}>
                    {item.cash_register_code !== null && (
                      <>
                        {item.rate_customer_excluded !== 1 && (
                          <th scope="col" className="header-setting sub-title">
                            <Translate contentKey="checkTimeCashRegister.table.ratio" />
                          </th>
                        )}
                        <th scope="col" className="header-setting sub-title">
                          <Translate contentKey="checkTimeCashRegister.table.total_customer" />
                        </th>
                        <th scope="col" className="header-setting sub-title">
                          <Translate contentKey="checkTimeCashRegister.table.total_product" />
                        </th>
                        <th scope="col" className="header-setting sub-title">
                          <Translate contentKey="checkTimeCashRegister.table.total_amount" />
                        </th>
                      </>
                    )}

                    {/* Start column header total data of all pos machines */}
                    {/* Condition render in last page */}
                    {currentPage === totalPage && item.cash_register_code === null && (
                      <>
                        <th scope="col" className="header-setting sub-title-total">
                          <Translate contentKey="checkTimeCashRegister.table.total_customer" />
                        </th>
                        <th scope="col" className="header-setting sub-title-total">
                          <Translate contentKey="checkTimeCashRegister.table.total_product" />
                        </th>
                        <th scope="col" className="header-setting sub-title-total">
                          <Translate contentKey="checkTimeCashRegister.table.total_amount" />
                        </th>
                      </>
                    )}
                    {/* End column header total data of all pos machines */}
                  </React.Fragment>
                );
              })}
              {/* End column header pos machine */}
            </tr>
            {/* End header table row 2 */}
          </thead>

          <tbody className="table-data-cash__table-body">
            {cashRegisterCodeList &&
              cashRegisterCodeList[0]?.data_report?.map((timerData: DataReport, timerIndex: number) => (
                <tr key={timerIndex}>
                  {/* Start column body No and Time */}
                  <td className="no">{timerData.time_no ?? '**'}</td>
                  <td className="timer">
                    {timerData.time_period ?? localizeString('checkTimeCashRegister.table.total')}
                  </td>
                  {/* End column body No and Time */}

                  {/* Start column body data of pos machine */}
                  {cashRegisterCodeList?.map((item, index) => {
                    const currentTimer = item?.data_report?.[timerIndex];

                    return (
                      currentTimer && (
                        <React.Fragment key={index}>
                          {item.cash_register_code !== null && (
                            <>
                              {item.rate_customer_excluded !== 1 && (
                                <td className="col-number">
                                  {calcRenderRatio(
                                    item.rate_customer_excluded,
                                    currentTimer.ratio,
                                    currentTimer.is_highlight
                                  )}
                                </td>
                              )}
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.number_customers)}
                              </td>
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.number_products ?? 0)}
                              </td>
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.sale_amount ?? 0)}
                              </td>
                            </>
                          )}

                          {/* Start column body total data of all pos machines */}
                          {/* Condition render in last page */}
                          {currentPage === totalPage && item.cash_register_code === null && (
                            <>
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.number_customers)}
                              </td>
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.number_products ?? 0)}
                              </td>
                              <td className="col-number">
                                {currentTimer.is_highlight ? '※' : ''}
                                {formatNumber(currentTimer.sale_amount ?? 0)}
                              </td>
                            </>
                          )}
                          {/* End column body total data of all pos machines */}
                        </React.Fragment>
                      )
                    );
                  })}
                  {/* End column body data of pos machine */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeCashRegisterTable;
