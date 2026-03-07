import './tooltip-time-picker.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Position } from 'app/components/date-picker/date-picker';
import { isNullOrEmpty, localizeFormat, parseString } from 'app/helpers/utils';
import { Overlay, Popover } from 'react-bootstrap';
import InputTextMarkCustom from 'app/components/input-text-mark/input-text-mark-custom';
import { Placement } from 'react-bootstrap/types';

export interface ITimeProps {
  hour?: string;
  minute?: string;
  second?: string;
}

export interface TimePickerProps {
  name?: string;
  position?: Position;
  hasSecond?: boolean;
  initValue?: string;
  disabled?: boolean;
  width?: string;
  height?: string | number;
  fontSize?: string;
  onChange?: (time?: ITimeProps, timeStr?: string) => void;
  widthInput?: string;
  className?: string;
  placeholder?: string;
  hasInitValue?: boolean;
  inputClassName?: string;
  isPopover?: boolean;
  checkEmpty?: boolean;
  reload?: any;
  error?: string;
  keyError?: string;
  labelText?: string;
  required?: boolean;
  errorPlacement?: Placement;
  timePlacement?: Placement
}

export const INVALID_TIME = 'Invalid Time';

const hours = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);
const minutes = ['00', '30'];
const times = hours.flatMap((hour) =>
  minutes.map((minute) => `${hour}:${minute}`)
);

// const seconds = Array.from({ length: 60 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);

export const getTimeInput = (
  time?: string,
  hasSecond?: boolean,
  hasInitValue?: boolean
) => {
  if (!time && !hasInitValue) return '';
  return time?.substring(0, 5) ?? '';
};

