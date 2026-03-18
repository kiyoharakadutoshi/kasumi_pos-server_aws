import './styles.scss';
import { NormalIconButton } from 'app/components/button/flat-button/flat-button';
import React, { useEffect } from 'react';
import { useAppSelector } from 'app/config/store';
import { IStoreInfo } from 'app/reducers/store-reducer';
import { useFormContext } from 'react-hook-form';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';

interface RegisterStoreState {
  registerStores: IStoreInfo[];
}

const RegisterStoreControl = () => {
  const storesDefault: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);

  const formConfig = useFormContext<RegisterStoreState>();

  const { setValue, watch } = formConfig;

  const stores = watch('registerStores');

  useEffect(() => {
    setValue(
      'registerStores',
      storesDefault.map((item) => ({
        ...item,
        selected: false,
      }))
    );
  }, [storesDefault?.length]);

  const handleSelectAll = (selectedAll?: boolean) => {
    setValue(
      'registerStores',
      stores.map((item) => ({
        ...item,
        selected: selectedAll,
      }))
    );
  };

  const selectStore = (selected: boolean, index: number) => {
    stores[index].selected = selected;
    setValue(`registerStores`, stores);
  }

  return (
    <div className="register-store">
      <div className="register-store__wrapinput-search">
        <>
          <div className="register-store__button-select-all">
            <NormalIconButton
              onClick={() => handleSelectAll(false)}
              text="apply-store.unselectAll"
              className="register-store__unselect-all"
              width="100%"
              disabled={stores?.every((item) => !item.selected)}
            />
            <NormalIconButton
              onClick={() => handleSelectAll(true)}
              text="apply-store.selectAll"
              className="register-store__select-all"
              width="100%"
              disabled={stores?.every((item) => item.selected)}
            />
          </div>
        </>
      </div>

      <div className="register-store__store-content">
        <ul className={`list-unstyled register-store__list-store register-store__list-store-checkbox`}>
          {stores?.map((store, index) => {
            return (
              <li key={index} className="register-store__list-store-item">
                <CheckboxButton
                  id={"register" + index + store.store_code}
                  onChange={() => selectStore(!store.selected, index)}
                  checkBoxValue={store.store_code}
                  checked={store.selected}
                  textValue={`${store.store_code}：${store.short_name}`}
                  hasPopperText={true}
                  linePopoverTextNumber={1}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RegisterStoreControl;
