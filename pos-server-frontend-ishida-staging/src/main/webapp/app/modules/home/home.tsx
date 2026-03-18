import React, { useEffect, useState } from 'react';
import { InputText } from 'app/components/input/input';
import { NormalRadioButton } from 'app/components/radio-button/radio-button';
import { Translate } from 'react-jhipster';
import { useDispatch } from 'react-redux';
import { postProduct } from 'app/modules/home/application-04';
import { AppDispatch } from 'app/config/store';
import './home.scss';
import { NegativeButton, NormalButton } from 'app/components/button/flat-button/flat-button';
import Header from 'app/components/header/header';

export const Home = () => {
  const dispatch: AppDispatch = useDispatch();
  const [itemCode, setPluCode] = useState('');
  const [productName, setProductName] = useState('');
  const [status, setStatus] = useState('');
  const [belongTo, setBelongTo] = useState(1);

  const dataRadio = [
    { id: '1', checkBoxValue: 1, textValue: <Translate contentKey="home.radio.value_1" /> },
    { id: '2', checkBoxValue: 2, textValue: <Translate contentKey="home.radio.value_2" /> },
  ];

  const selectedStore = '1234567891';

  const handleConfirm = () => {
    const data: Readonly<{
      selectedStore: string;
      itemCode: string;
      belongTo: number;
    }> = {
      selectedStore: selectedStore,
      itemCode: itemCode,
      belongTo: belongTo,
    };

    dispatch(postProduct(data));
  };

  const handleClear = () => {
    setPluCode('');
    setProductName('');
    setStatus('');
    setBelongTo(dataRadio[0].checkBoxValue);
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'F4') {
        handleClear();
      }
      if (event.key === 'F9') {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClear, handleConfirm]);

  return (
    <div>
      <Header title="home.title" />
      <div className="input-group">
        <InputText
          label="home.PLUCode"
          widthLabel="300px"
          width="720px"
          required={true}
          value={itemCode}
          onChange={(e: any) => setPluCode(e.target.value)}
        />
        <InputText
          label="home.productName"
          widthLabel="300px"
          width="720px"
          value={productName}
          onChange={(e: any) => setProductName(e.target.value)}
        />
        <InputText
          label="home.condition"
          widthLabel="300px"
          width="720px"
          value={status}
          onChange={(e: any) => setStatus(e.target.value)}
        />
        <NormalRadioButton
          text={<Translate contentKey="home.store" />}
          widthText="300px"
          widthInput="720px"
          listCheckBox={dataRadio}
          nameGroupRadio="checkbox-1"
          value={belongTo}
          onChange={setBelongTo}
        />
      </div>
      <div className="group-button">
        <NegativeButton text="home.button.clear" onClick={handleClear} />
        <NormalButton text="home.button.confirm" onClick={handleConfirm} />
      </div>
    </div>
  );
};

export default Home;
