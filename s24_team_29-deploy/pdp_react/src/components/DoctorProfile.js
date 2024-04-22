import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Descriptions, Avatar, Badge, Rate, List, Typography, Button,Tag,message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
const { Text, Paragraph, Title } = Typography;

function DoctorProfile() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user, updateUser } = useUser();

  const handlePayClick = async() => {
    if (user.credit>=20){
      try{
        const creditUpdateResponse = await axios.put(`http://localhost:8000/api/users/${user.id}/update_credit/`, {
                        credit: user.credit - 20
                    }, {
                        withCredentials: true
                    });
                    
        
        const creditUpdateResponse1 = await axios.put(`http://localhost:8000/api/users/${doctor.user_id}/update_credit/`, {
          credit: doctor.credit + 20
      }, {
          withCredentials: true
      });
    }
                  
      catch (error) {
        console.error('Failed to show contact', error);
        message.error('Failed to show contact: ' + (error.response?.data?.message || error.message));

    }
    setShowPhone(true); 
    }
    else{
      message.error('Not enough credit');
    }
  };

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/doctors/${doctorId}`);
      setDoctor(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctor data:', error);
    }
  };

  const fetchPosts = async (doctor) => {
    try {
      const response = await axios.get('http://localhost:8000/api/posts/');
      const fetchedPosts = response.data.filter(post =>
        post.comments.some(comment => comment.author === doctor.user_id)
      ).map(post => ({
        id: post.id,
        comments: post.comments || [],
        title: post.title,
        content: post.content,
        category_name: post.category_name || 'General',
        isExpanded: false,
        image: post.image,
        author: post.author,
        hasComments: post.comments.length > 0
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const docData = await fetchDoctorData();
      if (docData) {
        await fetchPosts(docData); // Ensure posts are fetched after doctor data is loaded
      }
    };

    fetchData();
  }, [doctorId]);

  if (!doctor) {
    return <div>Loading doctor's profile...</div>;
  }

  return (
    <Card>
      <Descriptions title="Doctor Profile" bordered>
        <Descriptions.Item label="Avatar" span={3}>
          <Badge count={doctor.rating} showZero>
            <Avatar shape="square" size={64} icon={<UserOutlined />} src={`http://localhost:8000${doctor.photo}`} />
          </Badge>
        </Descriptions.Item>
        <Descriptions.Item label="Name">{doctor.first_name + " " + doctor.last_name}</Descriptions.Item>
        <Descriptions.Item label="Hospital">{doctor.hospital}</Descriptions.Item>
        <Descriptions.Item label="Department">{doctor.category}</Descriptions.Item>
        <Descriptions.Item label="Position">{doctor.position}</Descriptions.Item>
        <Descriptions.Item label="Consultations">{doctor.consultations}</Descriptions.Item>
        <Descriptions.Item label="Rating">
          <Rate allowHalf disabled defaultValue={doctor.rating } />
        </Descriptions.Item>
      </Descriptions>
      <Title level={4}>Doctor's historical consultation records</Title>
      <List
        itemLayout="vertical"
        dataSource={posts}
        renderItem={post => (
          <List.Item>
            <List.Item.Meta
              title={<Text strong>{`Patient's question: ${post.title}`}</Text>}
              description={<Paragraph>{post.content}</Paragraph>}
            />
            {post.comments && post.comments.length > 0 && (
              <>
                <Text strong style={{ marginTop: 16, display: 'block' }}>Doctor's answers:</Text>
                <List
                  size="small"
                  dataSource={post.comments}
                  renderItem={comment => (
                    <List.Item>
                      <Paragraph>
                        <Text>{comment.text}</Text> - <Tag color="blue">{comment.author_name}</Tag>
                      </Paragraph>
                    </List.Item>
                  )}
                />
              </>
            )}
          </List.Item>
        )}
      />
      
      {!showPhone && (
        <>
          <Paragraph style={{ color: 'red', fontWeight: 'bold' }}>
            Clicking "Show Contact" will deduct 20 credits from your account.
            Please store the Phone Number After it is shown since it will disappear after you refresh.
          </Paragraph>
          <Button type="primary" onClick={handlePayClick}>
            Show Contact
          </Button>
        </>
      )}
      {showPhone && (
        <Descriptions.Item label="Work Phone">
          Doctor's work Phone: {doctor.phone_number}
        </Descriptions.Item>
      )}
    </Card>
  );
}

export default DoctorProfile;
