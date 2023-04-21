import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';

const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [recipeOfTheDay, setRecipeOfTheDay] = useState({});
  const [allRecipes, setAllRecipes] = useState([]);
  const [author, setAuthor] = useState('');

  const [selectedSongId, setSelectedSongId] = useState(null);

  const OPTIONS_LIMIT = 100;
  const defaultFilterOptions = createFilterOptions();

  const filterOptions = (options, state) => {
    return defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
  };

  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => setRecipeOfTheDay(resJson));
  }, []);

  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/recipes`)
      .then(res => res.json())
      .then(resJson => { setAllRecipes(resJson) });
  }, []);

  return (
    <Container>
      <Stack spacing={2} sx={{ width: "100%", marginTop: "3%" }}>
        <Autocomplete
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
          disableClearable
          options={allRecipes}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search input"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
      </Stack>
      {/* SongCard is a custom component that we made. selectedSongId && <SongCard .../> makes use of short-circuit logic to only render the SongCard if a non-null song is selected */}
      {selectedSongId && <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />}
      <h2>Check out your song of the day:&nbsp;
        <Link onClick={() => setSelectedSongId(recipeOfTheDay.id)}>{recipeOfTheDay.name}</Link>
      </h2>

    </Container>
  );
};