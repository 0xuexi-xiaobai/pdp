import React from 'react';
import axios from 'axios';
import { ProList } from '@ant-design/pro-components';
import { Tag, Button, Select,Input,message } from 'antd';
import { useEffect, useState } from "react";
import { useUser } from '../contexts/UserContext';
import { Typography } from 'antd';

const { Title } = Typography;

const CustomHeaderTitle = () => (
  <Title level={3} style={{ fontSize: '20px', color: '#1890ff' }}>
    Common articles
  </Title>
);

const ArticleList = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]); // save article data
  const [query, setQuery] = useState('');
  const { user } = useUser();

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/');
      const categoriesData = response.data.map(category => ({
        label: category.name,
        value: category.name,
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  useEffect(() => {


        console.log(user);
        if (!user) {
            console.log("User data is not available yet.");
            return; // User data not loaded yet
        }

        if (user.role !== 'patient') {
            message.error("You are not authorized to view this page.");
            return; // Exit if not a patient
        }
    const fetchArticles = async () => {
    axios.get('http://localhost:8000/api/articles/')
      .then(response => {
        console.log(response.data);
        const fetchedArticles = response.data.map(article => ({
          title: article.title,
          content: article.content,
          category_name: article.category_name,
          isExpanded: false,
          image: article.image,
        }));
        console.log('test article');

        fetchCategories();
        setArticles(fetchedArticles);

      
      })
      .catch(error => console.error('Error fetching articles:', error));
      
    }
    fetchArticles();
    const intervalId = setInterval(fetchArticles, 5000);

    return () => clearInterval(intervalId);
      
  }, []);

  const toggleExpand = (title) => {
    const updatedArticles = articles.map((article) => {
      if (article.title === title) {
        return { ...article, isExpanded: !article.isExpanded };
      }
      return article;
    });
    setArticles(updatedArticles);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(query.toLowerCase()) &&
      (!selectedCategory || selectedCategory==='General' || article.category_name === selectedCategory)
  );

  return (
    <>
      <div>
        <Input placeholder="Input keyword to search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        />
      </div>
      <Select defaultValue="General" style={{ width: 200 }} onChange={value => setSelectedCategory(value)}>
        {categories.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
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
            // render: () => (
            //   <img
            //     width={300}
            //     height={200}
            //     alt="logo"
            //     // src={Sto}
            //   />
            // ),
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



export default ArticleList;
