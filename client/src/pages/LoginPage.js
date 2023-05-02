import React, { useEffect, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "../style/loginPage.css";
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { SiGoogle } from 'react-icons/si';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const config = require('../config.json');

function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ googleUser, setGoogleUser ] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { handleLogin } = props;

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      if (codeResponse && codeResponse.access_token) {
        setGoogleUser(codeResponse);
        googleSignIn(codeResponse.access_token); // pass the access token to googleSignIn function
      }
    },
    onFailure: (err) => console.log(err)
  });

  const responseFacebook = (response) => {
    console.log(response);
    facebookSignIn(response);
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };


  const handleSubmit = useCallback (async (event) => {
    event.preventDefault();
    
    try {
        console.log('here 42')
      const response = await fetch(`http://${config.server_host}:${config.server_port}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${username}&password=${password}`
      })
      console.log(response);
      await handleLogin(response);
    } catch (err) {
        console.log('here 50')
        const error = await err.response.json();
        setErrorMessage(error.error || err.message);
    }
  }, [username, password, handleLogin]);


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
    <div className="login-container">
      <h1 className="heading-text">WELCOME BACK</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <p className="sign-text">Sign In</p>
        <p className="registration-text">
          Or <Link to="/register" className="sign-up-text">Sign Up</Link> to make your own account
        </p>
        <button onClick={() => googleLogin()} className="googleButton">
            <SiGoogle className="google-icon" />
            <span>Sign in with Google</span>
        </button>
        <FacebookLogin
            appId="780050580379053"
            autoLoad={false}
            fields="name, email"
            callback={responseFacebook}
            render={renderProps => (
              <button onClick={renderProps.onClick} className='facebookButton'>
                <FontAwesomeIcon icon={faFacebookF} className='facebook-icon' />
                <span>Sign in with Facebook</span>
              </button>
            )}
        />
        <div>
          <label className="inputs-text" htmlFor="username">Username</label>
          <input type="text" className="login-inputs" value={username} id="username" onChange={handleUsernameChange} />
        </div>
        <div>
          <label className="inputs-text" htmlFor="password">Password</label>
          <input type="password" className="login-inputs" value={password} id="password" onChange={handlePasswordChange} />
        </div>
        <button type="submit" className="login-button">Sign In</button>      
      </form>
    </div>
  );
}

export default Login;