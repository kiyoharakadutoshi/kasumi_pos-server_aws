import React from 'react';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import SidebarStoreDefault from 'app/components/sidebar-store-default/sidebar-store-default';
import './page-common.scss';
import './page-common.scss';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';
import ListRadioButton, { RadioButton } from 'app/components/radio-button-component/radio-button';
import { IStoreInfo, selectSingleStore, updateSelectedStore } from 'app/reducers/store-reducer';
import store, { useAppDispatch, useAppSelector } from 'app/config/store';
import { LIST_COMPANY } from 'app/constants/constants';
import Dropdown from 'app/components/dropdown/dropdown';
import InputAddZero from 'app/components/input-text-custom/input-add-zero';

const PageCommon = () => {
  const stores: IStoreInfo[] = useAppSelector(state => state.storeReducer.stores);
  const dispatch = useAppDispatch();

  const selectCheckbox = (store_code: string) => {
    dispatch(updateSelectedStore(store_code));
  };
  const selectRadio = (storeCode: string) => {
    dispatch(selectSingleStore(storeCode));
  };

  return (
    <div className="page-common">
      <div className="page-common__container">
        <SidebarStoreDefault onClickSearch={() => {
        }} inputSearchHeight="50px" selectMultiple={false} dataSearchChange={[]}>
          <></>
        </SidebarStoreDefault>
        <div className="right-panel">
          <div className="wrap-btn">
            <div className="button-normal">
              <ButtonPrimary text="action.addCashRegister" />
            </div>
            <div className="button-normal">
              <ButtonPrimary text="action.importCSV" disabled={true} />
            </div>
            <div className="button-normal">
              <ButtonPrimary
                icon={
                  <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.22741 15.7161L0.260742 8.59113L2.00241 6.80988L7.22741 12.1536L18.4413 0.684875L20.183 2.46613L7.22741 15.7161Z"
                      fill="white"
                    />
                  </svg>
                }
              />
            </div>
            <div className="button-normal">
              <ButtonPrimary
                icon={
                  <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.22741 15.7161L0.260742 8.59113L2.00241 6.80988L7.22741 12.1536L18.4413 0.684875L20.183 2.46613L7.22741 15.7161Z"
                      fill="white"
                    />
                  </svg>
                }
                text="action.f11Confirm"
              />
            </div>
            <div className="button-normal">
              <ButtonPrimary
                icon={
                  <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_414_1574" maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="31">
                      <rect y="0.460449" width="30" height="30" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_414_1574)">
                      <path
                        d="M24.5 26.7104L16.625 18.8354C16 19.3354 15.2812 19.7313 14.4688 20.023C13.6562 20.3146 12.7917 20.4604 11.875 20.4604C9.60417 20.4604 7.68229 19.674 6.10938 18.1011C4.53646 16.5282 3.75 14.6063 3.75 12.3354C3.75 10.0646 4.53646 8.14274 6.10938 6.56982C7.68229 4.99691 9.60417 4.21045 11.875 4.21045C14.1458 4.21045 16.0677 4.99691 17.6406 6.56982C19.2135 8.14274 20 10.0646 20 12.3354C20 13.2521 19.8542 14.1167 19.5625 14.9292C19.2708 15.7417 18.875 16.4604 18.375 17.0854L26.25 24.9604L24.5 26.7104ZM11.875 17.9604C13.4375 17.9604 14.7656 17.4136 15.8594 16.3198C16.9531 15.2261 17.5 13.8979 17.5 12.3354C17.5 10.7729 16.9531 9.44482 15.8594 8.35107C14.7656 7.25732 13.4375 6.71045 11.875 6.71045C10.3125 6.71045 8.98438 7.25732 7.89062 8.35107C6.79688 9.44482 6.25 10.7729 6.25 12.3354C6.25 13.8979 6.79688 15.2261 7.89062 16.3198C8.98438 17.4136 10.3125 17.9604 11.875 17.9604Z"
                        fill="white"
                      />
                    </g>
                  </svg>
                }
                widthBtn="180px"
                text={'action.f12Search'}
              />
            </div>
          </div>
          <div className="wrap-input">
            <InputTextCustom
              icon={
                <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.7233 22.5L14.0994 14.625C13.415 15.125 12.6279 15.5208 11.7381 15.8125C10.8483 16.1042 9.90154 16.25 8.89769 16.25C6.4109 16.25 4.30626 15.4635 2.58375 13.8906C0.861251 12.3177 0 10.3958 0 8.125C0 5.85417 0.861251 3.93229 2.58375 2.35938C4.30626 0.786458 6.4109 0 8.89769 0C11.3845 0 13.4891 0.786458 15.2116 2.35938C16.9341 3.93229 17.7954 5.85417 17.7954 8.125C17.7954 9.04167 17.6357 9.90625 17.3163 10.7188C16.9969 11.5312 16.5634 12.25 16.0158 12.875L24.6398 20.75L22.7233 22.5ZM8.89769 13.75C10.6088 13.75 12.0632 13.2031 13.261 12.1094C14.4588 11.0156 15.0576 9.6875 15.0576 8.125C15.0576 6.5625 14.4588 5.23438 13.261 4.14062C12.0632 3.04688 10.6088 2.5 8.89769 2.5C7.1866 2.5 5.73217 3.04688 4.5344 4.14062C3.33664 5.23438 2.73775 6.5625 2.73775 8.125C2.73775 9.6875 3.33664 11.0156 4.5344 12.1094C5.73217 13.2031 7.1866 13.75 8.89769 13.75Z"
                    fill="#545F95"
                  />
                </svg>
              }
              placeholder="店番 または 店名で検索"
            />
            <div className="wrap-top-label-with-input">
              <span>商品コード</span>
              <InputTextCustom placeholder="inputs.placeholder1" />
            </div>
            <div className="wrap-top-label-with-input">
              <span>商品コード</span>
              <InputTextCustom placeholder="inputs.placeholder2" isError={true} />
            </div>
            <InputTextCustom placeholder="inputs.placeholder2" disabled={true} />
            <InputTextCustom labelText="inputs.label" defaultValue={'test01'} />
            <InputTextCustom labelText="inputs.label" widthInput="260px" isError={true} />
            <InputTextCustom labelText="inputs.label" disabled={true} />
            <InputTextCustom labelText="inputs.label" type="number" maxLength={5} />
            <InputTextCustom isError={true} errorText="▲ レイアウトコードは半角数字で入力してください" />
            <Dropdown
              label="loginScreen.companyCode"
              items={LIST_COMPANY}
              onChange={item => console.log(item)}
            />
          </div>
        </div>
        <ul className={`list-unstyled sidebar-store__list-store}`}>
          {stores?.map((store, index) => {
            return (
              <li key={index} className="sidebar-store__list-store-item">
                <CheckboxButton
                  id={index + store.store_code}
                  onChange={() => selectCheckbox(store.store_code)}
                  checkBoxValue={store.store_code}
                  checked={store.selected}
                  textValue={`${store.store_code} : ${store.store_name}`}
                />
              </li>
            );
          })}
        </ul>
        <ListRadioButton
          name="radio-page-common"
          isVertical={true}
          listValues={stores.map((item) => ({
            id: item.store_code,
            textValue: `${item.store_code} : ${item.store_name}`,
          }))}
          onChange={(value, index) => {}}
        />
      </div>
    </div>
  );
};

export default PageCommon;
