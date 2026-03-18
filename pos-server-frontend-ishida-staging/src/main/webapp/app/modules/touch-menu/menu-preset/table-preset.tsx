import { Translate } from 'react-jhipster';
import React from 'react';
import './menu-preset.scss';
import { PresetLayout } from './interface-preset';
import { OperationType } from 'app/components/table/table-common';

const TablePresetLayout = ({
  items,
  selectedIndex,
  handleSelectRow,
  onDoubleClick,
}: {
  items: PresetLayout[];
  selectedIndex?: number;
  handleSelectRow: (preset: PresetLayout, index: number) => void;
  onDoubleClick: (preset: PresetLayout, index: number) => void;
}) => {
  return (
    <div style={{ width: '100%' }} className="table-container table-menu-preset-container">
      {items?.length > 0 && (
        <table className="table table-responsive table-striped table-scroll-preset">
          <thead className="table-secondary title-table table-menu-preset-header">
            <tr style={{ verticalAlign: 'middle', textAlign: 'center' }}>
              <th scope="col">
                {<Translate contentKey="touchMenu.table.store" />}
              </th>
              <th scope="col">
                {<Translate contentKey="touchMenu.table.presetLayoutCode" />}
              </th>
              <th scope="col">
                {<Translate contentKey="touchMenu.table.presetLayoutName" />}
              </th>
              <th scope="col">
                {<Translate contentKey="touchMenu.table.applyDate" />}
              </th>
            </tr>
          </thead>
          <tbody className='body-menu-preset'>
            {items?.map((preset, index) => {
              const isSelected = selectedIndex === index;
              const isDelete = preset?.operation_type === OperationType.Remove;
              const isChangeValuePreset =
                preset?.operation_type === OperationType.New || preset?.operation_type === OperationType.Edit || preset?.copy;
              return (
                <tr
                  key={index}
                  onClick={() => handleSelectRow(preset, index)}
                  onDoubleClick={() => onDoubleClick(preset, index)}
                  className={`list-touch-menu${isSelected ? ' table-primary' : ''}${isDelete ? ' record-remove' : ''}`}
                >
                  <td  className={`${isChangeValuePreset ? 'red-text' : 'item-touch-menu'}`}>
                    {preset?.store_code} : {preset?.store_name}
                  </td>
                  <td className={`${isChangeValuePreset ? 'red-text' : 'item-touch-menu'}`}>{preset?.preset_layout_code}</td>
                  <td className={`${isChangeValuePreset ? 'red-text' : 'item-touch-menu'}`}>{preset?.preset_layout_name}</td>
                  <td className={`${isChangeValuePreset ? 'red-text' : 'item-touch-menu'}`}>{preset?.booking_date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TablePresetLayout;
