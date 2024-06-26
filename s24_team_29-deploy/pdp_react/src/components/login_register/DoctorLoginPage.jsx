import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Layout, Menu, theme, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { ProConfigProvider } from "@ant-design/pro-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";

const { Header, Content, Footer } = Layout;
const items = [
  {
    key: '1',
    label: <Link to="/patient-login">Go to patient platform</Link>,
  },
]

const NormalLoginForm = () => {
  const { token: { colorBgContainer, borderRadiusLG }, } = theme.useToken();
  const [form] = Form.useForm();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (storedUsername && storedPassword) {
      form.setFieldsValue({
        username: storedUsername,
        password: storedPassword,
        remember: true,
      });
    }
  }, []);

  const navigate = useNavigate();
  const { updateUser } = useUser();
  const onFinish = async (values) => {

    console.log('Received values of form: ', values);

    console.log('Received values of form: ', values);
    if (values.remember) {

      localStorage.setItem('username', values.username);
      localStorage.setItem('password', values.password);
    } else {
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }

    try {
      const response = await axios.post('http://localhost:8000/accounts/doctor-login/', {
        username: values.username,
        password: values.password,
      }, {
        withCredentials: true  // ensure cookies
      });

      if (response.statusText === "OK") {
        console.log('Login successful');
        message.success('Login success.');
        localStorage.setItem('authToken', response.data.token);
        updateUser(response.data.user);
        navigate('/page3');
      } else {
        console.error('Login failed:', response.data.message);
        message.error('Login failed.' + response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error('Authentication error:', error.response.data);
        if (error.response.status === 401) {
          // Handling unauthorized access specifically
          message.error('Login failed: Invalid credentials');
        } else {
          // Handling other types of errors (e.g., 500, 503 etc.)
          message.error('Error: ' + error.response.data.message);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error:', error.request);
        message.error('Network error. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error:', error.message);
        message.error('Error: ' + error.message);
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />
      </Header>
      <Content
        style={{
          padding: '0 48px',
          flex: 1,
          backgroundImage: 'url("https://cpsnb.org/images/slideshow/cpsnb_slide3.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
          }}
        >
          <h2 style={{ color: 'black' }}>Login for Doctor</h2>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: 'black' }}>Remember me</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
              </Button>
              <span style={{ color: 'black', marginLeft: '8px' }}><br /><br />Or</span>{' '}
              <Link to="/doctor-register">register now!</Link>
            </Form.Item>
          </Form>
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Patient Doctor Platform ©{new Date().getFullYear()} Created by Team 29
      </Footer>
    </Layout>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <NormalLoginForm />
    </ProConfigProvider>
  );
};