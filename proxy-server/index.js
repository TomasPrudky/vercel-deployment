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
app.get('/api/serie-a/v2/', async (req, res) => {
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

app.get('/api/serie-a/', async (req, res) => {
  try {
    const response = await axios.get('https://tattico.com/leagues/o-pohar-krale-vojtecha-i', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const tableData = [];

    $('table tbody tr').each((index, element) => {
      const cols = $(element).find('td');

      if (cols.length >= 6) {
        const rankText = $(cols[0]).text().trim();

        // 1. Tým a ID
        const teamAnchor = $(cols[1]).find('a');
        const teamName = teamAnchor.attr('title') || teamAnchor.text().trim();
        const teamHref = teamAnchor.attr('href') || '';
        const matchId = teamHref.match(/\/points\/(\d+)/);
        const teamId = matchId ? parseInt(matchId[1], 10) : null;

        // 2. Manažer a Země
        const country = $(cols[2]).find('span[title]').attr('title') || '';
        const managerName = $(cols[2]).find('span > span:last-child').text().trim() || $(cols[2]).text().trim();

        // 3. Aktivní Chip (pokud byl použit v GW)
        let activeChip = null;
        $(cols[3]).find('span[title]').each((_, chipSpan) => {
          const title = $(chipSpan).attr('title') || '';
          if (title.includes('Used in')) {
            activeChip = title;
          }
        });

        // 4. a 5. Body
        const gwPoints = parseInt($(cols[4]).text().trim(), 10) || 0;
        const totalPoints = parseInt($(cols[5]).text().trim(), 10) || 0;

        tableData.push({
          rank: parseInt(rankText, 10) || index + 1,
          teamId,
          teamName,
          manager: managerName,
          country,
          chip: activeChip,
          gwPoints,
          totalPoints,
          teamUrl: teamHref ? (teamHref.startsWith('http') ? teamHref : `https://tattico.com${teamHref}`) : null,
        });
      }
    });

    console.log(`Úspěšně naparsováno ${tableData.length} týmů.`);
    res.json(tableData);

  } catch (error) {
    console.error('Chyba při stahování:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/serie-a/v3', async (req, res) => {
  try {
    const response = await axios.get('https://tattico.com/leagues/o-pohar-krale-vojtecha-i', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const tableData = [];

    $('table tbody tr').each((index, element) => {
      const cols = $(element).find('td');
      console.log('Row HTML:', $(element).html()); // Loguje HTML každého řádku pro kontrolu
      // Máme alespoň 7 nebo 8 sloupců
      if (cols.length >= 7) {
        const rankText = $(cols[0]).text().trim();
        
        // 1. Sloupec: Tým a Odkaz
        const teamAnchor = $(cols[1]).find('a');
        const teamName = (teamAnchor.text() || $(cols[1]).text()).trim();
        const teamHref = teamAnchor.attr('href') || '';
        
        // Vytáhne teamId z /points/1177/...
        const matchId = teamHref.match(/\/points\/(\d+)/);
        const teamId = matchId ? parseInt(matchId[1], 10) : null;

        // 2. Sloupec: Manažer a Země
        const country = $(cols[2]).find('span[title]').attr('title') || '';
        const managerName = $(cols[2]).text().trim();

        // 3. Sloupec: Chip
        const chip = $(cols[3]).find('img').attr('title') || null;

        // 4. Sloupec: Played
        const played = $(cols[4]).text().trim();

        // 5. Sloupec: Captain
        const captain = $(cols[5]).text().trim();

        // Poslední dva sloupce: GW body a Total body
        // Bereme je od konce (cols.length - 2 a cols.length - 1), což je nejbezpečnější
        const gwPointsRaw = $(cols[cols.length - 2]).text().trim();
        const totalPointsRaw = $(cols[cols.length - 1]).text().trim();

        tableData.push({
          rank: parseInt(rankText, 10) || index + 1,
          teamId,
          teamName,
          manager: managerName,
          country,
          chip,
          played,
          captain,
          gwPoints: parseInt(gwPointsRaw, 10) || 0,
          totalPoints: parseInt(totalPointsRaw, 10) || 0,
          teamUrl: teamHref ? `https://tattico.com${teamHref}` : null,
        });
      }
    });

    console.log(`Úspěšně naparsováno ${tableData.length} týmů.`);
    res.json(tableData);

  } catch (error) {
    console.error('Chyba při stahování:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});