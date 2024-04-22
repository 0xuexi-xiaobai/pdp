import { GithubFilled, LogoutOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProConfigProvider,
  ProLayout,
} from '@ant-design/pro-components';
import {
  Button,
  ConfigProvider,
  Dropdown,
  Menu,
  message,
  Modal, InputNumber, Form,
} from 'antd';
import React, { useState } from 'react';
import { AppstoreOutlined, ContainerOutlined, MonitorOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../static/logo.png';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const routeKeyMapping = {
    '/page1': 'mail',
    '/page2': 'test2',
    '/find_doctors': 'test3',
  };
  let items = []
  if (!location.pathname.includes('page3') && !location.pathname.includes('page4')) {
    items = [
      {
        label: 'Consultation',
        key: 'mail',
        icon: <ContainerOutlined />,
        onClick: () => {
          window.location.href = '/page1';
        },
      },
      {
        label: 'Common articles',
        key: 'test2',
        icon: <MonitorOutlined />,
        onClick: () => {
          window.location.href = '/page2';
        },
      },
      {
        label: 'Find Doctors',
        key: 'test3',
        icon: <AppstoreOutlined />,
        onClick: () => {
          window.location.href = '/find_doctors';
        },
      },
    ];
  } else {
    items = [
      {
        label: 'Consultation',
        key: 'mail',
        icon: <ContainerOutlined />,
        onClick: () => {
          window.location.href = '/page3';
        },
      },
      {
        label: 'Common articles',
        key: 'test4',
        icon: <MonitorOutlined />,
        onClick: () => {
          window.location.href = '/page4';
        },
      },
    ];
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();


  const { user } = useUser();
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleCreditButtonClick = () => {
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const addCredit = values.add_credit;

      if (user && user.role === 'patient') {
        const response = await axios.put(`http://localhost:8000/api/users/${user.id}/update_credit/`, {
          credit: user.credit + addCredit
        }, {
          withCredentials: true
        });


        if (response.status === 200) {
          updateUser(response.data.user);
          message.success('Credit added successfully');
          setModalVisible(false);
          form.resetFields();
        } else {
          message.error('Failed to add credit');
        }
      } else {
        message.error('Only patients can add credit');
      }
    } catch (error) {
      message.error('Failed to add credit');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };
  const handleClick = () => {
    console.log('Github icon was clicked!');
    window.open('https://github.com/cmu-webapps/s24_team_29/tree/new_branch_login');
  };
  const handleLogout = async () => {
    try {
    } catch (error) {
    }
    console.log('logout here');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    updateUser(null);
    navigate('/');
    console.log(user);
  };

  if (typeof document === 'undefined') {
    return <div />;
  }
  return (
    <div
      id="test-pro-layout"
      style={{
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById('test-pro-layout') || document.body;
          }}
        >
          <ProLayout
            fixSiderbar={true}
            layout="top"
            splitMenus={false}
            prefixCls="my-prefix1"
            siderMenuType="group"
            menu={{
              collapsedShowGroupTitle: false,
            }}
            avatarProps={{
              src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
              size: 'small',
              title: user ? user.name : 'Guest',
              render: (props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'logout',
                          icon: <LogoutOutlined />,
                          label: 'Logout',
                          onClick: handleLogout,
                        },
                      ],
                    }}
                  >
                    {dom}
                  </Dropdown>
                );
              },
            }}
            actionsRender={(props) => {
              if (props.isMobile) return [];
              if (typeof window === 'undefined') return [];
              return [
                props.layout !== 'side' && document.body.clientWidth > 1400 ? (
                  <></>
                ) : undefined,
                user ? (
                  <Button
                    onClick={handleCreditButtonClick}
                    disabled={user.role === 'doctor'}
                  >
                    {user ? `Credit: ${user.credit}` : 'Loading...'}
                  </Button>
                ) : null,
                <GithubFilled key="GithubFilled"  onClick={handleClick}/>,
              ];
            }}
            menuHeaderRender={(_, __, ___) => {
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={Logo} alt="logo" style={{ width: '50px', marginRight: '8px' }} />
                    <span>PDP</span>
                    <Menu
                      mode="horizontal"
                      defaultSelectedKeys={[routeKeyMapping[location.pathname]]}
                      items={items}
                      style={{ flex: 1, justifyContent: 'space-between' }}
                    />
                  </div>
                </>
              );
            }}
          >
            <Modal
              title="Add Credit"
              open={modalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
            >
              <Form form={form}>
                <Form.Item
                  name="add_credit"
                  label="Add credit"
                  rules={[
                    {
                      required: true,
                      message: 'Please input the credit amount',
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: '100%',
                    }}
                    min={0}
                  />
                </Form.Item>
              </Form>
            </Modal>
            <PageContainer>{children}</PageContainer>
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  );
};
export default AppLayout;