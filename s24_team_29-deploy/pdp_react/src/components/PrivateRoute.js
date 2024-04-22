import React from 'react';
import { Navigate } from 'react-router-dom';

const isLoggedIn = () => {
    const authToken = localStorage.getItem('authToken');

    return authToken !== null;
};

const PrivateRoute = ({ element: Component, ...rest }) => {
    const isAuthenticated = isLoggedIn();

    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;
