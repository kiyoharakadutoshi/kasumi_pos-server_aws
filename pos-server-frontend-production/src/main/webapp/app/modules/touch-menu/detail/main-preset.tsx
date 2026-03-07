import React from 'react';
import MainContent from 'app/modules/touch-menu/detail/main-content';
import './preset.scss';
import { useAppSelector } from 'app/config/store';
import { PresetState } from './reducer/preset-reducer';
import SidePanelButton from './side-panel/preset-button/side-panel-button';
import SidePanel from 'app/modules/touch-menu/detail/side-panel/side-panel';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';

import './preset.scss';

const MainPreset = () => {
  const selectedItem: PresetState = useAppSelector(state => state.presetReducer);

  // Get html element to handle focus tab, enter when data changes causing UI to change accordingly
  elementChangeKeyListener(selectedItem);

  return (
    <>
      <div className={'main-body'}>
        <div style={{ width: '400px' }}>{selectedItem?.presetButton ? <SidePanelButton /> : <SidePanel />}</div>
        <div className={'main-content'}>
          <MainContent />
        </div>
      </div>
    </>
  );
};

export default MainPreset;