const TooltipTimePicker: React.FC<TimePickerProps> = ({
  name,
  hasSecond,
  initValue,
  disabled,
  height,
  onChange,
  widthInput,
  className,
  placeholder,
  hasInitValue = true,
  inputClassName,
  isPopover,
  checkEmpty,
  reload,
  error,
  keyError = '',
  labelText,
  required,
  timePlacement,
  errorPlacement
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [timeInput, setTimeInput] = useState<string>(
    getTimeInput(initValue, hasSecond, hasInitValue)
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState(null);
  const [errorMsg, setError] = useState<string>(null);
  const [showError, setShowError] = useState(false);
  const [focusValue, setFocusValue] = useState<string>(timeInput);
  const isError = error?.length > 0 || errorMsg?.length > 0;

  useEffect(() => {
    setError(null);
    if (initValue === timeInput) return;
    setTimeInput(getTimeInput(initValue, hasSecond, hasInitValue));
  }, [reload]);

  useEffect(() => {
    if (isOpen) {
      const indexItem = times.findIndex((time) => time === timeInput);
      scrollToItem(timeRef, indexItem, false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusValue !== timeInput) setFocusValue(timeInput);
  }, [timeInput]);

  useEffect(() => {
    if (isNullOrEmpty(initValue)) {
      if (isNullOrEmpty(timeInput)) return;
      setTimeInput('');
      setError(null);
      return;
    }

    if (initValue !== INVALID_TIME) {
      setError(null);
      setTimeInput(getTimeInput(initValue, hasSecond, hasInitValue));
    }
  }, [initValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      if (
        !pickerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const scrollToItem = (
    ref: React.MutableRefObject<HTMLElement>,
    index: number,
    animated: boolean = true
  ) => {
    if (!ref.current) return;
    const element: HTMLElement = ref.current.querySelector(
      `#time-picker-item-${index}`
    );
    if (!element) return;
    const containerRect = ref.current.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    if (itemRect.top < containerRect.top) {
      ref.current.scrollTo({
        behavior: animated ? 'smooth' : 'instant',
        top: index * element.offsetHeight,
      });
      return;
    }

    if (itemRect.bottom > containerRect.bottom) {
      ref.current.scrollTo({
        behavior: animated ? 'smooth' : 'instant',
        top: (index + 1) * element.offsetHeight - containerRect.height,
      });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
  };

  /*
    Handle keyboard event when focus input
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ') {
      handleSpaceEvent(event);
      return;
    }

    if (isOpen) {
      // Tab to select item when show menu time picker
      if (event.key === 'Tab' || event.key === 'Enter') {
        stopEvent(event);
        setIsOpen(false);
        if (focusValue !== timeInput) {
          setTimeInput(focusValue);
        }
        return;
      }

      // Arrow up, down to focus next/prev item when show menu time picker
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        handleArrowKey(event.key);
        return;
      }
    }

    if (event.key === 'Enter') {
      handleEnterEvent(event);
    }
  };

  const handleEnterEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const inputElement: HTMLInputElement =
      pickerRef.current.querySelector('.input-text-mark');
    if (!inputElement) return;

    const outFocus = () => {
      setIsOpen(false);
      setTimeout(() => inputElement.blur(), 10);
    };

    if (isNullOrEmpty(timeInput)) {
      outFocus();
      return;
    }

    // Focus year when select all value
    if (
      inputElement.selectionStart === 0 &&
      inputElement.selectionEnd === inputElement.value.length
    ) {
      inputElement.setSelectionRange(0, 0);
      event.stopPropagation();
      return;
    }

    // Get index focus (hour, min)
    const index = Math.floor(inputElement.selectionStart / 3);
    const values = timeInput.split(':');

    // If index focus is out focus
    if (index >= values.length) {
      outFocus();
      return;
    }

    // Check hour, min value empty entered
    const value = values[index]?.replace(/[^0-9]/g, '');

    // Create new time string
    values[index] = value.padStart(2, '0');
    const newTimeStr = values.join(':');
    setTimeInput(newTimeStr);

    // Focus to new element (minute)
    const nextPosition = index * 3 + 3;
    inputElement.setSelectionRange(nextPosition, nextPosition);

    // If focus is min => out focus
    if (index >= 1) {
      outFocus();
    } else {
      event.stopPropagation();
    }
  };

  const handleSpaceEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    stopEvent(event);
    if (isOpen && focusValue !== timeInput) {
      setTimeInput(focusValue);
    }

    setIsOpen(!isOpen);
  };

  const handleArrowKey = (type: 'ArrowUp' | 'ArrowDown') => {
    let currentIndex = times.findIndex((item) => item === focusValue);

    switch (type) {
      case 'ArrowDown':
        currentIndex = currentIndex + 1;
        break;
      case 'ArrowUp':
        currentIndex = currentIndex - 1;
        break;
      default:
        break;
    }

    if (currentIndex >= 0 && currentIndex < times.length) {
      setFocusValue(times[currentIndex]);
      scrollToItem(timeRef, currentIndex, true);
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTimeInput(inputValue);

    if (isNullOrEmpty(inputValue)) {
      onChange && onChange();
      setError(checkEmpty ? localizeFormat('MSG_VAL_001', keyError) : error);
      return;
    }

    const values = inputValue?.replace(/[^0-9:]/g, '')?.split(':') ?? [];

    // Check format time hh:mm
    if (values?.length < 2) {
      onChange && onChange(null, INVALID_TIME);
      setError(localizeFormat('MSG_VAL_016', keyError));
      return;
    }
    const [hourInt, minInt] = values.map((item) => parseInt(item, 10));
    if (isNaN(hourInt) || isNaN(minInt) || hourInt > 23 || minInt > 59) {
      onChange && onChange(null, INVALID_TIME);
      setError(localizeFormat('MSG_VAL_016', keyError));
      return;
    }
    const newHour = parseString(hourInt, 2);
    const newMin = parseString(minInt, 2);
    const newTime = `${newHour}:${newMin}`;
    setTimeInput(newTime);
    onChange &&
      onChange({ hour: newHour, minute: newMin, second: '00' }, newTime);
    setError(null);
  };

  const regexTimeInput = () => {
    return [/\d/, /\d/, ':', /\d/, /\d/];
  };

  const onClickItem = (time: string) => {
    setTimeInput(time);
    setError(null);
    setIsOpen(false);
    if (onChange) {
      const newTimes = time.split(':');
      onChange({ hour: newTimes[0], minute: newTimes[1], second: '00' }, time);
    }
  };

  const menuTimePickerView = (classNameMenu?: string) => {
    return (
      <div className={classNameMenu ?? 'time-picker__menu'} ref={menuRef}>
        <div ref={timeRef} className="time-picker__time-scroll">
          {times.map((time: string, index: number) => (
            <label
              key={`${time}${index}`}
              className={`time-picker__time-scroll-item ${time === focusValue ? 'time-picker__time-scroll-item-selected' : ''}`.trim()}
              onClick={() => onClickItem(time)}
              id={`time-picker-item-${index}`}
            >
              {time}
            </label>
          ))}
        </div>
      </div>
    );
  };

  const stopEvent = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div
      ref={pickerRef}
      className={`time-picker ${className ?? ''}`.trim()}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
    >
      <InputTextMarkCustom
        name={name}
        required={required}
        mask={regexTimeInput}
        onClick={() => setIsOpen(true)}
        onFocus={(event) => setTarget(event?.target)}
        disabled={disabled}
        className={`time-picker__time-picker-input ${inputClassName ?? ''}`.trim()}
        value={timeInput}
        onChange={handleTimeChange}
        onBlur={handleBlur}
        width={widthInput}
        placeholder={placeholder}
        isError={isError}
        labelText={labelText}
        onMouseEnter={(event: any) => {
          setTarget(event?.target);
          if (isError) setShowError(true);
        }}
        onMouseLeave={() => setShowError(false)}
        height={height}
      />
      {isPopover ? (
        <Overlay show={isOpen} target={target} placement={timePlacement ?? 'left'}>
          <Popover id="popover-basic" className="time-picker__popover-menu">
            <Popover.Body>
              {menuTimePickerView('time-picker__popover-content')}
            </Popover.Body>
          </Popover>
        </Overlay>
      ) : (
        <>{isOpen && menuTimePickerView()}</>
      )}
      <Overlay show={showError && !isOpen} target={target} placement={errorPlacement ?? 'left'}>
        <Popover id="popover-basic">
          <Popover.Body>{errorMsg ?? error}</Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default TooltipTimePicker;
