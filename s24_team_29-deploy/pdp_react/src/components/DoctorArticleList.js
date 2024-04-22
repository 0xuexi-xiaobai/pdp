import React from 'react';
import axios from 'axios';
import { ProList } from '@ant-design/pro-components';
import { Tag, Button, Select, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormUploadButton } from '@ant-design/pro-form';
import { useUser } from '../contexts/UserContext';
import { Typography } from 'antd';

const { Title } = Typography;

const CustomHeaderTitle = () => (
  <Title level={3} style={{ fontSize: '20px', color: '#1890ff' }}>
    Common articles
  </Title>
);

const DoctorArticleList = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();
  const [articles, setArticles] = useState([]); // save article data
  const { user, updateUser } = useUser();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    console.log(user);
        if (!user) {
            console.log("User data is not available yet.");
            return;
        }

        if (user.role !== 'doctor') {
            message.error("You are not authorized to view this page.");
            return;
        }
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/articles/');
        const fetchedArticles = response.data.map(article => ({
          category: article.category,
          title: article.title,
          content: article.content,
          category_name: article.category_name,
          image: article.image,
          isExpanded: false,
        }));
        setArticles(fetchedArticles);
        fetchCategories();
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/');
      const categoriesData = response.data.map(category => ({
        label: category.name,
        value: category.name, // id
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  const toggleExpand = (title) => {
    const updatedArticles = articles.map((article) => {

      if (article.title === title) {
        return { ...article, isExpanded: !article.isExpanded };
      }


      return article;
    });
    setArticles(updatedArticles);
  };
  const createArticle = async (values, authorid) => {
    if (user.credit >= 0) {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('category_name', values.category);
      formData.append('author', authorid);
      if (values.image) {
        formData.append('image', values.image[0].originFileObj);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      console.log('test here');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      };
      console.log('----------');
      try {
        // Send a POST request to the server to create a new post
        const response = await axios.post('http://localhost:8000/api/articles/', formData, config, {
          withCredentials: true // Include this if API requires session or cookie-based authentication
        });

        if (response.status === 201 || response.status === 200) {
          const cryptoUpdateResponse = await axios.put(`http://localhost:8000/api/users/${user.id}/update_credit/`, {
            credit: user.credit + 10
          }, {
            withCredentials: true
          });
          message.success('Article created successfully');
          updateUser(cryptoUpdateResponse.data.user);
          form.resetFields();
        } else {
          message.error('Failed to create the Article: Unexpected response');
        }
      } catch (error) {
        console.error('Failed to create the Article', error);
        message.error('Failed to create the Article: ' + (error.response?.data?.message || error.message));
      }
    } else {
      form.resetFields();
      message.error('not enough credit');
    }


  };
  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category_name.toString() === selectedCategory)
    : articles;
  return (
    <>
      <Select defaultValue="General" style={{ width: 200 }} onChange={value => setSelectedCategory(value)}>
        {categories.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
      <ModalForm
        form={form}
        title="New Post"
        trigger={
          <Button type="primary" icon={<PlusOutlined />} >
            Post a new article
          </Button>
        }
        onFinish={async (values) => {
          createArticle(values, user.id);
          return true;
        }}
      >
        <ProFormText
          name="title"
          label="Title"
          placeholder="Title"
          rules={[{ required: true, message: 'Please input the title of the post!' }]}
        />
        <ProFormTextArea
          name="content"
          label="Content"
          placeholder="Content"
          rules={[{ required: true, message: 'Please input the content of the post!' }]}
        />
        <ProFormSelect
          options={categories}
          name="category"
          label="Category"
          placeholder="Choose category"
          rules={[{ required: true, message: 'Please select a category for the post!' }]}
        />
        <ProFormUploadButton
          name="image"
          label="Article Image"
          max={1}
          title="Upload Image"
          fieldProps={{
            listType: 'picture',
            beforeUpload: (file) => {
              return false; // Prevent automatic upload
            }
          }}
          action="/upload.do"
          extra="Optional: Upload an image for your Article."
        />
      </ModalForm>
      <ProList
        toolBarRender={() => {
          // return [
          //   <Button key="3" type="primary">
          //     new
          //   </Button>,
          // ];
        }}
        itemLayout="vertical"
        rowKey="title"
        headerTitle={<CustomHeaderTitle />}
        dataSource={filteredArticles}
        metas={{
          title: {},
          description: {

            render: (title, article) => {
              // console.log(title);
              // console.log(article);
              return (

                <>
                  <Tag>{article.category_name}</Tag>
                </>
              );

            },
          },
          actions: {
            render: () => [
              // <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
              // <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
              // <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,

            ],
          },
          extra: {
            render: (content, article) => (
              // <img
              //   width={300}
              //   height={200}
              //   alt="logo"
              //   src={`http://localhost:8000${article.image}`}
              // />
              <></>
            ),
          },
          content: {
            render: (content, article) => {
              return (
                <>

                  {article.image && <img src={`http://localhost:8000${article.image}`} alt="article" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />}
                  <div style={{ height: article?.isExpanded ? 'auto' : '150px', overflow: 'hidden' }}>
                    {content}
                  </div>
                  <Button type="link" onClick={() => toggleExpand(article?.title)}>
                    {article?.isExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                </>
              );
            },
          },
        }}
      />
    </>

  );
};



export default DoctorArticleList;
