import { AppBar, Container, Grid, Box, Paper, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import React, { useState, Text, Image } from 'react';
import { styled } from '@mui/material/styles';
import './LinkPreview.css';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function LinkPreview(props) {
  return (
    <Grid container spacing={0} className="box" width="60%">
      <Grid item xs={2.5}>
        <img src={props.img} height='auto' width="100%" alt="Food.com logo" className="rounded"></img>
      </Grid>
      <Grid item xs={9.5}>
        <Grid item xs={9.5}>
          <span className='text'>{props.name}</span>
        </Grid>
        <Grid item={9.5}>
          <a className='link' href={props.link}>{props.link}</a>
        </Grid>
      </Grid>
    </Grid>
      // <Container class="box container">
      //   <img class="image" src={'https://source.unsplash.com/random'} alt="Food.com logo"/>
      //   <span class="text">Hey</span>
      // </Container>
  );
}

