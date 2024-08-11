
import { useState } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';

const RecipeSuggestion = ({ inventory }) => {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  const fetchRecipeSuggestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/getRecipeSuggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventoryItems: inventory.map(item => item.name) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      



      const data = await response.json();
      setRecipes(data.suggestions || []);
    } catch (error) {
      setError('Failed to fetch recipe suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={fetchRecipeSuggestion} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Recipe Suggestions'}
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {recipes.length > 0 && (
        <Stack spacing={2} marginTop={2}>
          {recipes.map((recipe, index) => (
            <Typography key={index}>{recipe}</Typography>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RecipeSuggestion;
