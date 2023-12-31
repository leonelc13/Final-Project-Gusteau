import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import '../style/navbar.css';

const config = require('../config.json');

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
const NavText = ({ href, text, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Typography component={"span"}
      style={{
        fontFamily: 'Helvetica Neue',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: 18
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
          position: 'relative'
        }}
        className='NavLink'
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}

      >
        <div className={`hover-box ${hovered ? 'active' : ''}`}></div>
        <FontAwesomeIcon icon={icon} className={hovered ? 'bounce' : ''} style={{ color: "#ffffff", marginRight: '10px' }} />
        {text}
      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar(props) {
  const handleLogout = () => {
    props.handleLogout();
  }
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [randomRecipe, setRandomRecipe] = useState({});

  // Get random recipe for ROTD page
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => { setRandomRecipe(resJson); });
  }, []);

  return (
    <AppBar position='static' className='justify-content-center' style={{ backgroundColor: '#F2A89F' }} elevation={0}>
      <Container maxWidth='s'>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-evenly' }} disableGutters>
          <NavText href='/' text='GUSTEAU' icon={faUtensils} />
          <NavText href='/recipe/stats' text='RECIPE STATS' icon={faMagnifyingGlass} />
          {/* conditionally add href if randomRecipe defined  */}
          <NavText href={randomRecipe && randomRecipe.length > 0 && `/recipe/${randomRecipe[0].id}`} text='ROTD' icon={faFire} />
          <button
            onClick={handleLogout}
            className={`nav-button logout-button ${logoutHovered ? "hovered" : ""
              }`}
            onMouseOver={() => setLogoutHovered(true)}
            onMouseOut={() => setLogoutHovered(false)}
          >
            <div className={`hover-box ${logoutHovered ? "active" : ""}`} />
            <FontAwesomeIcon
              icon={faSignOutAlt}
              style={{ marginRight: "5px" }}
              className={logoutHovered ? "bounce" : ""}
            />
            LOGOUT
          </button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
