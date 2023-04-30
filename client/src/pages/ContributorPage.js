import { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack'


const config = require('../config.json');

export default function ContributorPage() {
    const { contributor_id } = useParams();
    const [contributorFoods, setContributorFoods] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/top_recipes/${contributor_id}`)
            .then(res => res.json())
            .then(resJson => { setContributorFoods(resJson); console.log(contributor_id) });
    }, [contributor_id]);
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
    // console.log(contributorFoods)
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