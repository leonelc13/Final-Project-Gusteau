import { useEffect, useState } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Box } from '@mui/material';
import Paper from '@mui/material/Paper';
const config = require('../config.json');

export default function RecipeStatPage() {
  const [worstRecipes, setWorstRecipes] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  const [worstPage, setWorstPage] = useState(1);
  const [topPage, setTopPage] = useState(1);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/worst_recipes?page=${worstPage}`)
      .then(res => res.json())
      .then(resJson => { setWorstRecipes(resJson) });

    fetch(`http://${config.server_host}:${config.server_port}/top_recipes?page=${topPage}`)
      .then(res => res.json())
      .then(resJson => { setTopRecipes(resJson) });
  }, [worstPage, topPage]);

  // Define table header cells
  const headerCells = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name' },
    { id: 'rating', label: 'Rating' },
  ];

  // functions for handling pagination button clicks
  const handleWorstPrevClick = () => {
    setWorstPage(prevPage => prevPage - 1);
  };

  const handleWorstNextClick = () => {
    setWorstPage(prevPage => prevPage + 1);
  };

  const handleTopPrevClick = () => {
    setTopPage(prevPage => prevPage - 1);
  };

  const handleTopNextClick = () => {
    setTopPage(prevPage => prevPage + 1);
  };

  return (
    <Box sx={{ mx: '10vw', marginTop: '2rem', marginBottom: '2rem' }}>
      <Stack direction="row" spacing={10}>
        <TableContainer component={Paper} style={{ fontFamily: 'Helvetica Neue' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Top Recipes</h1>
          <Table sx={{ minWidth: 650 }} size="large">
            <TableHead>
              <TableRow>
                {headerCells.map((cell) => (
                  <TableCell key={cell.id}>{cell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {topRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <a href={`/recipe/${recipe.id}`}>{recipe.id}</a>
                  </TableCell>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.avg_rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls for top recipes */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}
          >
            <Button onClick={handleTopPrevClick} disabled={topPage === 1} variant="contained" sx={{ ml: '8px' }}>Previous</Button>
            <Button onClick={handleTopNextClick} variant="contained" sx={{ mr: '8px' }}>Next</Button>
          </div>
        </TableContainer>

        <TableContainer component={Paper} style={{ fontFamily: 'Helvetica Neue' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Worst Recipes</h1>
          <Table sx={{ minWidth: 650 }} size="large">
            {/* Display top 5 worst recipes */}
            <TableHead>
              <TableRow>
                {headerCells.map((cell) => (
                  <TableCell key={cell.id}>{cell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {worstRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <a href={`/recipe/${recipe.id}`}>{recipe.id}</a>
                  </TableCell>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.avg_rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls for worst recipes */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}
          >
            <Button
              onClick={handleWorstPrevClick}
              disabled={worstPage === 1}
              variant="contained"
              sx={{ ml: '8px' }}>
              Previous
            </Button>
            <Button onClick={handleWorstNextClick} variant="contained" sx={{ mr: '8px' }}>
              Next
            </Button>
          </div>
        </TableContainer>
      </Stack>
    </Box>
  );
}
