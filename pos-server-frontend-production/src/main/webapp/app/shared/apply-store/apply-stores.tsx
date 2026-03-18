import React, { useEffect, useReducer } from 'react';
import { Translate } from 'react-jhipster';
import './apply-store.scss';
import { InputTitle } from 'app/components/input/styled';
import { NormalButton } from 'app/components/button/flat-button/flat-button';
import NormalCheckBoxButton from 'app/components/radio-button/normal-check-box-button/normal-check-box-button';
import { IStoreInfo } from 'app/reducers/store-reducer';

interface ApplyStoresProp {
  stores: IStoreInfo[];
  onChange?: (stores: IStoreInfo[]) => void;
}

enum ActionSelect {
  select,
  selectAll,
  unselectAll,
}

interface ActionStore {
  action: ActionSelect;
  storeCode?: string;
}

const reducer = (state: IStoreInfo[], action: ActionStore) => {
  switch (action.action) {
    case ActionSelect.select:
      return state.map(data => {
        if (data.store_code === action.storeCode) {
          return { ...data, selected: !data.selected };
        }
        return data;
      });
    default:
      return state.map(data => {
        return { ...data, selected: action.action === ActionSelect.selectAll };
      });
  }
};

export const ApplyStores: React.FC<ApplyStoresProp> = ({ stores, onChange }) => {
  const [applyStores, setStores] = useReducer(reducer, stores);
  const handleSelect = (actionSelect: ActionSelect, store?: string) => {
    setStores({ action: actionSelect, storeCode: store });
  };

  useEffect(() => {
    onChange(applyStores);
  }, [applyStores]);

  return (
    stores.length > 0 && (
      <div style={{ marginLeft: '40px' }} className="apply-store">
        <div className="header-apply-store">
          <InputTitle
            style={{
              width: '250px',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            {<Translate contentKey="apply-store.title">Registered stores</Translate>}
          </InputTitle>
          <NormalButton text="apply-store.unselectAll" onClick={e => handleSelect(ActionSelect.unselectAll)} />
          <NormalButton text="apply-store.selectAll" onClick={() => handleSelect(ActionSelect.selectAll)} />
        </div>
        <ul className="list-unstyled list-store">
          {applyStores.map(store => (
            <li key={store.store_code} className="list-store-item">
              <NormalCheckBoxButton
                checked={store.selected}
                id={store.store_code}
                textValue={store.store_code + ' : ' + store.store_name}
                onChange={() => handleSelect(ActionSelect.select, store.store_code)}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default ApplyStores;
