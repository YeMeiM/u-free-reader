import css from './css/layout.module.scss';
import {Layout, Menu, MenuProps} from "antd";
import {useMenuList} from "@/views/tools/lib/store.tsx";
import {useState} from "react";

const {Header, Sider, Content} = Layout;

export default function ToolsLayout() {
  const menuList = useMenuList();
  const [menuKey, setMenuKey] = useState(['json_edit'])
  const [title, setTitle] = useState('工具');

  const onChangeMenu: MenuProps['onSelect'] = function ({
    item,
                                                          key, selectedKeys
                                                        }) {
    setMenuKey(selectedKeys);
    console.log('changeMenu', item, key);
    // const menu = menuList.find(it => it && it.key === key);
    // if( menu) setTitle(menu.label);
    // else setTitle('工具');
  }

  return <Layout className={css.pageLayout}>
    <Header>
      <h1>{title}</h1>
    </Header>
    <Layout>
      <Sider collapsible={true}>
        <Menu theme='dark' defaultSelectedKeys={menuKey} items={menuList} onSelect={onChangeMenu}/>
      </Sider>
      <Content>Content</Content>
    </Layout>
  </Layout>
}