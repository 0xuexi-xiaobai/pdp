import React, { useState, useEffect } from 'react';
import { Input, Card, Avatar, Button, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import './style.css';

const { Search } = Input;
const { Option } = Select;

const dummyPatients = [
  { id: 1, name: 'John Doe', lastAnswerDate: moment().subtract(2, 'days').format('YYYY-MM-DD'), age: 28, sex: 'Male' },
  { id: 2, name: 'Jane Smith', lastAnswerDate: moment().subtract(1, 'weeks').format('YYYY-MM-DD'), age: 34, sex: 'Female' },
  { id: 3, name: 'Alice Brown', lastAnswerDate: moment().subtract(1, 'months').format('YYYY-MM-DD'), age: 45, sex: 'Female' },
  { id: 4, name: 'David Clark', lastAnswerDate: moment().subtract(1, 'days').format('YYYY-MM-DD'), age: 37, sex: 'Male' },
  { id: 5, name: 'Emma Wilson', lastAnswerDate: moment().subtract(3, 'days').format('YYYY-MM-DD'), age: 30, sex: 'Female' },
  { id: 6, name: 'Liam Johnson', lastAnswerDate: moment().subtract(1, 'weeks').add(1, 'days').format('YYYY-MM-DD'), age: 62, sex: 'Male' },
  { id: 7, name: 'Olivia Martin', lastAnswerDate: moment().subtract(2, 'months').format('YYYY-MM-DD'), age: 26, sex: 'Female' },
  { id: 8, name: 'Noah Thompson', lastAnswerDate: moment().subtract(6, 'days').format('YYYY-MM-DD'), age: 50, sex: 'Male' },
  { id: 9, name: 'Sophia Garcia', lastAnswerDate: moment().subtract(2, 'weeks').format('YYYY-MM-DD'), age: 41, sex: 'Female' },
  { id: 10, name: 'Ethan Martinez', lastAnswerDate: moment().subtract(5, 'days').format('YYYY-MM-DD'), age: 35, sex: 'Male' },
  { id: 11, name: 'Isabella Rodriguez', lastAnswerDate: moment().subtract(3, 'weeks').format('YYYY-MM-DD'), age: 28, sex: 'Female' },
  { id: 12, name: 'Mason Lee', lastAnswerDate: moment().subtract(1, 'weeks').subtract(2, 'days').format('YYYY-MM-DD'), age: 60, sex: 'Male' },
];

const PatientCard = ({ name, lastAnswerDate, age, sex }) => (
  <Card className="patient-card">
    <Card.Meta
      avatar={<Avatar size="large" icon={<UserOutlined />} />}
      title={name}
      description={`Last answer date: ${lastAnswerDate}\nAge: ${age}\nSex: ${sex}`}
    />
    <Button type="primary" className="select-button">Select</Button>
  </Card>
);

function PatientsPage() {
  const [patients, setPatients] = useState(dummyPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // This effect will trigger whenever the filter or searchTerm changes.
  useEffect(() => {
    applyFilter();
  }, [filter, searchTerm]);

  // Apply the filter and search term to the patients list
  const applyFilter = () => {
    setPatients(dummyPatients.filter(patient => {
      const matchesName = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesDate = true;

      const patientDate = moment(patient.lastAnswerDate);
      const now = moment();
      switch (filter) {
        case 'today':
          matchesDate = patientDate.isSame(now, 'day');
          break;
        case 'thisWeek':
          matchesDate = patientDate.isSame(now, 'week');
          break;
        case 'thisMonth':
          matchesDate = patientDate.isSame(now, 'month');
          break;
        default:
          matchesDate = true;
      }

      return matchesName && matchesDate;
    }));
  };

  return (
    <div className="patients-page">
      <div className="search-bar">
        <Search
          placeholder="Search patient"
          onSearch={value => setSearchTerm(value)}
          style={{ width: 200 }}
          enterButton
        />
        <Select defaultValue="all" style={{ width: 120 }} onChange={value => setFilter(value)}>
          <Option value="all">All Dates</Option>
          <Option value="today">Today</Option>
          <Option value="thisWeek">This Week</Option>
          <Option value="thisMonth">This Month</Option>
        </Select>
      </div>
      <div className="patients-list">
        {patients.map(patient => (
          <PatientCard key={patient.id} {...patient} />
        ))}
      </div>
    </div>
  );
}

export default PatientsPage;
