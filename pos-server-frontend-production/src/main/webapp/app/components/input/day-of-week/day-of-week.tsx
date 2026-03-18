import NormalCheckBoxButton from "app/components/radio-button/normal-check-box-button/normal-check-box-button";
import React, { useEffect, useReducer } from "react";
import { translate } from "react-jhipster";

enum DayOfWeekEnum {
  Mon = "Mon",
  Tue = "Tue",
  Wed = "Wed",
  Thu = "Thu",
  Fri = "Fri",
  Sat = "Sat",
  Sun = "Sun",
}

export interface IDayOfWeek {
  name: DayOfWeekEnum;
  checked: boolean;
}

export const getDayOfWeekValues = (
  isSun: boolean = false,
  isMon: boolean = false,
  isTue: boolean = false,
  isWed: boolean = false,
  isThu: boolean = false,
  isFri: boolean = false,
  isSat: boolean = false
) => {
  return [
    { name: DayOfWeekEnum.Sun, checked: isSun },
    { name: DayOfWeekEnum.Mon, checked: isMon },
    { name: DayOfWeekEnum.Tue, checked: isTue },
    { name: DayOfWeekEnum.Wed, checked: isWed },
    { name: DayOfWeekEnum.Thu, checked: isThu },
    { name: DayOfWeekEnum.Fri, checked: isFri },
    { name: DayOfWeekEnum.Sat, checked: isSat },
  ];
};

interface DayOfWeekProp {
  initValues?: IDayOfWeek[];
  disable?: boolean
  onChange?: (dayOfWeek: IDayOfWeek[]) => void;
}

const reducer = (state: IDayOfWeek[], name: DayOfWeekEnum) => {
  return state.map((data) => {
    if (data.name === name) {
      return { ...data, checked: !data.checked };
    }
    return data;
  });
};

export const DayOfWeek: React.FC<DayOfWeekProp> = ({
  initValues,
  disable,
  onChange,
}) => {
  const [dayOfWeeks, setDayOfWeeks] = useReducer(
    reducer,
    initValues ?? getDayOfWeekValues()
  );
  const handleSelect = (name: DayOfWeekEnum) => {
    setDayOfWeeks(name);
  };

  useEffect(() => {
    onChange && onChange(dayOfWeeks);
  }, [dayOfWeeks]);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {dayOfWeeks.map((dayOfWeek, index) => (
        <NormalCheckBoxButton
          disabled={disable}
          key={index}
          checked={dayOfWeek.checked}
          id={dayOfWeek.name}
          textValue={translate(`dayOfWeek.${dayOfWeek.name}`)}
          onChange={() => handleSelect(dayOfWeek.name)}
        />
      ))}
    </div>
  );
};

export default DayOfWeek;
