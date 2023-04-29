import { useEffect, useState } from 'react';
import { Container, Divider, Link, Button, Box } from '@mui/material';
import Drawer from '@mui/material/Drawer';

import LazyTable from '../components/LazyTable';
import Chip from '@mui/material/Chip';
import LinkPreview from '../components/LinkPreview';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
// import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";
import { Autocomplete, createFilterOptions, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import './HomePage.css';

const config = require('../config.json');

export default function HomePage() {
  // all recipes in DB, used for recipe search autocomplete
  const [allRecipes, setAllRecipes] = useState([]);

  // Autocomplete input text and value
  const [text, setText] = useState('');
  const [value, setValue] = useState('');

  // Switch / toggle for searching by recipe name or ingredient. If true/selected, search by ingredient. Else, if false (default), search by recipe name
  const [checked, setChecked] = useState(false);

  // Switch / toggle for matching for recipes with at least one or all ingredients.
  const [matchAll, setMatchAll] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // all ingredients in DB, used for ingredient search autocomplete
  const [allIngredients, setAllIngredients] = useState([]);

  // recipes that match at least one ingredient for ingredient search, used if toggle for match all is unselected
  const [matchingRecipesOne, setMatchingRecipesOne] = useState([]);
  // recipes that match ALL ingredient for ingredient search, used if toggle for match all is selected
  const [matchingRecipesAll, setMatchingRecipesAll] = useState([]);

  // user-inputted ingredients for ingredient search
  const [foodTags, setFoodTags] = useState([]);
  const [clear, setClear] = useState(false);
  const [ingrPage, setIngrPage] = useState(1);
  const [page, setPage] = useState(1); // 1 indexed
  // const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  // text field for max prep time
  const [maxPrepTime, setMaxPrepTime] = useState(1000);

  const [disableNext, setDisableNext] = useState(true);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSubmit = (e) => {
    handleDrawerClose();
  }
  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };

  const handlePrev = () => {
    setIngrPage(ingrPage => ingrPage - 1);
    setDisableNext(false);
  };

  const handleNext = () => {
    setIngrPage(ingrPage => ingrPage + 1);
    checkNext();
  };

  const OPTIONS_LIMIT = 100;
  const defaultFilterOptions = createFilterOptions();

  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
  };

  const styles = {
    listItem: {
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginBottom: "10px",
      padding: "10px",
      backgroundColor: "#f5f5f5",
    },
    link: {
      color: "#000",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ingredients`)
      .then(res => res.json())
      .then(resJson => { setAllIngredients(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/some_ingredients/${foodTags.join('&')}?page=${ingrPage}&max_prep_time=${maxPrepTime}`)
      .then(res => res.json())
      .then(resJson => { setMatchingRecipesOne(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/all_ingredients/${foodTags.join('&')}?page=${ingrPage}&max_prep_time=${maxPrepTime}`)
      .then(res => res.json())
      .then(resJson => { setMatchingRecipesAll(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/recipes`)
      .then(res => res.json())
      .then(resJson => { setAllRecipes(resJson) });
  }, [foodTags, ingrPage, maxPrepTime]);

  useEffect(() => {
    checkNext();
  }, [ingrPage, matchingRecipesOne, matchingRecipesAll])

  const checkNext = () => {
    if (!matchAll) {
      if (matchingRecipesOne) {
        console.log(matchingRecipesOne)
        if (matchingRecipesOne.length === 10) {
          fetch(`http://${config.server_host}:${config.server_port}/some_ingredients/${foodTags.join('&')}?page=${ingrPage + 1}`)
            .then(res => res.json())
            .then(resJson => {
              if (resJson.length > 0) {
                setDisableNext(false);
              }
            }).catch(error => console.error('Error fetching data:', error));
        } else {
          setDisableNext(true);
        }
      }
    } else {
      if (matchingRecipesAll) {
        console.log(matchingRecipesAll)
        if (matchingRecipesOne.length === 10) {
          fetch(`http://${config.server_host}:${config.server_port}/all_ingredients/${foodTags.join('&')}?page=${ingrPage + 1}`)
            .then(res => res.json())
            .then(resJson => {
              if (resJson.length > 0) {
                setDisableNext(false);
              }
            }).catch(error => console.error('Error fetching data:', error));
        } else {
          setDisableNext(true);
        }
      }
    }

  }

  const handleKeyDown = ({ key, id }) => {
    if (key === 'Enter') {
      navigate(`/recipe/${text.id}`)
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Add the selected value as a chip
      // Here you can implement your search logic
      setClear(!clear);
      if (text.label && !foodTags.includes(text.label)) {
        setFoodTags([...foodTags, text.label]);
      }
    }
  };

  return <Container>{!checked ? (
    <Container>
      <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={checked}
            onChange={() => setChecked(!checked)}
            inputProps={{ 'aria-label': 'controlled' }} />} label="Search By Ingredient" />
        </FormGroup>
        <Autocomplete
          onChange={(event, value) => setText(value)}
          onKeyDown={handleKeyDown}
          filterOptions={filterOptions}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            );
          }}
          freeSolo
          id="free-solo-2-demo"
          autoHighlight
          options={allRecipes}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Recipe Name"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
      </Stack>
    </Container>
  ) :
    // Checking by ingredients
    (<Container>
      <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={checked}
            onChange={() => setChecked(!checked)}
            inputProps={{ 'aria-label': 'controlled' }} />} label="Search By Ingredient" />
        </FormGroup>
        <Autocomplete
          key={clear}
          onChange={(event, value) => setText(value)}
          value={value}
          onKeyDown={handleKeyPress}
          filterOptions={filterOptions}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            );
          }}
          freeSolo
          id="free-solo-2-demo"
          autoHighlight
          options={allIngredients}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ingredient Name"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
        <Stack direction="row" spacing={2}>

          {foodTags.map((tag, idx) => {
            return (<div key={idx}
              style={{
                display: "flex",
                flexWrap: "wrap"
              }}>
              <Chip label={<Typography style={{ whiteSpace: 'normal' }}>{tag}</Typography>} size="medium" style={{ height: "100%" }}
                onDelete={() => {
                  const idx = foodTags.indexOf(tag);
                  if (idx !== -1) {
                    foodTags.splice(idx, 1);
                    setFoodTags([...foodTags]);
                  }
                }} />
            </div>)
          })}
        </Stack>

        <Container>
          <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
            <Button onClick={handleDrawerOpen}>Options</Button>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerClose}
            >
              <Box sx={{ width: 250, paddingLeft: '8%', paddingRight: '8%' }}>
                <h4>More Filters</h4>
                <FormGroup>
                  <FormControlLabel control={<Switch checked={matchAll}
                    onChange={() => setMatchAll(!matchAll)}
                    inputProps={{ 'aria-label': 'controlled' }} />} label="Match all ingredients" />
                  <TextField id="standard-basic" value={maxPrepTime === 1000 ? '' : maxPrepTime} onChange={(event) => { setMaxPrepTime(event.target.value); setIngrPage(1) }} label="Max Prep Time" variant="standard" />
                </FormGroup>
                <Button type="submit" variant="contained" onClick={handleSubmit} className="applyButton" sx={{ ":focus": { border: 'rgb(242, 168, 159)', outline: 'none', borderColor: 'rgb(242, 168, 159)' }, ":hover": { bgcolor: 'rgb(242, 168, 159)' }, backgroundColor: "rgb(242, 168, 159)", position: 'absolute', right: '5%', bottom: 20 }}>Apply</Button>
              </Box>
            </Drawer>
            {/* Rest of the code */}
          </Stack>
        </Container>

      </Stack>

      <Container>
        <Box mx="auto">
          <ol>
            {!matchAll ? (matchingRecipesOne ? (
              matchingRecipesOne.map((recipe) => (
                <a href={`/recipe/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                  <li style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '10px', margin: '10px', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component="h2" style={{ marginBottom: '5px' }}>
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      User ID: {recipe.contributor_id} | Prep Time: {recipe.preparation_time} min | Calories: {recipe.calories} | Num Ingredients: {recipe.num_ingredients}
                    </Typography>
                  </li>
                </a>
              ))
            ) : (
              <p>Loading...</p>
            )) : (matchingRecipesAll ? (
              matchingRecipesAll.map((recipe) => (
                <a href={`/recipe/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                  <li style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '10px', margin: '10px', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component="h2" style={{ marginBottom: '5px' }}>
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      User ID: {recipe.contributor_id} | Prep Time: {recipe.preparation_time} min | Calories: {recipe.calories} | Num Ingredients: {recipe.num_ingredients}
                    </Typography>
                  </li>
                </a>
              ))
            ) : (
              <p>Loading...</p>
            ))}

          </ol>
        </Box>
      </Container>
      {
        foodTags.length > 0 ?
          <Container>
            <div style={flexFormat}>
              <button onClick={handlePrev} disabled={ingrPage === 1}>Previous</button>
              <button onClick={handleNext} disabled={disableNext}>Next</button>
            </div>
          </Container>

          : <></>
      }

    </Container >)
  } </Container >;
};