import {
  convertDateServer,
  daysBetweenDates,
  isValidDateInRange,
  monthsBetweenDates,
  toDateString,
} from 'app/helpers/date-utils';
import React, { useState, useEffect, useRef } from 'react';
import { SERVER_DATE_FORMAT, SERVER_DATE_FORMAT_COMPACT } from 'app/constants/date-constants';
import './tooltip-date-picker.scss';
import { Overlay, Popover } from 'react-bootstrap';
import InputTextMarkCustom from 'app/components/input-text-mark/input-text-mark-custom';
import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { isNaN, isUndefined } from 'lodash';
import { isValid } from 'date-fns';
import { Placement } from 'react-bootstrap/types';
import { KEYDOWN } from 'app/constants/constants';

export interface IDatePickerProps {
  name?: string;
  initValue?: Date;
  onChange?: (date: Date) => void;
  onBlur?: (date: Date) => void;
  heightDateTime?: string | number;
  pickerClassName?: string;
  isShortDate?: boolean;
  placeholder?: string;
  hasInitValue?: boolean;
  inputClassName?: string;
  isPopover?: boolean;
  disabled?: boolean;
  checkEmpty?: boolean;
  reload?: any;
  error?: string;
  keyError?: string;
  labelText?: string;
  required?: boolean;
  errorPlacement?: Placement;
  widthLabel?: string;
  calendarPlacement?: Placement;
  validate?: (date: Date) => NonNullable<unknown>;
  minDate?: Date;
  maxDate?: Date;
  isValidateByRangeDays?: boolean;
  messageError?: string;
}

const dateOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];

export const dateStringOfDate = (date?: Date, isShortDate?: boolean, hasInitValue?: boolean) => {
  if ((!date || isNaN(date.getTime())) && !hasInitValue) return '';
  const selectDate = date ?? new Date();
  const dateStr = toDateString(selectDate, isShortDate ? SERVER_DATE_FORMAT_COMPACT : SERVER_DATE_FORMAT);
  const dayOfWeek = dateOfWeeks[selectDate.getDay()];
  return `${dateStr}(${dayOfWeek})`;
};

const getDayOfWeek = (date?: Date, dateString?: string) => {
  if (!date) return '日';
  if (!isValid(date)) {
    const prevDayOfWidth = dateString?.slice(-2, -1);
    if (dateOfWeeks.includes(prevDayOfWidth)) {
      return prevDayOfWidth;
    }
    return '日';
  }
  const selectDate = date ?? new Date();
  return dateOfWeeks[selectDate.getDay()];
};

