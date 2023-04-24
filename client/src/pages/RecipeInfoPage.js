import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Button, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
// import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";

import SongCard from '../components/SongCard';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

function genLink(name, id) {
  // Split the string into an array of words
  const words = name.split(' ');

  // Loop through each word in the array
  for (let i = 1; i < words.length; i++) {
    // Check if the current word contains an isolated 's'
    if (words[i] === 's' && words[i - 1]) {
      // Join the 's' with the previous word
      words[i - 1] += 's';
      // Remove the 's' from the array of words
      words.splice(i, 1);
      // Decrement the counter variable to account for the removed word
      i--;
    }
  }

  // Join the words back together into a string
  let s = words.join('-');
  s = 'https://www.food.com/recipe/' + s + '-' + id;
  return s;
}

function recSteps(steps) {
  const regex = /'([^']*'|[^']*)'/g;
  const stepStrings = steps.match(regex);

  // Map each step string to a JSX list item element
  const stepList = stepStrings.map((step, index) => {
    const formattedStep = step.replace(/^'\s*|\s*'$/g, '');

    const formattedStepWithPeriod = `${formattedStep.charAt(0).toUpperCase()}${formattedStep.slice(1).replace(/\s*,/g, ',')}.`;

    return (
      <li key={index}>
        {`${formattedStepWithPeriod}`}
      </li>
    );
  });

  return <ol>{stepList}</ol>;
}


export default function RecipeInfoPage() {
  const { recipe_id } = useParams();

  const [reviews, setReviews] = useState([]); // default should actually just be [], but empty object element added to avoid error in template code
  const [recipe, setRecipe] = useState({});
  const [linkData, setData] = useState({});

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/recipe_reviews/${recipe_id}`)
      .then(res => res.json())
      .then(resJson => { setReviews(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/recipe/${recipe_id}`)
      .then(res => res.json())
      .then(resJson => { setRecipe(resJson) });

  }, [recipe_id]);

  console.log(recipe);
  return (
    <Container>
      <Stack direction='row' justify='center'>
        <Stack>
          <h1>{recipe && recipe.length > 0 ? recipe[0].name.trim() : ''}</h1>
          <p>{recipe && recipe.length > 0 ? recSteps(recipe[0].steps) : 'not working'}</p>
          <Carousel>
            {reviews ? reviews.map((item, i) => <Item key={i} item={item} />) : 'no reviews'}
          </Carousel>
        </Stack>
      </Stack>
    </Container>
  );
}

// getLinkPreview("https://www.food.com/recipe/peanut-butter-and-jelly-panini-90257").then((data) =>
//   setData(data)
// );

function Item(props) {
  return (
    <Paper>
      <h2>User {props.item.user_id}</h2>
      <h2>Rating: {props.item.rating} </h2>
      <p>{props.item.description}</p>
    </Paper>
  )
}