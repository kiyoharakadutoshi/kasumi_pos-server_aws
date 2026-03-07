import './date-time.scss';
import React from 'react';
import TooltipDatePicker, { dateStringOfDate } from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import TooltipTimePicker, { ITimeProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { toDate, toShortDate } from 'app/helpers/date-utils';

const DateTimeStartEnd = ({
  disabled,
  startDate,
  startTime,
  endDate,
  endTime,
  hasInitDate,
  onChangeStartDate,
  onChangeEndDate,
  onChangeStartTime,
  onChangeEndTime,
  errorStartDate,
  errorEndDate,
  errorStartTime,
  errorEndTime,
  type = 'primary',
}: {
  disabled?: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  hasInitDate?: boolean;
  onChangeStartDate?: (date?: Date) => void;
  onChangeEndDate?: (date?: Date) => void;
  onChangeStartTime?: (time: ITimeProps, timeStr?: string) => void;
  onChangeEndTime?: (time?: ITimeProps, timeStr?: string) => void;
  type?: 'primary' | 'secondary';
  errorStartDate?: string;
  errorEndDate?: string;
  errorStartTime?: string;
  errorEndTime?: string;
}) => {
  if (type === 'secondary') {
    return (
      <div className="date-time-start-end">
        <TooltipDatePicker
          onChange={onChangeStartDate}
          isShortDate={true}
          initValue={toShortDate(startDate)}
          placeholder={dateStringOfDate(new Date(), true, hasInitDate)}
          inputClassName="date-time-start-end__start-date"
          hasInitValue={hasInitDate}
          checkEmpty={true}
          disabled={disabled}
          keyError={'specialPromotion.start_date'}
          error={errorStartDate}
        />
        <TooltipTimePicker
          placeholder="00:00"
          initValue={startTime}
          widthInput="80px"
          hasInitValue={hasInitDate}
          inputClassName="date-time-start-end__start-time"
          onChange={onChangeStartTime}
          checkEmpty={true}
          disabled={disabled}
          keyError={'specialPromotion.start_time'}
          error={errorStartTime}
        />
        <span> ～ </span>
        <TooltipDatePicker
          inputClassName="date-time-start-end__end-date"
          onChange={onChangeEndDate}
          isShortDate={true}
          initValue={toShortDate(endDate)}
          placeholder={dateStringOfDate(new Date(), true, hasInitDate)}
          hasInitValue={hasInitDate}
          checkEmpty={true}
          disabled={disabled}
          keyError={'specialPromotion.end_date'}
          error={errorEndDate}
        />
        <TooltipTimePicker
          placeholder="00:00"
          initValue={endTime}
          widthInput="80px"
          hasInitValue={hasInitDate}
          inputClassName="date-time-start-end__end-time"
          onChange={onChangeEndTime}
          checkEmpty={true}
          disabled={disabled}
          keyError={'specialPromotion.end_time'}
          error={errorEndTime}
        />
      </div>
    );
  }

  return (
    <div className="date-time-start-end">
      <TooltipDatePicker
        onChange={onChangeStartDate}
        isShortDate={true}
        initValue={toShortDate(startDate)}
        inputClassName="date-time-start-end__start-date"
        hasInitValue={hasInitDate}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.start_date'}
      />
      <TooltipDatePicker
        inputClassName="date-time-start-end__end-date"
        onChange={onChangeEndDate}
        isShortDate={true}
        initValue={toShortDate(endDate)}
        hasInitValue={hasInitDate}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.end_date'}
      />
      <TooltipTimePicker
        placeholder="00:00"
        initValue={startTime}
        widthInput="80px"
        hasInitValue={hasInitDate}
        inputClassName="date-time-start-end__start-time"
        onChange={onChangeStartTime}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.start_time'}
      />
      <TooltipTimePicker
        placeholder="00:00"
        initValue={endTime}
        widthInput="80px"
        hasInitValue={hasInitDate}
        inputClassName="date-time-start-end__end-time"
        onChange={onChangeEndTime}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.end_time'}
      />
    </div>
  );
};

export const DateTimeText = ({
  startDate,
  startTime,
  endDate,
  endTime,
}: {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}) => {
  const startDateString = dateStringOfDate(toDate(startDate), true, false);
  const endDateString = dateStringOfDate(toDate(endDate), true, false);

  return (
    <div className="date-time-start-end">
      <label className="date-time-start-end__text-value date-time-start-end__start-date">{startDateString}</label>
      <label className="date-time-start-end__text-value date-time-start-end__end-date">{endDateString}</label>
      <label className="date-time-start-end__text-value date-time-start-end__start-time">{startTime}</label>
      <label className="date-time-start-end__text-value date-time-start-end__end-time">{endTime}</label>
    </div>
  );
};

export default DateTimeStartEnd;
