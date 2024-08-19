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
      const response = await axios.get('https://fantasy.premierleague.com/api/leagues-classic/490864/standings/', {
        params: req.query, // Předat query parametry
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

// Funkce pro získání autentizačního tokenu
const getAuthToken = async () => {
  const url = 'https://www.serieafantasy.com/api/v0/users/token/';
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  try {
    const response = await axios.post(url, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.access; // Vracení tokenu
  } catch (error) {
    console.error('Error fetching auth token:', error);
    throw error;
  }
};

// Funkce pro získání nového tokenu (pokud je to potřeba)
const getRefreshToken = async (authToken) => {
  const url = 'https://www.serieafantasy.com/api/v0/users/token/refresh/';

  try {
    const response = await axios.post(url, {
      refresh: authToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.access; // Vracení nového tokenu
  } catch (error) {
    console.error('Error fetching refresh token:', error);
    throw error;
  }
};

// Endpoint pro přesměrování požadavků na API Serie A
app.get('/api/serie-a/', async (req, res) => {
  try {
    const authToken = await getAuthToken(); // Získat token
    const response = await axios.get('https://www.serieafantasy.com/api/v0/leagues/private-leagues/9604/', {
      params: req.query, // Předat query parametry
      headers: {
        'Authorization': `Bearer ${authToken}` // Přidat token do headeru
      }
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
