'use client';

import React, { useState, useCallback } from 'react';
import Serie from './Serie';
import FantasyTable from './FantasyTable';
import { players } from '../data/players';

export default function SeriePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = useCallback((res) => {
    if (res?.error) setError(res.error);
    else setData(res);
  }, []);

  const rawRows = Array.isArray(data) ? data : [];
  const normalizedRows = rawRows.map(item => {
    const player = players.find(p => p.sourceB === (item.teamId || item.id));
    let points = item.totalPoints ?? item.points ?? 0;
    if (player?.id === 2) points += 54; // bonus pro Stenclika

    return {
      key: item.teamId || item.id,
      playerName: player ? player.name : (item.manager || "Unknown"),
      teamName: item.teamName || item.name,
      totalPoints: points,
    };
  });

  return (
    <FantasyTable
      title="Serie A Fantasy results"
      rows={normalizedRows}
      loading={!data && !error}
      error={error}
      LoaderComponent={<Serie onDataFetched={handleDataFetched} />}
    />
  );
}