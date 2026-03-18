import { useEffect, useState } from 'react';
import { getMasters } from '@/services/master-service';
import { useAppDispatch } from '@/config/store';

const UseGetTypeList = () => {
  const dispatch = useAppDispatch();
  const [typeList, setTypeList] = useState([]);

  useEffect(() => {
    dispatch(getMasters({ master_code: ['MC8501'] }))
      .unwrap()
      .then((response) => {
        // get data and format to type of dropdown
        if (response.data.data.length > 0) {
          const data = response.data.data[0];

          const formatData = data.items.map((item) => {
            return {
              value: item.setting_data_type,
              code: item.setting_data_type,
              name: item.event_group_name,
            };
          });

          // set data to state
          setTypeList(formatData);
        }
      });
  }, []);

  return {typeList}
};

export default UseGetTypeList;
