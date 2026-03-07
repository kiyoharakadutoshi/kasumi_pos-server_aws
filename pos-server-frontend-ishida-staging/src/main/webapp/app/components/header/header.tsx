import './header.scss';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { CustomExportCSV, ExportCSV, ExportCsvProps } from 'app/components/export-csv/export-csv';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { IPrinterProps, Printer } from 'app/components/printer/printer';
import { clearSession, CompanyInfo, UserDetail } from 'app/reducers/user-login-reducer';
import { Translate, translate } from 'react-jhipster';
import { NormalIconButton } from 'app/components/button/flat-button/flat-button';
import { useNavigate } from 'react-router';
import HeaderMenu from 'app/components/header/header-menu/header-menu';
import { SVGStoreIcon, SVGUserIcon } from 'app/components/header/svg-header-icon';
import PrinterCustom from '../printer/printerCustom';
import { closeConfirm, ConfirmState, navigateTo } from 'app/reducers/confirm-reducer';
import ButtonHeader from '../button/button-primary/button-header';
import { IStoreSate } from 'app/reducers/store-reducer';
import { Controller, useFormContext } from 'react-hook-form';
import { LIST_COMPANY } from 'app/constants/company-constants';

export interface IHeaderProps {
  title: string;
  csv?: ExportCsvProps;
  printer?: IPrinterProps;
  viewMode?: 'New' | 'Edit';
  isHiddenCSV?: boolean;
  isHiddenPrinter?: boolean;
  exportCSVByApi?: boolean;
  handleExportSCVByApi?: any;
  className?: string;
  printData?: any;
  isPrintByReactPdf?: boolean;
  isDisable?: boolean;
  confirmBack?: boolean;
  hasESC?: boolean;
  hiddenTextESC?: boolean;
  hasLogout?: boolean;
  selectedStore?: string;
  mode?: ActionModeType;
  actionReturnToPreviousPage?: () => void;
}

