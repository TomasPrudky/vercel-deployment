'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);


  const players = [
    { id: 1, sourceA: 4329613, sourceB: 725, name: "Pavel Scheiner" },
    { id: 2, sourceA: 4589170, sourceB: 1019, name: "Lukáš Budiš" },
    { id: 3, sourceA: 6411289, sourceB: 1132, name: "Tomáš Bělehrádek" },
    { id: 4, sourceA: 1884869, sourceB: 969, name: "Vojtěch Cichra" },
    { id: 5, sourceA: 48521, sourceB: 236, name: "Tomáš Prudký" },
    { id: 6, sourceA: 3659748, sourceB: 1177, name: "Zdenek Stanek" },
    { id: 7, sourceA: 1881097, sourceB: 288, name: "Jakub Odehnal" },
    { id: 8, sourceA: 1882099, sourceB: 927, name: "Stanislav Dvořáček" },
    { id: 9, sourceA: 730983, sourceB: 219, name: "Jan Prochazka" }
  ];

  useEffect(() => {
    const fetchData = async () => {      
      try {
        const [serieRes, fplRes] = await Promise.all([
          //axios.get('https://fantasy-table-server.vercel.app/api/serie-a/'),
          //axios.get('https://fantasy-table-server.vercel.app/api/fpl/')
          axios.get('http://localhost:5000/api/serie-a/'),
          axios.get('http://localhost:5000/api/fpl')
        ]);

        const serieList = Array.isArray(serieRes.data) ? serieRes.data : [];
        const fplList = fplRes.data?.standings?.results || [];

        const combined = players.map(p => {
          const seriePlayer = serieList.find(item => (item.teamId || item.id) === p.sourceB);
          const fplPlayer = fplList.find(item => item.entry === p.sourceA);

          let seriePoints = seriePlayer?.totalPoints ?? seriePlayer?.points ?? 0;

          const totalPoints = seriePoints + (fplPlayer?.total || 0);

          return { ...p, totalPoints };
        });

        combined.sort((a, b) => b.totalPoints - a.totalPoints);

        setPlayersData(combined);
      } catch (err) {
        console.error(err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading Data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div suppressHydrationWarning>
      <h1>Complete Fantasy Table 25/26</h1>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        <input
          type="checkbox"
          checked={showAdvanced}
          onChange={(e) => setShowAdvanced(e.target.checked)}
        />{" "}
        Show advanced stats
      </label>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Total Points</th>
            {showAdvanced && <th>Diff to 1st</th>}
            {showAdvanced && <th>Diff to Next</th>}
            {showAdvanced && <th>Diff to Previous</th>}
          </tr>
        </thead>
        <tbody>
          {playersData.map((p, index) => {
            const leaderPoints = playersData[0]?.totalPoints ?? 0;
            const prevPoints = playersData[index - 1]?.totalPoints ?? null;
            const nextPoints = playersData[index + 1]?.totalPoints ?? null;

            let rankLabel = index + 1;
            if (index === 0) rankLabel = "🥇";
            else if (index === 1) rankLabel = "🥈";
            else if (index === 2) rankLabel = "🥉";
            else if (index === playersData.length - 1) rankLabel = "⚰️";

            return (
              <tr key={p.id}>
                <td>{rankLabel}</td>
                <td>{p.name}</td>
                <td>{p.totalPoints}</td>
                {showAdvanced && (
                  <td>{leaderPoints - p.totalPoints}</td>
                )}
                {showAdvanced && (
                  <td>{prevPoints !== null ? `${prevPoints - p.totalPoints}` : "-"}</td>                        
                )}
                {showAdvanced && (
                  <td>{nextPoints !== null ? `+${p.totalPoints - nextPoints}` : "-"}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}