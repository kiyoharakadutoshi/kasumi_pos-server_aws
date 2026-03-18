import React from 'react';
import './select-custom.scss'

const SelectCustom = () => {
  return (
    <select id="select-custom" className="round">
      <option className="round__option">1</option>
      <option className="round__option">2</option>
      <option className="round__option">3</option>
    </select>
  );
};

export default SelectCustom;