const TooltipDatePicker: React.FC<IDatePickerProps> = ({
  placeholder,
  initValue,
  onChange,
  onBlur: onBlurProp,
  heightDateTime,
  pickerClassName,
  isShortDate,
  hasInitValue = true,
  inputClassName,
  isPopover = false,
  disabled,
  checkEmpty,
  reload,
  error,
  keyError = '',
  labelText,
  required,
  name,
  errorPlacement,
  widthLabel,
  calendarPlacement,
  validate,
  minDate,
  maxDate,
  isValidateByRangeDays,
  messageError,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initValue);
  const [currentDate, setCurrentDate] = useState(selectedDate && isValid(selectedDate) ? selectedDate : new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateString, setDateString] = useState<string>(dateStringOfDate(initValue, isShortDate, hasInitValue));
  const [errorMsg, setError] = useState<string>(null);
  const [showError, setShowError] = useState(false);
  const isError = error?.length > 0 || errorMsg?.length > 0;

  // Use minDate, maxDate without hour
  minDate?.setHours(0, 0, 0, 0);
  maxDate?.setHours(0, 0, 0, 0);

  useEffect(() => {
    setError(null);
    if (!initValue || isNaN(initValue)) {
      setCurrentDate(new Date());
      setDateString(null);
      return;
    }

    setSelectedDate(initValue);
  }, [reload]);

  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setDateString(dateStringOfDate(selectedDate, isShortDate, hasInitValue));
    }
  }, [selectedDate]);

  useEffect(() => {
    setSelectedDate(initValue);
    if (isValid(initValue)) {
      setError(null);
    } else if (!initValue && selectedDate) {
      setDateString(null);
      setError(null);
    }
  }, [initValue]);

  useEffect(() => {
    if (isCalendarVisible) {
      setCurrentDate(initValue && isValid(initValue) ? initValue : new Date());
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!isCalendarVisible) return;
      if (!pickerRef.current?.contains(event.target as Node) && !popoverRef.current?.contains(event.target as Node)) {
        setIsCalendarVisible(false);
        setCurrentDate(selectedDate && isValid(selectedDate) ? selectedDate : new Date());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarVisible]);

  useEffect(() => {
    if (isNullOrEmpty(error) && isNullOrEmpty(errorMsg)) setShowError(false);
  }, [errorMsg, error]);

  const onChangeDate = (date?: Date) => {
    if (!date || !isValid(date)) {
      setCurrentDate(new Date());
    } else {
      setCurrentDate(date);
    }
    setSelectedDate(date);
    onChange?.(date);
  };

  /*
    Handle keyboard event when focus input
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
      event.preventDefault();
      handleSpaceKeydown();
      return;
    }

    if (event.key === KEYDOWN.Tab || event.key === KEYDOWN.Enter) {
      setIsCalendarVisible(false);
    }
  };

  const handleSpaceKeydown = () => {
    if (document.activeElement.className.includes('calendar-previous-month')) {
      handlePreviousMonth(null);
      return;
    }

    if (document.activeElement.className.includes('calendar-next-month')) {
      handleNextMonth(null);
      return;
    }

    if (isCalendarVisible) {
      const inputElement: HTMLInputElement = pickerRef.current?.querySelector('input:not([disabled])');
      inputElement?.focus();
      onChangeDate(currentDate);
    }

    setIsCalendarVisible(!isCalendarVisible);
  };

  const handleDateChange = (date: Date) => {
    setError(null);
    setShowError(false);
    onChangeDate(date);
    setIsCalendarVisible(false);
  };

  const getCurrentMonthDays = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    return days;
  };

  const handlePreviousMonth = (e: any) => {
    e?.target?.blur();
    const monthCurrent = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    if (
      (isUndefined(maxDate) && !isUndefined(minDate) && monthCurrent > minDate) ||
      (monthCurrent < maxDate && monthCurrent > minDate)
    ) {
      setCurrentDate(monthCurrent);
    } else {
      setCurrentDate(!isUndefined(minDate) ? minDate : monthCurrent);
    }
  };

  const handleNextMonth = (e: any) => {
    e?.target?.blur();
    const monthCurrent = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (monthCurrent > maxDate) {
      return;
    }

    if (
      (isUndefined(minDate) && !isUndefined(maxDate) && monthCurrent < maxDate) ||
      (monthCurrent < maxDate && monthCurrent > minDate)
    ) {
      setCurrentDate(monthCurrent);
    } else {
      setCurrentDate(!isUndefined(maxDate) ? maxDate : monthCurrent);
    }
  };

  const isToday = (date: Date | null) => {
    return (
      date &&
      date.getFullYear() === new Date().getFullYear() &&
      date.getMonth() === new Date().getMonth() &&
      date.getDate() === new Date().getDate()
    );
  };

  const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateString(inputValue);

    if (isNullOrEmpty(inputValue)) {
      setError(checkEmpty ? localizeFormat('MSG_VAL_001', keyError) : error);
      onChangeDate(null);
      return;
    }

    const values = inputValue?.replace(/[^0-9/]/g, '')?.split('/') ?? [];
    // Check format date yy/mm/dd
    if (values?.length < 3) {
      onChangeDate(new Date('invalid'));
      setError(localizeFormat('MSG_VAL_016', keyError));
      return;
    }
    const [yearStr, monthStr, dayStr] = values;
    let yearNum = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    yearNum = Math.floor(new Date().getFullYear() / 100) * 100 + yearNum;
    const date = new Date(yearNum, month, day);

    onBlurProp && onBlurProp(date);
    // Check valid date by 'validate rule'
    if (validate) {
      if (validate(date)) {
        setError(localizeFormat('MSG_VAL_019', keyError));
        onChangeDate(new Date('invalid'));
        return;
      }
    }

    // Check valid date
    if (date && date.getFullYear() === yearNum && date.getMonth() === month && date.getDate() === day) {
      if (isValidDateInRange(date, minDate, maxDate)) {
        onChangeDate(date);
        setError(null);
      } else {
        setDateString(dateStringOfDate(date, isShortDate, hasInitValue));
        onChangeDate(new Date('invalid'));

        if (isValidateByRangeDays) {
          const rangeDays = daysBetweenDates(minDate, maxDate);
          setError(localizeFormat('MSG_VAL_074', rangeDays + 1));
        } else {
          const rangeMonth = monthsBetweenDates(minDate, maxDate);
          setError(localizeFormat(messageError ?? 'MSG_VAL_070', rangeMonth));
        }
      }
      return;
    }

    onChangeDate(new Date('invalid'));
    setError(localizeFormat('MSG_VAL_016', keyError));
  };

  const regexDateInput = () => {
    return [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, '(', getDayOfWeek(selectedDate, dateString), ')'];
  };

  const calendarView = (className?: string) => {
    return (
      <div
        className={`${className ?? 'date-picker__calendar'} ${pickerClassName}`}
        ref={calendarRef}
        onClick={() => calendarRef.current?.focus()}
        tabIndex={-1}
      >
        <div className="date-picker__calendar-header">
          <button className="date-picker__calendar-action-button calendar-previous-month" onClick={handlePreviousMonth}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20px" height="20px">
              <path
                fill="#444444"
                d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
              />
            </svg>
          </button>
          <span style={{ fontWeight: '600' }}>
            {currentDate?.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button className="date-picker__calendar-action-button calendar-next-month" onClick={handleNextMonth}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20px" height="20px">
              <path
                fill="#444444"
                d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
              />
            </svg>
          </button>
        </div>
        <div className="date-picker__calendar-grid-day">
          {dateOfWeeks.map((date, index) => (
            <div className="date-picker__calendar-day" key={index}>
              {date}
            </div>
          ))}
          {getCurrentMonthDays().map((date, index) => {
            const isSelected = currentDate && convertDateServer(currentDate) === convertDateServer(date);
            const dateValid = isValidDateInRange(date, minDate, maxDate);
            return (
              <div
                className={
                  date &&
                  `date-picker__calendar-day ${
                    isSelected ? 'date-picker__calendar-selected-day' : 'date-picker__calendar-day-hover'
                  }${
                    dateValid ? '' : ' date-picker__calendar-day-invalid'
                  } ${isToday(date) && !isSelected ? 'date-picker__calendar-today' : ''}`.trim()
                }
                key={index}
                onClick={() => date && handleDateChange(date)}
                tabIndex={isSelected ? 2 : -1}
              >
                {date?.getDate() ?? ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      onMouseEnter={() => {
        if (isError) setShowError(true);
      }}
      onMouseLeave={() => setShowError(false)}
      ref={pickerRef}
      className="date-picker"
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
    >
      <InputTextMarkCustom
        name={name}
        required={required}
        mask={regexDateInput}
        placeholder={placeholder}
        height={heightDateTime}
        value={dateString}
        onClick={() => setIsCalendarVisible(true)}
        onChange={(event) => setDateString(event.target.value)}
        onBlur={onBlur}
        className={`input-date-picker ${inputClassName ?? ''}`.trim()}
        disabled={disabled}
        isError={isError}
        labelText={labelText}
        widthLabel={widthLabel}
      />
      {isPopover ? (
        <Overlay
          show={isCalendarVisible}
          target={pickerRef?.current}
          placement={calendarPlacement ?? 'left'}
          ref={popoverRef}
        >
          <Popover id="popover-basic" className="date-picker__popover-date-picker">
            <Popover.Body>{calendarView('date-picker__calendar-popover')}</Popover.Body>
          </Popover>
        </Overlay>
      ) : (
        <>{isCalendarVisible && calendarView()}</>
      )}
      <Overlay show={showError && !isCalendarVisible} target={pickerRef?.current} placement={errorPlacement || 'left'}>
        <Popover id="popover-basic">
          <Popover.Body>{errorMsg ?? error}</Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default TooltipDatePicker;
