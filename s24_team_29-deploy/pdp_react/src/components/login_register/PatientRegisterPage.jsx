import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Layout, Menu, Select, message } from 'antd';
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";


const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 15,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const { Header, Content, Footer } = Layout;
const items = [
    {
        key: '1',
        label: <Link to="/doctor-login">Go to doctor platform</Link>,
    },
]

const App = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      formData.append('confirm_password', values.confirm);
      formData.append('email', values.email);
      formData.append('phone_number', values.phone);
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('age', values.age.toString());
      formData.append('gender', values.gender);

      const response = await axios.post('http://localhost:8000/accounts/patient-register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        message.success('Registration successful! Please login.');
        navigate('/patient-login');
      } else {
        message.error('Registration failed. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessages = Object.values(error.response.data).join(' ');
        message.error(errorMessages);
      } else {
        message.error('An error occurred. Please try again.');
      }
    }
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
      </Select>
    </Form.Item>
  );
  const [autoCompleteResult, setAutoCompleteResult] = useState([]);
  const onWebsiteChange = (value) => {
    if (!value) {
      setAutoCompleteResult([]);
    } else {
      setAutoCompleteResult(['.com', '.org', '.net'].map((domain) => `${value}${domain}`));
    }
  };
  const websiteOptions = autoCompleteResult.map((website) => ({
    label: website,
    value: website,
  }));
  const onChange = (value) => {
  console.log('changed', value);
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
          backgroundImage: 'url("https://easthillsasc.com/wp-content/uploads/2014/11/Patient-Background-White.png")',
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
            width: '500px',
      }}
      >
        <h2 style={{ color: 'black' }}>Register for patient</h2>
        <Form
          {...formItemLayout}
          form={form}
          name="register"
          onFinish={onFinish}
          initialValues={{
            prefix: '+1',
          }}
          style={{
            maxWidth: 600,
          }}
          scrollToFirstError
        >
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The new password that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="username"
            label="User name"
            tooltip="What do you want others to call you?"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[
              {
                required: true,
                message: 'Please input your first name!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[
              {
                required: true,
                message: 'Please input your last name!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: 'Please input your phone number!',
                },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const phoneRegex = /^\d{10}$/;
                    if (phoneRegex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Please enter a valid 10-digit phone number');
                  },
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                style={{
                  width: '100%',
                }}
              />
            </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            rules={[
              {
                required: true,
                message: 'Please input your age',
              },
            ]}
          >
            <InputNumber
              style={{
                width: '100%',
              }}
              min={0}
              onChange={onChange}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              {
                required: true,
                message: 'Please select gender!',
              },
            ]}
          >
            <Select placeholder="select your gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
            <span style={{ color: 'black', marginLeft: '8px' }}><br/><br/>Already have an account!</span>{' '}
            <Link to="/patient-login">Login here</Link>
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
export default App;