'use client';

import React, { useState, useCallback } from 'react';
import Fpl from './Fpl';
import FantasyTable from './FantasyTable';
import { players } from '../data/players';

export default function FplPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = useCallback((res) => {
    if (res?.error) setError(res.error);
    else setData(res);
  }, []);

  const rawRows = data?.standings?.results || [];
  const normalizedRows = rawRows.map(item => {
    const player = players.find(p => p.sourceA === item.entry);
    return {
      key: item.entry || item.id,
      playerName: player ? player.name : item.player_name,
      teamName: item.entry_name,
      totalPoints: item.total || 0,
    };
  });

  return (
    <FantasyTable
      title="PL Fantasy results"
      rows={normalizedRows}
      loading={!data && !error}
      error={error}
      LoaderComponent={<Fpl onDataFetched={handleDataFetched} />}
    />
  );
}