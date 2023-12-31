import { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';


const config = require('../config.json');

//page displaying all recipes created by some contributor id
export default function ContributorPage() {
    const { contributor_id } = useParams();
    const [contributorFoods, setContributorFoods] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/top_recipes/${contributor_id}`)
            .then(res => res.json())
            .then(resJson => { setContributorFoods(resJson); console.log(contributor_id) });
    }, [contributor_id]);

    return (
        <Container>
            <Box mx="auto">
                <ol>
                    {contributorFoods ? (
                        contributorFoods.map((recipe) => (
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
                    )}
                </ol>
            </Box>
        </Container>
    );
}