import React from 'react';

// Components
import { dateStringOfDate } from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import { ITimeProps } from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import TooltipDatePickerControl from '../tooltip-date-picker/tooltip-date-picker-control';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';

// Helpers
import { toShortDate } from '@/helpers/date-utils';

// Styles
import './styles.scss';

const DateTimeStartEndControl = ({
  labelText,
  height,
  required,
  disabled,
  startDate,
  startTime,
  endDate,
  endTime,
  startDateName,
  startTimeName,
  endDateName,
  endTimeName,
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
  hiddenTime,
}: {
  labelText?: string;
  height?: string | number;
  required?: boolean,
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
  startDateName: string,
  startTimeName: string,
  endDateName: string,
  endTimeName: string,
  hiddenTime?: boolean,
}) => {
  if (type === 'secondary') {
    return (
      <div className="date-time-start-end">
        <TooltipDatePickerControl
          labelText={labelText}
          name={startDateName}
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
          heightDateTime={height}
          required={required}
        />
        {
          !hiddenTime && (
            <TooltipTimePickerControl
              name={startTimeName}
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
              height={height}
            />
          )
        }

        <span> ～ </span>
        <TooltipDatePickerControl
          name={endDateName}
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
          heightDateTime={height}
        />
        {
          !hiddenTime && (
            <TooltipTimePickerControl
              name={endTimeName}
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
              height={height}
            />
          )
        }
      </div>
    );
  }

  return (
    <div className="date-time-start-end">
      <TooltipDatePickerControl
        name={startDateName}
        onChange={onChangeStartDate}
        isShortDate={true}
        initValue={toShortDate(startDate)}
        inputClassName="date-time-start-end__start-date"
        hasInitValue={hasInitDate}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.start_date'}
      />
      <TooltipDatePickerControl
        name={startTimeName}
        inputClassName="date-time-start-end__end-date"
        onChange={onChangeEndDate}
        isShortDate={true}
        initValue={toShortDate(endDate)}
        hasInitValue={hasInitDate}
        checkEmpty={true}
        disabled={disabled}
        keyError={'specialPromotion.end_date'}
      />
      <TooltipTimePickerControl
        name={endDateName}
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
      <TooltipTimePickerControl
        name={endTimeName}
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
  const startDateString = dateStringOfDate(new Date(Date.parse(startDate)), true, false);
  const endDateString = dateStringOfDate(new Date(Date.parse(endDate)), true, false);

  return (
    <div className="date-time-start-end">
      <label className="date-time-start-end__text-value date-time-start-end__start-date">{startDateString}</label>
      <label className="date-time-start-end__text-value date-time-start-end__end-date">{endDateString}</label>
      <label className="date-time-start-end__text-value date-time-start-end__start-time">{startTime}</label>
      <label className="date-time-start-end__text-value date-time-start-end__end-time">{endTime}</label>
    </div>
  );
};

export default DateTimeStartEndControl;
