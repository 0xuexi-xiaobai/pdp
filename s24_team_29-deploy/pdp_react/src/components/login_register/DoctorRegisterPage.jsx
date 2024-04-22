import React, {useEffect, useState} from 'react';
import { Button, Form, Input, Layout, Menu, Select, Upload, message } from 'antd';
import {PlusOutlined} from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";


const cardStyle = {
  width: 620,
};
const imgStyle = {
  display: 'block',
  width: 273,
};

const { Option } = Select;
const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const positions = [
  'Chief Medical Officer',
  'Clinical Director',
  'Department Chair',
  'Medical Director',
  'Staff Physician',
  'Surgeon',
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 9,
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
        label: <Link to="/patient-login">Go to patient platform</Link>,
    },
]

const App = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const onFinish = async (values) => {
      try {
          const formData = new FormData();
          formData.append('username', values.username);
          formData.append('password', values.password);
          formData.append('confirm_password', values.confirm);
          formData.append('first_name', values.username);
          formData.append('first_name', values.first_name);
          formData.append('last_name', values.last_name);
          formData.append('email', values.email);
          formData.append('phone_number', values.phone);
          formData.append('category', values.category);
          formData.append('position', values.position);
          formData.append('hospital', values.hospital);
          formData.append('address', values.address);
          formData.append('city', values.city);
          formData.append('state', values.state);
          if (values.photo && values.photo.length > 0) {
              formData.append('photo', values.photo[0].originFileObj);
          }

          const response = await axios.post('http://localhost:8000/accounts/doctor-register/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });

          if (response.status === 201) {
            message.success('Registration successful! Please login.');
            navigate('/doctor-login');
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
            width: '500px',
      }}
      >
        <h2 style={{ color: 'black' }}>Register for Doctor</h2>
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
                message: 'Please input your nickname!',
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
          name="category"
          label="Speciality"
          rules={[
            {
              required: true,
              message: 'Please select your speciality!',
            },
          ]}
        >
          <Select placeholder="Select your speciality">
          {categories
            .filter((category) => category.name !== "General")
            .map((category) => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))
          }
        </Select>
        </Form.Item>

          <Form.Item
          name="position"
          label="Position"
          rules={[
            {
              required: true,
              message: 'Please select your position!',
            },
          ]}
        >
          <Select placeholder="Select your position">
            {positions.map((position) => (
              <Option key={position} value={position}>
                {position}
              </Option>
            ))}
          </Select>
        </Form.Item>

         <Form.Item
            name="hospital"
            label="Hospital"
            rules={[
              {
                required: true,
                message: 'Please input your hospital!',
              },
            ]}
          >
            <Input />
          </Form.Item>

            <Form.Item
            name="address"
            label="Address"
            rules={[
              {
                required: true,
                message: 'Please input your address',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="city"
            label="City"
            rules={[
              {
                required: true,
                message: 'Please input your city',
              },
            ]}
          >
            <Input />
          </Form.Item>

            <Form.Item
          name="state"
          label="State"
          rules={[
            {
              required: true,
              message: 'Please select your state!',
            },
          ]}
        >
          <Select placeholder="Select your state">
            {states.map((state) => (
              <Option key={state} value={state}>
                {state}
              </Option>
            ))}
          </Select>
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
          name="photo"
          label="Upload your profile"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            {
              required: true,
              message: 'Please upload your photo!',
            },
          ]}
        >
          <Upload
            action="/upload.do"
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
            <span style={{ color: 'black', marginLeft: '8px' }}><br/><br/>Already have an account!</span>{' '}
            <Link to="/doctor-login">Login here</Link>
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