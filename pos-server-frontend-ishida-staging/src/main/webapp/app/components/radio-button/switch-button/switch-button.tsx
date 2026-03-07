import React, { useState } from 'react';
import './styled.scss';
interface CheckboxSwitchProps {
  heightButton?: string;
  widthButton?: string;
  rightCheckedLabel?: string | React.ReactNode;
  leftCheckedLabel?: string | React.ReactNode;
  rightCheckedColor?: string;
  leftCheckedColor?: string;
  name?: any;
  id?: any;
  onChange?: (checked: boolean) => void
}
const CheckboxSwitch: React.FC<CheckboxSwitchProps> = ({
  heightButton,
  widthButton,
  rightCheckedLabel,
  leftCheckedLabel,
  rightCheckedColor,
  leftCheckedColor,
  onChange,
  ...props
}) => {
  const [isLeftCheck, setIsLeftCheck] = useState(false);

  const handleToggle = () => {
    setIsLeftCheck(!isLeftCheck);
    onChange(!isLeftCheck)

  };

  return (
    <div
      className={`checkbox-switch`}
      style={
        {
          '--left-checked-color': leftCheckedColor ?? '#0F6DB5',
          '--right-checked-color': rightCheckedColor ?? '#00B91F',
        } as React.CSSProperties
      }
    >
      <label
        className="switch"
        style={{
          height: heightButton ?? '48px',
          width: widthButton ?? '160px',
        }}
      >
        <input type="checkbox" checked={isLeftCheck} onChange={handleToggle} {...props} />
        <span className="slider round" data-right-checked-label={rightCheckedLabel} data-left-checked-label={leftCheckedLabel}></span>
      </label>
    </div>
  );
};

export default CheckboxSwitch;
