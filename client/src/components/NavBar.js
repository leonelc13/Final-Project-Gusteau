import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import './navbar.css';



// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
const NavText = ({ href, text, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Typography
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
        <FontAwesomeIcon icon={icon} className={hovered ? 'bounce' : ''} style={{color: "#ffffff", marginRight: '10px'}} />
        {text}

      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  return (
    <AppBar position='static' className='justify-content-center' style={{ backgroundColor: '#F2A89F' }} elevation={0}>
      <Container maxWidth='s'>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-evenly' }} disableGutters>
          <NavText href='/' text='GUSTEAU' icon={faUtensils}/>
          <NavText href='/albums' text='RECIPE' icon={faMagnifyingGlass} />
          <NavText href='/songs' text='REVIEWS' icon={faStar} />
          <NavText href='/random' text='ROTD' icon={faFire} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
