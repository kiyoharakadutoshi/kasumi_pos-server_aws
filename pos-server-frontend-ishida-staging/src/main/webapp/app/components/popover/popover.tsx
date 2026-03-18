import './popover.scss';
import React, { ComponentProps, useLayoutEffect, useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Controller, useFormContext } from 'react-hook-form';
import _ from 'lodash';
import { formatNumber, isNullOrEmpty, localizeString } from 'app/helpers/utils';

export type PopoverProps = ComponentProps<'div'> & {
  text: string | React.ReactNode;
  lineHeight?: number;
  children?: React.ReactNode;
  height?: string;
  lineLimit?: number;
  valueChangePopover?: any;
  classNameText?: string;
  alignItems?: 'start' | 'center' | 'end';
  textAlign?: 'start' | 'center' | 'end';
};

const PopoverText: React.FC<PopoverProps> = ({
  text,
  lineHeight = 30,
  children,
  height = '100%',
  lineLimit,
  valueChangePopover,
  alignItems = 'center',
  textAlign,
  classNameText,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  const extraProps = lineLimit && !children ? { ...props } : {};

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!popoverRef.current) {
        setShowPopover(false);
        return;
      }

      const clientHeight = ref.current?.clientHeight ?? popoverRef.current?.clientHeight;
      setShowPopover(popoverRef.current?.scrollHeight > clientHeight + 2);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [text, valueChangePopover]);

  const style = {
    textAlign,
    WebkitLineClamp: lineLimit ?? Math.floor(ref.current?.clientHeight / lineHeight),
    lineHeight: `${lineHeight}px`,
    ...props.style,
  };

  const className = `popover-text__content ${classNameText}`;

  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>{text}</Popover.Body>
    </Popover>
  );

  const contentText = showPopover ? (
    <OverlayTrigger overlay={popover} trigger={['hover', 'focus']} placement={'auto'}>
      <div ref={popoverRef} className={className} style={style}>
        {text}
      </div>
    </OverlayTrigger>
  ) : (
    <div ref={popoverRef} className={className} style={style} {...extraProps}>
      {text}
    </div>
  );

  if (lineLimit) {
    if (children) {
      return (
        <div {...props}>
          {contentText}
          {children}
        </div>
      );
    }

    return contentText;
  }

  return (
    <div {...props}>
      <div className="popover-text" style={{ height, alignItems, textAlign }} ref={ref}>
        {contentText}
      </div>
      {children}
    </div>
  );
};

export default PopoverText;

export const PopoverLabelText = ({
  label,
  text,
  className,
  formatedNumber,
  numberFractionDigits,
  textAlign,
}: {
  label?: string;
  text: string | number;
  className?: string;
  formatedNumber?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  numberFractionDigits?: number;
}) => {
  return (
    <span className={`popover-text-label ${className ?? ''}`.trim()}>
      {label && <span className="popover-text-label__label">{localizeString(label)}</span>}
      <PopoverText
        text={formatedNumber && text ? formatNumber(text, numberFractionDigits) : text}
        lineLimit={1}
        style={{ textAlign }}
        lineHeight={null}
        classNameText={`popover-text-label__text ${label ? '' : 'popover-text-label__text-non-label'}`}
      />
    </span>
  );
};

export const PopoverTextControl = (props: {
  hasBackground?: boolean;
  label?: string;
  name: string;
  className?: string;
  formatedNumber?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  numberFractionDigits?: number;
}) => {
  const {
    formState: { errors },
    getValues,
  } = useFormContext();

  const errorForm = _.get(errors, props.name)?.message as string;

  const hasBackground = props.hasBackground ?? true;
  return (
    <Controller
      render={({ field }) => {
        return (
          <PopoverLabelText
            text={errorForm ?? (isNullOrEmpty(field.value) ? getValues(props.name) : field.value)}
            {...props}
            className={`${props.className ?? ''} ${errorForm ? 'popover-text-label__error' : ''}  ${hasBackground ? '' : 'popover-text-label__text-non-background'}`}
          />
        );
      }}
      name={props.name}
    />
  );
};
