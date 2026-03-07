import { convertDateFormat } from './convertToDate';

export const transformData = (data) => {
  const result = [];

  // Initialize levelOne
  const levelOne = {
    code_level_one: data?.[0].code_level_one,
    description_level_one: data?.[0].description_level_one,
    apply_date_level_one: convertDateFormat(data?.[0].apply_date_level_one),
    md_hierarchy_code: data?.[0].code_level_one,
    md_hierarchy_level: data?.[0].level_one,
    apply_date_time: convertDateFormat(data?.[0].apply_date_level_one),
    subRows: [],
  };

  data.forEach((item) => {
    let levelTwo = levelOne.subRows.find((row) => row.code_level_two === item.code_level_two);
    if (!levelTwo && item.code_level_two) {
      levelTwo = {
        code_level_one: levelOne.code_level_one,
        description_level_one: levelOne.description_level_one,
        code_level_two: item.code_level_two,
        description_level_two: item.description_level_two,
        apply_date_level_two: convertDateFormat(item.apply_date_level_two),
        md_hierarchy_code: item.code_level_two,
        md_hierarchy_level: item.level_two,
        apply_date_time: convertDateFormat(item.apply_date_level_two),
        subRows: [],
      };
      levelOne.subRows.push(levelTwo);
    }

    let levelThree = levelTwo?.subRows.find((row) => row.code_level_three === item.code_level_three);
    if (!levelThree && item.code_level_three) {
      levelThree = {
        code_level_one: levelTwo.code_level_one,
        description_level_one: levelTwo.description_level_one,
        code_level_two: levelTwo.code_level_two,
        description_level_two: levelTwo.description_level_two,
        code_level_three: item.code_level_three,
        description_level_three: item.description_level_three,
        apply_date_level_three: convertDateFormat(item.apply_date_level_three),
        md_hierarchy_code: item.code_level_three,
        md_hierarchy_level: item.level_three,
        apply_date_time: convertDateFormat(item.apply_date_level_three),
        subRows: [],
      };
      levelTwo?.subRows.push(levelThree);
    }

    let levelFour = levelThree?.subRows.find((row) => row.code_level_four === item.code_level_four);
    if (!levelFour && item.code_level_four) {
      levelFour = {
        code_level_one: levelThree.code_level_one,
        description_level_one: levelThree.description_level_one,
        code_level_two: levelThree.code_level_two,
        description_level_two: levelThree.description_level_two,
        code_level_three: levelThree.code_level_three,
        description_level_three: levelThree.description_level_three,
        code_level_four: item.code_level_four,
        description_level_four: item.description_level_four,
        apply_date_level_four: convertDateFormat(item.apply_date_level_four),
        md_hierarchy_code: item.code_level_four,
        md_hierarchy_level: item.level_four,
        apply_date_time: convertDateFormat(item.apply_date_level_four),
        subRows: [],
      };
      levelThree?.subRows.push(levelFour);
    }
  });

  result.push(levelOne);  
  return result;
};
