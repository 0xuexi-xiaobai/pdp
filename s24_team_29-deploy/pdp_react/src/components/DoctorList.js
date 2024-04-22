import React from 'react';
import DoctorCard from './DoctorCard';
import './style.css';

function DoctorList({ doctors }) {
  return (
    <div className="doctor-list">
      {doctors.map((doctor, index) => (
        <DoctorCard key={index} {...doctor} />
      ))}
    </div>
  );
}

export default DoctorList;