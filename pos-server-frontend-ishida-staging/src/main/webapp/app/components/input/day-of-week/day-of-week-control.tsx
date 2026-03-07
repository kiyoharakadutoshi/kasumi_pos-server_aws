import React, { useRef, useState } from 'react';
import './day-of-week.scss';
import CheckboxControl from 'app/components/checkbox-button/checkbox-control';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import { Overlay, Popover } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/types';

enum DayOfWeekEnum {
  Mon = 'is_monday',
  Tue = 'is_tuesday',
  Wed = 'is_wednesday',
  Thu = 'is_thursday',
  Fri = 'is_friday',
  Sat = 'is_saturday',
  Sun = 'is_sunday',
}

interface DayOfWeekProp {
  name: string;
  disable?: boolean;
  dataType?: 'boolean' | 'number';
  errorPlacement?: Placement;
}

export const DayOfWeekControl: React.FC<DayOfWeekProp> = ({ name, disable, dataType, errorPlacement = 'top' }) => {
  const {
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const errorName = `${name}.${DayOfWeekEnum.Mon}`;
  const errorForm = _.get(errors, errorName)?.message as string;
  const isError = !isNullOrEmpty(errorForm);
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => isError && !showError && setShowError(true);
  const onMouseLeave = () => showError && setShowError(false);

  return (
    <div
      className={`day-of-week${isError ? ' day-of-week__error' : ''}`}
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {Object.values(DayOfWeekEnum).map((value) => (
        <CheckboxControl
          dataType={dataType}
          disabled={disable}
          key={value}
          id={value}
          name={`${name}.${value}`}
          textValue={localizeString(`dayOfWeek.${value}`)}
          onChange={() => {
            clearErrors(errorName);
          }}
        />
      ))}

      {isError && (
        <Overlay show={showError} target={ref.current} placement={errorPlacement}>
          <Popover id="popover-basic">
            <Popover.Body>{errorForm}</Popover.Body>
          </Popover>
        </Overlay>
      )}
    </div>
  );
};

export default DayOfWeekControl;
