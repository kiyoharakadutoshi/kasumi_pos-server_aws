import { localizeString } from 'app/helpers/utils';
import './input-text-mark-custom.scss';
import React, { ComponentProps, LegacyRef } from 'react';
import MaskedInput, { Mask } from 'react-text-mask';

export type InputTextMarkProps = ComponentProps<'input'> & {
  required?: boolean;
  errorValue?: string;
  inputRef?: LegacyRef<HTMLInputElement>;
  mask: Mask | ((value: string) => Mask);
  isError?: boolean;
  labelText?: string;
  widthLabel?: string;
};

const InputTextMarkCustom: React.FC<InputTextMarkProps> = ({
  required,
  errorValue,
  width,
  mask,
  isError,
  labelText,
  ...inputProps
}) => {
  const { title, className, inputRef, value, ref, widthLabel, height, ...rest } = inputProps;
  return (
    <>
      {labelText ? (
        <div
          className={`wrap-input-text-mark ${isError ? 'wrap-input-text-mark-error' : ''} ${inputProps?.disabled ? 'disabled' : ''}`}
          style={{
            height: typeof height === 'string' ? height : `${height}px`
          }}
        >
          <div className="wrap-label" style={{ width: widthLabel }}>
            <p className="label">
              {localizeString(labelText)}
              {required && <span className="label-require">*</span>}
            </p>
          </div>
          <MaskedInput
            guide={true}
            {...rest}
            className={`${className ?? ''} ${isError ? 'input-text-mark-error' : 'input-text-mark-normal'} input-text-mark`.trim()}
            mask={mask}
            value={value}
            keepCharPositions={true}
            style={{
              height: typeof height === 'string' ? height : `${height}px`
            }}
          />
        </div>
      ) : (
        <MaskedInput
          guide={true}
          {...rest}
          className={`${className ?? ''} ${isError ? 'input-text-mark-error' : 'input-text-mark-normal'} input-text-mark`.trim()}
          mask={mask}
          value={value}
          keepCharPositions={true}
          style={{
            height: typeof height === 'string' ? height : `${height}px`
          }}
        />
      )}
    </>
  );
};

export default InputTextMarkCustom;
