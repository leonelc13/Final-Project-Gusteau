import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import RecipeStatPage from './pages/RecipeStatPage';
import RecipeInfoPage from './pages/RecipeInfoPage';
import ContributorPage from './pages/ContributorPage';
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'


// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  const [authenticated, setAuthenticated] = useState(sessionStorage.getItem('app-token') !== null);
  const username = useRef(null);
  const email = useRef(null);

  const handleLogout = () => {
      sessionStorage.removeItem('app-token');
      window.location.reload(true);
  };

  const handleLogin = async (response) => {
      const { apptoken, username: usernameValue, email: emailValue}  = await response.json();
      username.current = usernameValue;
      email.current = emailValue;
      if (apptoken) {
          sessionStorage.setItem('app-token', apptoken);
          setAuthenticated(true);
      }

  }

  useEffect(() => {
      console.log(authenticated);
  }, [authenticated]);

  let props = {
    handleLogout: handleLogout
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {authenticated ? (
          <>
          <NavBar {...props} />
          <Routes>
            <Route path='*' element={<Navigate to='/' />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/recipe/:recipe_id" element={<RecipeInfoPage />} />
          </Routes>
          </>
        ) : (
          <Routes>
            <Route path='/login' element={<LoginPage handleLogin={handleLogin} />} />
            <Route path='/register' element={<RegisterPage handleLogin={handleLogin} />} />
            <Route path='*' element={<Navigate to='/login' />} />
          </Routes>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}