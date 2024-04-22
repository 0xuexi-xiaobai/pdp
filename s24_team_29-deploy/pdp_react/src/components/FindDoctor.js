import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorList from './DoctorList';
import { Select } from 'antd';
import axios from 'axios';

function FindDoctor() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState(['All Specialties']);
  const { Option } = Select;

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/');
      const specialtiesData = response.data.map(category => category.name);
      setSpecialties(['All Specialties', ...specialtiesData]);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/doctors/');
      const allDoctors = response.data;

      if (selectedSpecialty === 'All Specialties') {
        setDoctors(allDoctors);
      } else {
        const filteredDoctors = allDoctors.filter(doctor => doctor.category === selectedSpecialty);
        setDoctors(filteredDoctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSpecialtyChange = (value) => {
    setSelectedSpecialty(value);
  };

  return (
    <div className="find-doctor">
      <h1>Doctors Directory</h1>
      <Select defaultValue={selectedSpecialty} style={{ width: 200 }} onChange={handleSpecialtyChange}>
        {specialties.map(specialty => (
          <Option key={specialty} value={specialty}>{specialty}</Option>
        ))}
      </Select>
      <Routes>
        <Route path="/" element={<DoctorList doctors={doctors} />} />
      </Routes>
    </div>
  );
}

export default FindDoctor;