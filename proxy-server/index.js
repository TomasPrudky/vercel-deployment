const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Endpoint pro FPL
app.get('/api/fpl/', async (req, res) => {
  try {
    const response = await axios.get('https://fantasy.premierleague.com/api/leagues-classic/11825/standings?page_standings=1', {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Endpoint pro Serie A (Tattico League Standings API)
app.get('/api/serie-a/', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 50;
    // Použije slug z env proměnné nebo výchozí slug z původního Cheerio skriptu
    const leagueSlug = process.env.NEXT_PUBLIC_TATTICO_LEAGUE_SLUG || 'o-pohar-krale-vojtecha-i';

    const response = await axios.get(
      `https://tattico.com/api/v1/leagues/${leagueSlug}/standings`,
      {
        params: {
          page: page,
          per_page: perPage,
        },
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TATTICO_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Error fetching Serie A data:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      error: 'Failed to fetch Serie A data',
      details: error.response?.data || null 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});