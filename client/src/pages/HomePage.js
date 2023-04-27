import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import Chip from '@mui/material/Chip';
import LinkPreview from '../components/LinkPreview';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
// import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";
import { Autocomplete, createFilterOptions } from '@mui/material';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [recipeOfTheDay, setRecipeOfTheDay] = useState({});
  const [allRecipes, setAllRecipes] = useState([]);
  const [value, setValue] = useState('');
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientList, setIngredientList] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null)
  const [foodTags, setFoodTags] = useState([]);

  const OPTIONS_LIMIT = 100;
  const defaultFilterOptions = createFilterOptions();

  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ingredients`)
      .then(res => res.json())
      .then(resJson => { setAllIngredients(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/some_ingredients/${ingredientList}`)
      .then(res => res.json())
      .then(resJson => { setSelectedRecipes(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/recipes`)
      .then(res => res.json())
      .then(resJson => { setAllRecipes(resJson) });
  }, [ingredientList]);

  const handleKeyDown = ({ key, id }) => {
    if (key === 'Enter') {
      navigate(`/recipe/${text.id}`)
    }
  };

  const handleSwitchChange = () => {
    setChecked(!checked);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Add the selected value as a chip
      // Here you can implement your search logic
      setSelectedValue()
      console.log("Searching for: ", selectedValue);
      setFoodTags([selectedValue, ...foodTags]);
    }
  };

  return !checked ? (
    <Container>
      <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={checked}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'controlled' }} defaultUnchecked />} label="Search By Ingredient" />
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
          disableClearable
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
      <h2>Check out your RECIPE of the day:
        <Link onClick={() => setSelectedSongId(recipeOfTheDay.id)}>{recipeOfTheDay.name}</Link>
      </h2>
    </Container>
  ) :
    // Checking by ingredients
    (<Container>
      <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={checked}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'controlled' }} defaultUnchecked />} label="Search By Ingredient" />
        </FormGroup>
        <Autocomplete
          // onKeyPress={handleKeyPress}
          onChange={(event, value) => setText(value)}
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
          disableClearable
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
        {foodTags.length > 0 && (
          <Chip label={foodTags[0]} onDelete={() => setSelectedValue(null)} />
        )}
      </Stack>
      <h2>Check out your RECIPE of the day:
        <Link onClick={() => setSelectedSongId(recipeOfTheDay.id)}>{recipeOfTheDay.name}</Link>
      </h2>
    </Container>);
};