'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

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
        if (p.id === BONUS_PLAYER_ID) seriePoints += BONUS_POINTS;

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner message="Loading Data..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

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
