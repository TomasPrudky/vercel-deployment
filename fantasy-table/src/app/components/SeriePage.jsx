'use client';

import React from 'react';
import LeaderboardTable from './LeaderboardTable';
import useApiData from '../hooks/useApiData';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';

const SeriePage = () => {
  const { data, loading, error, refetch } = useApiData('/api/serie-a/');

  const columns = [
    { key: 'playerName', header: 'Player Name' },
    { key: 'teamName', header: 'Team Name' }
  ];

  const processedData = data?.data?.map(item => {
    const player = players.find(p => p.sourceB === item.id);
    let points = item.points;
    if (player?.id === BONUS_PLAYER_ID) points += BONUS_POINTS;

    return {
      ...item,
      playerName: player ? player.name : "Unknown",
      teamName: item.name,
      points
    };
  }) || [];

  return (
    <LeaderboardTable
      title="Serie A Fantasy results"
      data={processedData}
      loading={loading}
      error={error}
      columns={columns}
      pointsKey="points"
      loadingMessage="Loading Serie A Data..."
      onRetry={refetch}
    />
  );
};

export default SeriePage;
