import {useListState} from "@/hooks/common.tsx";
import type {MenuProps} from "antd";
import {
  EditOutlined
} from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];

export function useMenuList(){
  const [list] = useListState<MenuItem>([
    {
      label: 'JSON填写',
      key: 'json_edit',
      icon: (<EditOutlined />)
    }
  ]);

  return list;
}