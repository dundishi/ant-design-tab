/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import { Icon, Result, Button, Tabs } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { isAntDesignPro, getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
const noMatch = (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
/**
 * use Authorized check all menu item
 */

const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright="2019 蚂蚁金服体验技术部出品"
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <Icon type="github" />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);

const footerRender = () => {
  if (!isAntDesignPro()) {
    return defaultFooterDom;
  }

  return (
    <>
      {defaultFooterDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state=({

    })
  }
  /**
   * constructor
   */

  // useEffect(() => {
  //   if (dispatch) {
  //     dispatch({
  //       type: 'user/fetchCurrent',
  //     });
  //     dispatch({
  //       type: 'settings/getSetting',
  //     });
  //   }
  // }, []);
  /**
   * init variables
   */
  componentDidMount() {
    this.props.history.push({ pathname : '/'  })
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'setting/getSetting',
    });
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
  }
  render() {
    const {
      dispatch,
      children,
      settings,
      location = {
        pathname: '/',
      },
    } = this.props;
    let props = this.props;
    // let authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    //   authority: undefined,
    // };
    // console.log(this.props)
    const handleMenuCollapse = payload => {
      if (dispatch) {
        dispatch({
          type: 'global/changeLayoutCollapsed',
          payload,
        });
      }
    }; // get children authority
    return (
      <>
        <ProLayout
          logo={logo}
          onCollapse={handleMenuCollapse}
          menuItemRender={(menuItemProps, defaultDom) => {
            if (menuItemProps.isUrl) {
              return defaultDom;
            }

            return <Link to={menuItemProps.path}>{defaultDom}</Link>;
          }}
          breadcrumbRender={(routers = []) => [
            {
              path: '/',
              breadcrumbName: formatMessage({
                id: 'menu.home',
                defaultMessage: 'Home',
              }),
            },
            ...routers,
          ]}
          itemRender={(route, params, routes, paths) => {
            const first = routes.indexOf(route) === 0;
            return first ? (
              <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
            ) : (
                <span>{route.breadcrumbName}</span>
              );
          }}
          footerRender={footerRender}
          menuDataRender={menuDataRender}
          formatMessage={formatMessage}
          rightContentRender={rightProps => <RightContent {...rightProps} />}
          {...props}
          {...settings}
        >
          <Authorized noMatch={noMatch}>
            {children}
          </Authorized>
        </ProLayout>
        <SettingDrawer
          settings={settings}
          onSettingChange={config =>
            dispatch({
              type: 'settings/changeSetting',
              payload: config,
            })
          }
        />
      </>
    )
  }
};

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
