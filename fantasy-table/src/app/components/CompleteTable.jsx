'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);


  const players = [
    { id: 1, sourceA: 70147727, sourceB: 43454, name: "Pavel Scheiner"},
    { id: 2, sourceA: 63841682, sourceB: 44933, name: "Marek Štencl"},
    { id: 3, sourceA: 69567445, sourceB: 44098, name: "Tomáš Bělehrádek" },
    { id: 4, sourceA: 68621775, sourceB: 42945, name: "Vojtěch Cichra"},
    { id: 5, sourceA: 62787347, sourceB: 41986, name: "Tomáš Prudký" },
    { id: 6, sourceA: 63159074, sourceB: 44460, name: "Zdenek Stanek"},
    { id: 7, sourceA: 58126350, sourceB: 42330, name: "Jakub Odehnal" },
    { id: 8, sourceA: 71989614, sourceB: 43160, name: "Stanislav Dvořáček" },
    { id: 9, sourceA: 61755492, sourceB: 42290, name: "Jan Prochazka" }
  ];

  useEffect(() => {
    const fetchData = async () => {      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const [serieRes, fplRes] = await Promise.all([
          axios.get(`${apiUrl}/api/serie-a/`),
          axios.get(`${apiUrl}/api/fpl/`)
        ]);

        const combined = players.map(p => {
          const seriePlayer = serieRes.data?.data.find(item => item.id === p.sourceB);
          const fplPlayer = fplRes.data?.standings?.results.find(item => item.id === p.sourceA);

          let seriePoints = seriePlayer?.points || 0;
          if (p.id === 2) seriePoints += 54; // bonus pro Stenclika

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
    <div>
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
            const leaderPoints = playersData[0].totalPoints;
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
