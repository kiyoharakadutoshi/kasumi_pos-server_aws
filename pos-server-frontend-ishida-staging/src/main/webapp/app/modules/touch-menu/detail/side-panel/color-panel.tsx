import React, { useEffect, useState } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';

const ColorPanel = ({
  title,
  colors,
  value,
  onChange,
  disabled,
}: {
  title?: string;
  colors: string[];
  value?: string;
  onChange?: (color: string, index: number) => void;
  disabled?: boolean;
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(value ?? colors[0]);

  const handleColorChange = (color: string, index: number) => {
    if (!disabled) {
      setSelectedColor(color);
      onChange && onChange(color, index);
    }
  };

  useEffect(() => {
    setSelectedColor(value ?? colors[0]);
  }, [value]);

  return (
    <div className={'color-picker-side-panel'}>
      {title && <div className='side-panel-item-name'>{localizeString(title)}</div>}
      <div className="tab-pre-color">
        {colors?.map((color, index) => (
          <div key={index}>
            <button
              key={index}
              type="button"
              id={`square${color}`}
              className={`square ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color, index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPanel;
