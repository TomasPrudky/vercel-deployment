const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

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

// Endpoint pro Serie A (Tattico) – vrací pouze pole řádků tabulky
app.get('/api/serie-a/', async (req, res) => {
  try {
    const response = await axios.get('https://tattico.com/leagues/o-pohar-krale-vojtecha-i');
    const $ = cheerio.load(response.data);
    console.log($);
    const tableData = [];

    $('table tbody tr').each((index, element) => {
      const cols = $(element).find('td');
      if (cols.length >= 8) {
        const teamAnchor = $(cols[1]).find('a');
        const teamName = teamAnchor.text().trim();
        const teamHref = teamAnchor.attr('href') || '';

        // Vytáhne ID týmu z URL tvaru /points/{teamId}/{gameweek}
        const matchId = teamHref.match(/\/points\/(\d+)/);
        const teamId = matchId ? parseInt(matchId[1], 10) : null;

        // Vytáhne zemi manažera (title v spanu) a čisté jméno manažera
        const country = $(cols[2]).find('span[title]').attr('title') || '';
        const managerName = $(cols[2]).find('span > span:last-child').text().trim() || $(cols[2]).text().trim();

        tableData.push({
          rank: parseInt($(cols[0]).text().trim(), 10) || index + 1,
          teamId,
          teamName,
          manager: managerName,
          country,
          chip: $(cols[3]).find('img').attr('title') || null,
          played: $(cols[4]).text().trim(),
          captain: $(cols[5]).text().trim(),
          gwPoints: parseInt($(cols[6]).text().trim(), 10) || 0,
          totalPoints: parseInt($(cols[7]).text().trim(), 10) || 0,
          teamUrl: teamHref ? `https://tattico.com${teamHref}` : null,
        });

        console.log(`Parsed row ${index + 1}:`, tableData[tableData.length - 1]); // Loguje každý řádek pro kontrolu
      }
    });

    // Vrátí pouze samotné pole
    res.json(tableData);

  } catch (error) {
    console.error('Error fetching Serie A data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});