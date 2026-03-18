import { IHierarchyLevelInfo } from 'app/services/hierarchy-level-service';

export const transformData = (data: IHierarchyLevelInfo[]) => {
  const result = [];

  // Initialize levelOne
  const levelOne = {
    code_level_one: data?.[0].code_level_one,
    description: data?.[0].description,
    apply_date: data?.[0]?.apply_date,
    subRows: [],
  };

  data.forEach((item) => {
    let levelTwo = levelOne.subRows.find((row) => row.code_level_two === item.code_level_two);
    if (!levelTwo && item.code_level_two) {
      levelTwo = {
        code_level_two: item.code_level_two,
        description: item.description,
        apply_date: item.apply_date,
        subRows: [],
      };
      levelOne.subRows.push(levelTwo);
    }

    let levelThree = levelTwo?.subRows.find((row) => row.code_level_three === item.code_level_three);
    if (!levelThree && item.code_level_three) {
      levelThree = {
        code_level_three: item.code_level_three,
        description: item.description,
        apply_date: item.apply_date,
        subRows: [],
      };
      levelTwo?.subRows.push(levelThree);
    }

    let levelFour = levelThree?.subRows.find((row) => row.code_level_four === item.code_level_four);
    if (!levelFour && item.code_level_four) {
      levelFour = {
        code_level_four: item.code_level_four,
        description: item.description,
        apply_date: item.apply_date,
        subRows: [],
      };
      levelThree?.subRows.push(levelFour);
    }
  });

  result.push(levelOne);
  return result;
};
