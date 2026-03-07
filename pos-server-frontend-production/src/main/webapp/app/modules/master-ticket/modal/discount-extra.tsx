import DatePicker, { Position } from 'app/components/date-picker/date-picker';
import DayOfWeek, { getDayOfWeekValues, IDayOfWeek } from 'app/components/input/day-of-week/day-of-week';
import TimePicker from 'app/components/time-picker/time-picker';

import { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Translate } from 'react-jhipster';
import {
  DiscountType,
  categoryDiscountMoneys,
  ApplyType,
  OperationType,
  discountTypeValues,
  categoryDiscountPercents,
  applyTypeValues,
  applyDateValues,
} from '../data-input';
import { TicketRef, DiscountProps } from '../interface';
import React from 'react';
import './modal-ticket.scss';
import { InputText, NormalDropdown } from 'app/components/input/input';
import { NormalRadioButton } from 'app/components/radio-button/radio-button';
import NumberInputText from 'app/components/input/input-text/number-input';
import _ from 'lodash';

import { toDateString } from 'app/helpers/date-utils';
import { SERVER_DATETIME_FORMAT } from 'app/constants/date-constants';

export const DiscountExtra = forwardRef<TicketRef, DiscountProps>(({ ticket, ticketSuggest }, ref) => {
  const [discountMoney, setDiscountMoney] = useState<string>(
    ticket && ticket.discount_type === DiscountType.Money ? _.toString(ticket.amount) : '',
  );
  const [categoryMoney, setCategoryMoney] = useState<number>(
    ticket && ticket.discount_type === DiscountType.Money ? ticket.category : (categoryDiscountMoneys[0]?.value as number),
  );
  const [categoryPercent, setCategoryPercent] = useState<number>(
    ticket && ticket.discount_type === DiscountType.Percent ? ticket.category : (categoryDiscountMoneys[0]?.value as number),
  );
  const [discountPercent, setDiscountPercent] = useState<string>(
    ticket && ticket.discount_type === DiscountType.Percent ? _.toString(ticket.amount) : '',
  );
  const [discountType, setDiscountType] = useState(ticket ? ticket.discount_type : DiscountType.Money);
  const [applyType, setApplyType] = useState(ticket ? ticket.apply_type : ApplyType.Time);

  const [startDate, setStartDate] = useState<Date>(
    ticket && ticket.start_date_time !== undefined ? new Date(ticket.start_date_time) : new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const [endDate, setEndDate] = useState<Date>(
    ticket && ticket.end_date_time !== undefined ? new Date(ticket.end_date_time) : new Date(new Date().setHours(23, 59, 59, 59)),
  );
  const [applyDate, setApplyDate] = useState(ticket ? ticket.date_categorize_type_code : 1);
  const dayOfWeekValues = getDayOfWeekValues(
    ticket?.is_sunday,
    ticket?.is_monday,
    ticket?.is_tuesday,
    ticket?.is_wednesday,
    ticket?.is_thursday,
    ticket?.is_friday,
    ticket?.is_friday,
  );
  const [dayOfWeeks, setDayOfWeeks] = useState<IDayOfWeek[]>(dayOfWeekValues);

  const onChangeApplyType = (type: ApplyType) => {
    updateDateTime('start', null, 0, 0, 0);
    updateDateTime('end', null, 23, 59, 59);
    setApplyType(type);
  };

  const updateDateTime = (type: 'start' | 'end', date?: Date, hour?: number, min?: number, second?: number) => {
    switch (type) {
      case 'start': {
        const dateStart = new Date(startDate);
        if (date !== null) {
          dateStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        }
        if (hour !== null) {
          dateStart.setHours(hour, min, second);
        }
        setStartDate(dateStart);
        break;
      }
      case 'end': {
        const dateEnd = new Date(endDate);
        if (date !== null) {
          dateEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        }
        if (hour !== null) {
          dateEnd.setHours(hour, min, second);
        }
        setEndDate(dateEnd);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    if (ticketSuggest) {
      if (ticketSuggest.discount_type === DiscountType.Money) {
        setDiscountMoney(_.toString(ticketSuggest));
      } else {
        setDiscountPercent(_.toString(ticketSuggest.amount));
      }
      setDiscountType(ticketSuggest.discount_type);
    }
  }, [ticketSuggest]);

  useImperativeHandle(ref, () => ({
    getData() {
      const amount = parseInt(discountType === DiscountType.Money ? discountMoney : discountPercent, 10);
      return {
        record_id: ticket ? ticket.record_id : null,
        company_code: ticket ? ticket.company_code : '',
        store_code: ticket ? ticket.store_code : '',
        store_name: ticket ? ticket.store_name : '',
        code: ticket ? ticket.code : '',
        name: ticket ? ticket.name : '',
        new_name: ticket ? ticket.new_name : null,
        new_amount: ticket?.record_id ? amount : null,
        amount: ticket?.record_id ? ticket.amount : amount,
        category: discountType === DiscountType.Money ? categoryMoney : categoryPercent,
        type: ticket ? OperationType.Edit : OperationType.New,
        discount_type: discountType,
        apply_type: applyType,
        start_date_time: toDateString(startDate, SERVER_DATETIME_FORMAT),
        end_date_time: toDateString(endDate, SERVER_DATETIME_FORMAT),
        date_categorize_type_code: applyDate,
        is_sunday: dayOfWeeks[0].checked,
        is_monday: dayOfWeeks[1].checked,
        is_tuesday: dayOfWeeks[2].checked,
        is_wednesday: dayOfWeeks[3].checked,
        is_thursday: dayOfWeeks[4].checked,
        is_friday: dayOfWeeks[5].checked,
        is_saturday: dayOfWeeks[6].checked,
      };
    },
  }));

  return (
    <>
      <tr>
        <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
          <Translate contentKey="modalTicket.discount_type" />
          <span style={{ color: '#FA1E1E' }}>*</span>
        </td>
        <td>
          <div style={{ display: 'flex' }}>
            <div style={{ paddingTop: '8px' }}>
              <NormalRadioButton
                listCheckBox={discountTypeValues()}
                nameGroupRadio="discountTypeValues"
                value={discountType}
                isVertical={true}
                spacing={6}
                onChange={setDiscountType}
              />
            </div>
            <div style={{ marginRight: '30px' }}>
              <NumberInputText
                datatype="amount-money"
                disabled={discountType === DiscountType.Percent}
                maxLength={6}
                width="200px"
                value={discountMoney}
                onChange={(e: any) => setDiscountMoney(e)}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <NumberInputText
                  marginBottom={0}
                  datatype="amount-percent"
                  disabled={discountType === DiscountType.Money}
                  maxLength={2}
                  width="170px"
                  value={discountPercent}
                  onChange={(e: any) => setDiscountPercent(e)}
                />
                %
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '4px' }}>
                <NormalDropdown
                  disabled={discountType === DiscountType.Percent}
                  width="300px"
                  onDropdownChange={(_: any, value: number) => setCategoryMoney(value)}
                  options={categoryDiscountMoneys()}
                />
              </div>
              <NormalDropdown
                disabled={discountType === DiscountType.Money}
                width="300px"
                onDropdownChange={(_: any, value) => setCategoryPercent(value)}
                options={categoryDiscountPercents()}
              />
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <Translate contentKey="modalTicket.applyType" />
        </td>
        <td>
          <NormalRadioButton nameGroupRadio={'applyType'} listCheckBox={applyTypeValues()} value={applyType} onChange={onChangeApplyType} />
        </td>
      </tr>
      <tr>
        <td>
          <Translate contentKey="modalTicket.dateTime" />
        </td>
        <td style={{ display: 'flex', alignItems: 'center' }}>
          <DatePicker widthInput='170px' position={Position.Top} initValue={startDate} onChange={date => updateDateTime('start', date, null, null, null)} />
          <TimePicker
            position={Position.Top}
            initValue={startDate}
            disabled={applyType === ApplyType.Time}
            timePicked={(hour, min, second) => updateDateTime('start', null, hour, min, second)}
          />
          <div style={{ padding: '0 10px' }}>~</div>
          <DatePicker widthInput='170px' position={Position.Top} initValue={endDate} onChange={date => updateDateTime('end', date, null, null, null)} />
          <TimePicker
            position={Position.Top}
            initValue={endDate}
            disabled={applyType === ApplyType.Time}
            timePicked={(hour, min, second) => updateDateTime('end', null, hour, min, second)}
          />
        </td>
      </tr>
      <tr>
        <td>
          <Translate contentKey="modalTicket.applyDate" />
        </td>
        <td style={{ display: 'flex', alignItems: 'center' }}>
          <NormalRadioButton nameGroupRadio={'applyDate'} listCheckBox={applyDateValues()} value={applyDate} onChange={setApplyDate} />
          <DayOfWeek disable={applyDate === 1} initValues={dayOfWeekValues} onChange={data => setDayOfWeeks(data)} />
        </td>
      </tr>
    </>
  );
});
