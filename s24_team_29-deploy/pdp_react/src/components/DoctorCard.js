import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Avatar, Typography, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './style.css';

const { Meta } = Card;
const { Text, Title } = Typography;

function DoctorCard({ id,first_name,last_name, hospital, rating, consultations,photo,user_id }) {
  const navigate = useNavigate();

  const navigateToProfile = () => {
    navigate(`/doctor/${user_id}`);
  };

  return (
    <Card
      hoverable
      style={{ width: 300, margin: '16px' }}
      cover={
        <img alt="Doctor Profile" src={`http://localhost:8000${photo}`} />
      }
      actions={[
        <Button type="primary" onClick={navigateToProfile}>
          Select
        </Button>
      ]}
    >
      <Meta
        
        title={<Title level={4}>{first_name+" "+ last_name}</Title>}
        description={
          <>
            <Text strong>Hospital:</Text> {hospital}<br />
            <Text strong>Rating:</Text> {rating}<br />
            <Text strong>Consultations:</Text> {consultations}
          </>
        }
      />
    </Card>
  );
}

export default DoctorCard;
