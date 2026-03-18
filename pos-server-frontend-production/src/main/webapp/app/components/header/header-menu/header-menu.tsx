import './header-menu.scss';
import { UserDetail } from 'app/reducers/user-login-reducer';
import { useNavigate } from 'react-router';
import React, { useState } from 'react';
import { CustomExportCSV, ExportCSV } from 'app/components/export-csv/export-csv';
import { Printer } from 'app/components/printer/printer';
import { NormalIconButton } from 'app/components/button/flat-button/flat-button';
import { IHeaderProps } from 'app/components/header/header';
import {
  SVGBackIcon,
  SVGHomeIcon,
  SVGStoreIcon,
  SVGToggleIcon,
  SVGUserIcon
} from 'app/components/header/svg-header-icon';

const HeaderMenu = ({ userDetail, headerProps }: { userDetail: UserDetail; headerProps: IHeaderProps }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="menu-header">
      <SVGToggleIcon className="menu-header__toggle-icon" onClick={() => setShowMenu(!showMenu)} />
      {showMenu && (
        <div className="menu-header__menu-header">
          <div className="menu-header__menu-user-store">
            <SVGUserIcon />
            <span>{userDetail?.user_name}</span>
          </div>
          <div className="menu-header__menu-user-store">
            <SVGStoreIcon />
            <span>
              {userDetail?.store_code} : {userDetail?.store_name}
            </span>
          </div>
          <div className="menu-header__menu-button-output">
            {!headerProps.isHiddenCSV && (
              <>
                {!headerProps.exportCSVByApi ? (
                  <ExportCSV
                    listTitleTable={headerProps.csv?.listTitleTable}
                    csvData={headerProps.csv?.csvData}
                    fileName={headerProps.csv?.fileName}
                    color={headerProps.csv?.color}
                    height={headerProps.csv?.height}
                    width={headerProps.csv?.width}
                    disabled={headerProps.csv?.disabled}
                  />
                ) : (
                  <CustomExportCSV disabled={headerProps.csv?.disabled} handleExportSCVByApi={headerProps?.handleExportSCVByApi} />
                )}
              </>
            )}
            {!headerProps.isHiddenPrinter && <Printer disabled={headerProps.printer?.disabled} action={headerProps.printer?.action} />}
            <NormalIconButton onClick={() => navigate(-1)} type="light" icon={<SVGBackIcon />} />
            <NormalIconButton onClick={() => navigate('/')} type="light" icon={<SVGHomeIcon />} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMenu;
