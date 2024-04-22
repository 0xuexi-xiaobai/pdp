import React, { useEffect } from 'react';
import './App.css';
import PostList from './components/PostList';
import ArticleList from './components/ArticleList.js';
import AppLayout from './components/AppLayout.jsx';
import FindDoctor from './components/FindDoctor';
import DoctorProfile from './components/DoctorProfile';
import PatientsPage from './components/PatientSearchPage';
import DoctorLoginPage from './components/login_register/DoctorLoginPage';
import PatientLoginPage from './components/login_register/PatientLoginPage';
import PatientRegisterPage from './components/login_register/PatientRegisterPage';
import DoctorRegisterPage from './components/login_register/DoctorRegisterPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import axios from 'axios';
import DoctorPostList from './components/DoctorPostList';
import DoctorArticleList from './components/DoctorArticleList'
import PrivateRoute from './components/PrivateRoute';
function App() {
  const { updateUser } = useUser();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/', {
          withCredentials: true
        });
        if (response.data) {
          updateUser(response.data.user);
        } else {
          console.log('fail to fetch user info');
        }
      } catch (error) {
        console.error('fail to fetch user info:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PatientLoginPage />} />
          <Route path="/doctor-register" element={<DoctorRegisterPage />} />
          <Route path="/doctor-login" element={<DoctorLoginPage />} />
          <Route path="/patient-register" element={<PatientRegisterPage />} />
          <Route path="/patient-login" element={<PatientLoginPage />} />

          <Route
            path="/page1"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <PostList />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/page3"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <DoctorPostList />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/page4"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <DoctorArticleList />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/page2"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <ArticleList />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/find_doctors"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <FindDoctor />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/doctor/:doctorId"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <DoctorProfile />
                </AppLayout>
              } />
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute element={() =>
                <AppLayout>
                  <PatientsPage />
                </AppLayout>
              } />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;