const Header = (props: IHeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userDetail: UserDetail = useAppSelector((state) => state.loginReducer.userLogin?.user_detail);
  const company: CompanyInfo = useAppSelector((state) => state.loginReducer.selectedCompany);
  const confirmState: ConfirmState = useAppSelector((state) => state.confirmReducer);
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const selectedStoresBeforConfirm = storeReducer.selectedStores;
  const selected_stores_reducer = storeReducer?.stores?.filter((store) => store.selected);
  const [storesCurrently, setStoresCurrently] = useState(selected_stores_reducer);

  useEffect(() => {
    setStoresCurrently(
      selected_stores_reducer.filter((store) => selectedStoresBeforConfirm.includes(store.store_code))
    );
  }, [selectedStoresBeforConfirm]);

  useEffect(() => {
    const handleTabCloseOrReload = (event: BeforeUnloadEvent) => {
      if (props?.confirmBack && isNullOrEmpty(confirmState.message)) {
        event.preventDefault();
        event.returnValue = '';
        dispatch(closeConfirm());
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !props.hasESC) {
        return;
      }
      navigateAction(-1);
    };
    window.addEventListener('beforeunload', handleTabCloseOrReload);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('beforeunload', handleTabCloseOrReload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [props?.confirmBack, confirmState.action]);

  const navigateAction = (action: any) => {
    // Handle action custom when click return or click confirm back
    if (props?.actionReturnToPreviousPage) {
      props?.actionReturnToPreviousPage();
    }

    if (!props.confirmBack) {
      navigate(action);
      return;
    }
    dispatch(navigateTo(action));
  };

  const TruncateText = (store_code, store_name) => {
    const maxLength = 25;
    const displayText = store_name || '';

    const truncateString = (str) => {
      if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
      }
      return str;
    };

    return (
      <div className="truncate-container">
        <span className="truncate-text">
          {store_code} {truncateString(displayText) && `: ${truncateString(displayText)}`}
        </span>
        {displayText.length > maxLength && (
          <span className="tooltip-text">
            {' '}
            {store_code} : {displayText}
          </span>
        )}
      </div>
    );
  };

  const displayStoreName = () => {
    if (storeReducer?.stores.length > 1) {
      if (storesCurrently?.length > 1) return '複数店選択中';
      if (storesCurrently?.length === 1)
        return TruncateText(storesCurrently[0]?.store_code, storesCurrently[0]?.short_name);
      const selectedStoreCustom = props?.selectedStore?.split(':');
      return TruncateText(selectedStoreCustom?.[0], selectedStoreCustom?.[1]);
    } else {
      return TruncateText(storeReducer.stores[0]?.store_code, storeReducer.stores[0]?.short_name);
    }
  };

  return (
    <div
      className="header-container"
      style={{
        backgroundColor: company?.mainColor ?? LIST_COMPANY[0].mainColor,
      }}
    >
      <div className="header-container__toggle-title">
        <HeaderMenu userDetail={userDetail} headerProps={props} />
        <span className="header-container__brand-title">{localizeString(props.title)}</span>
      </div>
      <div className="header-container__user-detail">
        <div className="header-container__box-icon">
          <SVGUserIcon />
        </div>
        <span>{userDetail?.user_name}</span>
      </div>
      <div className="header-container__user-detail">
        <div className="header-container__box-icon">
          <SVGStoreIcon />
        </div>
        {displayStoreName()}
      </div>
      <div className="header-container__data-ouput">
        {!props.isHiddenCSV && (
          <div className="header-container__icon header-container__icon-csv">
            {!props.exportCSVByApi ? (
              <ExportCSV
                listTitleTable={props.csv?.listTitleTable}
                csvData={props.csv?.csvData}
                fileName={props.csv?.fileName}
                color={props.csv?.color}
                height={props.csv?.height}
                width={props.csv?.width}
                disabled={props.csv?.disabled}
              />
            ) : (
              <CustomExportCSV
                disabled={props.csv?.disabled}
                handleExportSCVByApi={() => {
                  if (props.csv?.disabled) return;
                  props?.handleExportSCVByApi();
                }}
              />
            )}
          </div>
        )}
        {!props.isHiddenPrinter && !props.isPrintByReactPdf ? (
          <div className="header-container__icon header-container__icon-print">
            <Printer disabled={props.printer?.disabled} action={props.printer?.action} />
          </div>
        ) : (
          !props.isHiddenPrinter && (
            <div className="header-container__icon header-container__icon-print">
              <PrinterCustom printData={props.printData} disabled={props.printer?.disabled} />
            </div>
          )
        )}
        {props.mode && <ActionMode mode={props.mode} />}
        <div className="header-container__box-button">
          {props.hasESC && (
            <div className="box-button-header">
              <ButtonHeader
                text={translate('action.previous')}
                iconMagrin={true}
                widthBtn={'120px'}
                disabled={props.isDisable}
                onClick={() => navigateAction(-1)}
              />
            </div>
          )}
          <div className="bottom-button__navigate-back">
            {props.hasLogout && (
              <NormalIconButton
                className="button_logout"
                height="50px"
                onClick={() => dispatch(clearSession())}
                type="light"
                icon={
                  <svg width="22.5" height="22.5" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      className={'icon-path'}
                      d="M3.08333 21.75C2.44167 21.75 1.89236 21.5215 1.43542 21.0646C0.978472 20.6076 0.75 20.0583 0.75 19.4167V3.08333C0.75 2.44167 0.978472 1.89236 1.43542 1.43542C1.89236 0.978472 2.44167 0.75 3.08333 0.75H11.25V3.08333H3.08333V19.4167H11.25V21.75H3.08333ZM15.9167 17.0833L14.3125 15.3917L17.2875 12.4167H7.75V10.0833H17.2875L14.3125 7.10833L15.9167 5.41667L21.75 11.25L15.9167 17.0833Z"
                      fill="#545F95"
                    />
                  </svg>
                }
                text="action.logout"
              />
            )}
          </div>
          <div className="box-button-header">
            <ButtonHeader
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="26" viewBox="0 0 24 26">
                  <path
                    className="custom-path"
                    id="Path_83354"
                    data-name="Path 83354"
                    d="M.663,26.143V8.81l12-8.667,12,8.667V26.143h-9V16.032h-6V26.143Z"
                    transform="translate(-0.663 -0.143)"
                  />
                </svg>
              }
              disabled={props.isDisable}
              onClick={() => navigateAction('/')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

interface IHeaderControlProps extends IHeaderProps {
  dirtyCheckName: string;
}

export const HeaderControl = (props: IHeaderControlProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => <Header {...props} confirmBack={field.value} />}
      control={control}
      name={props.dirtyCheckName}
    />
  );
};

export type ActionModeType = 'add' | 'edit';

const ActionMode = ({ mode }: { mode: ActionModeType }) => {
  switch (mode) {
    case 'edit':
      return (
        <span className="header-container__action-mode header-container__mode-edit">
          <Translate contentKey="header.modeEdit" />
        </span>
      );
    case 'add':
      return (
        <span className="header-container__action-mode header-container__mode-add">
          <Translate contentKey="header.modeAdd" />
        </span>
      );
    default:
      return <></>;
  }
};
