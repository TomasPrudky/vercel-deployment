'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const players = [
    { id: 1, sourceA: 70147727, sourceB: 43454, name: "Pavel Scheiner"},
    { id: 2, sourceA: 63841682, sourceB: -1, name: "Marek Štencl"},
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
        const [serieRes, fplRes] = await Promise.all([
          axios.get('https://fantasy-table-server.vercel.app/api/serie-a/'),
          axios.get('https://fantasy-table-server.vercel.app/api/fpl')
        ]);

        // Spočítat celkové body a vytvořit nové pole
        const combined = players.map(p => {
          const seriePlayer = serieRes.data?.data.find(item => item.id === p.sourceB);
          const fplPlayer = fplRes.data?.standings?.results.find(item => item.id === p.sourceA);

          const totalPoints = (seriePlayer?.points || 0) + (fplPlayer?.total || 0);
          return { ...p, totalPoints };
        });

        // Seřadit podle celkových bodů sestupně
        combined.sort((a, b) => b.totalPoints - a.totalPoints);

        setPlayersData(combined);

      } catch (err) {
        console.error(err);
        setError('Chyba při načítání dat');
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
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Overall points</th>
          </tr>
        </thead>
        <tbody>
          {playersData.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
