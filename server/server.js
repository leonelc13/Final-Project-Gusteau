const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// app.get('/author/:type', routes.author);
// app.get('/random', routes.random);
// app.get('/song/:song_id', routes.song);
// app.get('/album/:album_id', routes.album);
// app.get('/albums', routes.albums);
// app.get('/album_songs/:album_id', routes.album_songs);
// app.get('/top_songs', routes.top_songs);
// app.get('/top_albums', routes.top_albums);
// app.get('/search_songs', routes.search_songs);

app.get('/all_ingredients/:ingredients', routes.all_ingredients);
app.get('/contributor/:contributor_id', routes.contributor);
app.get('/prep_time', routes.prep_time);
app.get('/min_rating', routes.min_rating);
app.get('/similar_recipes/:recipe_name', routes.similar_recipes)
app.get('/recipes', routes.recipes)
app.get('/some_ingredients/:<ingredients>', routes.some_ingredients);
app.get('/worst_recipes', routes.worst_recipes)
app.get('/top_recipes/:contributor_id ', routes.top_recipes_contrbutor);
app.get('/top_recipes', routes.top_recipes);
app.get('/random', routes.random);
app.get('/recipe/:recipe_id', routes.recipe);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
