import React, { useEffect, useMemo } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import { useAppSelector } from 'app/config/store';
import { PresetMenuButton } from '../../interface-preset';
import { IMasterCode } from 'app/reducers/master-reducer';
import { isNullOrEmpty } from 'app/helpers/utils';
import './preset-button.scss'
import Dropdown from 'app/components/dropdown/dropdown';

const SizeFunction = ({ functionCode, onChangeFunctionCode }: { functionCode: string; onChangeFunctionCode: (value: string) => void }) => {
  const masters: IMasterCode[] = useAppSelector(state => state.masterReducer.masters);
  const presetButton: PresetMenuButton = useAppSelector(state => state.presetReducer.presetButton);

  useEffect(() => {
    if (functionCode?.length > 0) {
      return;
    }
    if (masters?.length > 0 && masters[0].items?.length > 0) {
      onChangeFunctionCode(masters[0].items[0].event_group_code);
      return;
    }
  }, []);

  const dropdownValues = useMemo(
    () =>
      !isNullOrEmpty(masters)
        ? masters[0].items?.map(master => {
          return {
            id: master.setting_data_type,
            value: master.setting_data_type,
            code: master.setting_data_type,
            name: master.event_group_name,
          };
        })
        : [],
    [masters],
  );

  const disableButton = () => {
    return presetButton?.display_status === 0;
  };

  return (
    <>
      <div className="container-side-funtion">
        <span className="side-panel-item-name">機能コード</span>
        <Dropdown
          value={functionCode}
          items={dropdownValues ?? []}
          onChange={(item) => {
            onChangeFunctionCode(item?.value as any);
          }}
          disabled={disableButton()}
        />
      </div>
    </>
  );
};

export default SizeFunction;
