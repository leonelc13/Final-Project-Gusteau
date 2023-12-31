import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import LinkPreview from '../components/LinkPreview.js';
import Rating from '@mui/material/Rating';
import '../style/RecipeInfoPage.css';
import { getLinkPreview } from "link-preview-js"
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
function changeTitle(title) {
  const words = title.split(' ');

  // Loop through each word in the array
  for (let i = 1; i < words.length; i++) {
    // Check if the current word contains an isolated 's'
    if (words[i] === 's' && words[i - 1]) {
      // Join the 's' with the previous word
      words[i - 1] += '\'s';
      // Remove the 's' from the array of words
      words.splice(i, 1);
      // Decrement the counter variable to account for the removed word
      i--;
    }
  }
  let s = words.join(' ');
  return s;
}

function recSteps(steps) {
  const regex = /'([^']*)'/g;
  const stepStrings = steps.match(regex);

  // Map each step string to a JSX list item element
  const stepList = stepStrings.map((step, index) => {
    const formattedStep = step.replace(/^'\s*|\s*'$/g, '');

    const formattedStepWithPeriod = `${formattedStep.charAt(0).toUpperCase()}${formattedStep.slice(1).replace(/\s*,/g, ',')}.`;

    return (
      <li className="item" key={index}>
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
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    // get review for given recipe
    fetch(`http://${config.server_host}:${config.server_port}/recipe_reviews/${recipe_id}`)
      .then(res => res.json())
      .then(resJson => { setReviews(resJson) });

    // get basic recipe info
    fetch(`http://${config.server_host}:${config.server_port}/recipe/${recipe_id}`)
      .then(res => res.json())
      .then(resJson => { setRecipe(resJson) });

    // get prices for this recipe's ingredients
    fetch(`http://${config.server_host}:${config.server_port}/price/${recipe_id}`)
      .then(res => res.json())
      .then(resJson => { setPriceData(resJson) });
  }, [recipe_id]);

  const name = recipe && recipe.length > 0 ? recipe[0].name.trim() : '';
  const link = genLink(name, recipe_id);

  getLinkPreview(link).then((data) =>
    setData(data)
  );

  return (
    <Container maxWidth={false} sx={{ width: 1 }}>
      {/* conditional rendering depending on whether both prices and reviews are present*/}
      {priceData && reviews && priceData.length > 0 && reviews.length > 0 ?
        (<Stack sx={{ width: 1, margin: 0 }} direction='row' justify='center'>
          <Stack sx={{ marginLeft: '15%', marginRight: '15', width: 0.7 }}>
            <h1 className="recipeName">{recipe && recipe.length > 0 ? changeTitle(recipe[0].name.trim()) : ''}</h1>
            <h3 className="contributor">CONTRIBUTOR: {recipe && recipe.length > 0 ? <a className="clink" href={`/contributor/${recipe[0].contributor_id}`}>{recipe[0].contributor_id}</a> : 'no contributor'}</h3>
            <p className="stepName">{recipe && recipe.length > 0 ? recSteps(recipe[0].steps) : 'not working'}</p>
            <LinkPreview className="link" link={link} name={recipe && recipe.length > 0 ? changeTitle(recipe[0].name.trim()) : ''} img={linkData.images !== undefined ? linkData.images[0] : "https://geniuskitchen.sndimg.com/fdc-new/img/FDC-Logo.png"} />
            {/* render reviews carousel */}
            <Grid container sx={{ width: 1 }}>
              <Grid item xs={6}>
                {reviews && reviews.length > 0 && <><p className="reviews">Reviews</p>
                  <Carousel autoPlay={false}>
                    {reviews ? reviews.map((item, i) => <Item key={i} item={item} />) : 'no reviews'}
                  </Carousel></>}
              </Grid>
              {/* render prices table */}
              <Grid item xs={6}>
                <p className="prices">Prices</p>
                <TableContainer sx={{ width: 1 }}>
                  <Table sx={{ width: 0.7, marginLeft: '15%', marginRight: '15', marginBottom: '5%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell key='Ingredient'><b>Ingredient</b></TableCell>
                        <TableCell key='Country'><b>Country</b></TableCell>
                        <TableCell key='Price'><b>Price</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {priceData && priceData.length > 0 &&
                        priceData.map(row =>
                          <TableRow sx={{ fontFamily: 'Helvetica Neue', fontSize: '18px' }} key={row.Ingredient_id}>
                            <TableCell sx={{ fontFamily: 'Helvetica Neue', fontSize: '15px' }} key='Ingredient'>{row.Ingredient_name}</TableCell>
                            <TableCell key='Country'>{row.country} - USD</TableCell>
                            <TableCell key='Price'>{row.price && row.unit ? `${row.price} USD / ${row.unit}` : `0.50 USD /g`}</TableCell>
                          </TableRow>)
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Stack>
        </Stack>) : (<Stack sx={{ width: 1, margin: 0, lineHeight: 1.3 }} direction='row' justify='center'>
          <Stack sx={{ marginLeft: '15%', marginRight: '15', width: 0.7, }}>
            <h1 className="recipeName">{recipe && recipe.length > 0 ? changeTitle(recipe[0].name.trim()) : ''}</h1>
            <h3 className="contributor">CONTRIBUTOR: {recipe && recipe.length > 0 ? <a className="clink" href={`/contributor/${recipe[0].contributor_id}`}>{recipe[0].contributor_id}</a> : 'no contributor'}</h3>
            <p className="stepName">{recipe && recipe.length > 0 ? recSteps(recipe[0].steps) : 'not working'}</p>

            {/* render reviews carousel */}
            <LinkPreview className="link" link={link} name={recipe && recipe.length > 0 ? changeTitle(recipe[0].name.trim()) : ''} img={linkData.images !== undefined ? linkData.images[0] : "https://geniuskitchen.sndimg.com/fdc-new/img/FDC-Logo.png"} />
            {reviews && reviews.length > 0 && <><p className="reviews">Reviews</p>
              <Carousel sx={{ marginBottom: '5%' }} autoPlay={false}>
                {reviews ? reviews.map((item, i) => <Item key={i} item={item} />) : 'no reviews'}
              </Carousel></>}

            {/* render prices table */}
            {priceData && priceData.length > 0 && <>
              <p className="prices">Prices</p>
              <TableContainer sx={{ width: 1 }}>
                <Table sx={{ width: 0.7, marginLeft: '15%', marginRight: '15', marginBottom: '5%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell key='Ingredient'><b>Ingredient</b></TableCell>
                      <TableCell key='Country'><b>Country</b></TableCell>
                      <TableCell key='Price'><b>Price</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceData && priceData.length > 0 &&
                      priceData.map(row =>
                        <TableRow sx={{ fontFamily: 'Helvetica Neue', fontSize: '18px' }} key={row.Ingredient_id}>
                          <TableCell sx={{ fontFamily: 'Helvetica Neue', fontSize: '15px' }} key='Ingredient'>{row.Ingredient_name}</TableCell>
                          <TableCell key='Country'>{row.country} - USD</TableCell>
                          <TableCell key='Price'>{row.price && row.unit ? `${row.price} USD / ${row.unit}` : `0.50 USD /g`}</TableCell>
                        </TableRow>)
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </>}
          </Stack>
        </Stack>)
      }
    </Container>
  );
}

// returns one slide of carousel, which represents a single review for given recipe
function Item(props) {
  return (
    <Paper>
      <Stack direction="row">
        <Rating size="large" name="read-only" value={props.item.rating} precision={0.5} readOnly />
        <p className='userId'>[User {props.item.user_id}]</p>
      </Stack>
      <p className="reviewText">{props.item.description}</p>
    </Paper>
  )
}