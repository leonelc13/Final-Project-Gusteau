import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import "../style/registerPage.css";
import axios from "axios";
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { SiGoogle } from 'react-icons/si';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const config = require('../config.json');

function Register(props) {

  // creating all the variables that will store user information 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [ googleUser, setGoogleUser ] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { handleLogin } = props;

  // hanldes username change
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };


  // handles password change
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };


  // handles email change
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  }

  // handles google login process and calls googleSignIn (similar to login page)
  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      if (codeResponse && codeResponse.access_token) {
        setGoogleUser(codeResponse);
        googleSignIn(codeResponse.access_token); // pass the access token to googleSignIn function
      }
    },
    onFailure: (err) => console.log(err)
  });

  // same process as login page
  const responseFacebook = (response) => {
    console.log(response);
    facebookSignIn(response);
  }

  // handles the case where the user attempts to register without google or facebook
  const handleSubmit = useCallback (async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://${config.server_host}:${config.server_port}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: `name=${username}&password=${password}&email=${email}`
      })
      console.log(response);
      handleLogin(response);
    } catch (err) {
      setErrorMessage(err.response.data.error);
      console.log('error', err.message);
    }

  }, [username, email, password, handleLogin]);

  const generateRandomNumber = () => {
    // generates a random number between 1000 and 9999
    return Math.floor(Math.random() * 9000) + 1000;
  };
  
  const generateUsername = (name) => {
    // takes the name provided by Google and adds a random number at the end
    const randomNumber = generateRandomNumber();
    const username = `${name.replace(/\s+/g, '')}${randomNumber}`;
    return username;
  };
  

  // same login page
  const googleSignIn = useCallback(async (access_token) => {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json'
        },
        params: {
          access_token: access_token
        }
      });
      const newName = generateUsername(res.data.name);
      const response = await fetch(`http://${config.server_host}:${config.server_port}/socialLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, password: res.data.id, email: res.data.email })
    });
    await handleLogin(response);
    } catch (err) {
      console.log(err);
    }
  }, [googleUser, generateUsername, handleLogin]);

  // same as login page
  const facebookSignIn = useCallback(async (fbResponse) => {
    console.log(fbResponse);
    const newName = generateUsername(fbResponse.name);
    console.log(newName);
    try {
      const response = await fetch(`http://${config.server_host}:${config.server_port}/socialLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, password: fbResponse.id, email: fbResponse.email })
      });
      await handleLogin(response);
    } catch(err) {
      console.log(err)
    }
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSubmit(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleSubmit]);

  return (
    <div className='register-container'>
      <h1 className='header-text'>JOIN GUSTEAU</h1>
      {errorMessage && <p className='error-text'>{errorMessage}</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        <p className="title-text">Sign Up</p>
        <p className="login-text">
          Or <Link to="/login" className='url-text'>Sign In</Link> to your account
        </p>
        <button onClick={() => googleLogin()} className="googleButton2">
            <SiGoogle className="google-icon2" />
            <span>Sign in with Google</span>
        </button>
        <FacebookLogin
            appId="780050580379053"
            autoLoad={false}
            fields="name, email"
            callback={responseFacebook}
            render={renderProps => (
              <button onClick={renderProps.onClick} className='facebookButton2'>
                <FontAwesomeIcon icon={faFacebookF} className='facebook-icon2' />
                <span>Sign in with Facebook</span>
              </button>
            )}
        />
        <div>
          <label className='titles-text' htmlFor='email'>Email</label>
          <input type="email" value={email} id="email" className="input-edits" onChange={handleEmailChange} />
        </div>
        <div>
          <label className='titles-text' htmlFor="username">Pick a Username</label>
          <input type="text" value={username} id="username" className="input-edits" onChange={handleUsernameChange} />
        </div>
        <div>
          <label className='titles-text' htmlFor='password'>Pick a Password</label>
          <input type="password" value={password} id="password" className="input-edits" onChange={handlePasswordChange} />
        </div>
        <button type="submit" className='btn-edits'>Sign Up</button>
      </form>
    </div>
  );
}

export default Register;