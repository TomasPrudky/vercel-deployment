const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 5000; // Můžeš změnit port podle potřeby
const dotenv = require('dotenv')

dotenv.config();

// Povolit CORS pro všechny domény
app.use(cors());

// Endpoint pro přesměrování požadavků na API Premier League
app.get('/api/fpl/', async (req, res) => {
    try {
      const response = await axios.get('https://fantasy.premierleague.com/api/leagues-classic/1631175/standings/', {
        params: req.query, // Předat query parametry
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

// Endpoint pro přesměrování požadavků na API Serie A
app.get('/api/serie-a/', async (req, res) => {
    try {
      const response = await axios.get('https://worldfantasysoccer.com/api/mini-league/ZYO9xmwm/leaderboard?month=overall&page=1&per_page=200', {
        params: req.query, // Předat query parametry
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

// Spusť server
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
