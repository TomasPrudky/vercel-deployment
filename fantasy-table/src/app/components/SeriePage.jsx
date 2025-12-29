'use client';

import React from 'react';
import LeaderboardTable from './LeaderboardTable';
import useApiData from '../hooks/useApiData';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';

const SeriePage = () => {
  const { data, loading, error, refetch, lastUpdated } = useApiData('/api/serie-a/', {
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  const columns = [
    { key: 'playerName', header: 'Player Name', shortHeader: 'Player' },
    { key: 'teamName', header: 'Team Name', shortHeader: 'Team' }
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
      lastUpdated={lastUpdated}
    />
  );
};

export default SeriePage;
