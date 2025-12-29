'use client';

import React from 'react';
import LeaderboardTable from './LeaderboardTable';
import useApiData from '../hooks/useApiData';

const FplPage = () => {
  const { data, loading, error, refetch, lastUpdated } = useApiData('/api/fpl/', {
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  const columns = [
    { key: 'player_name', header: 'Player Name' },
    { key: 'entry_name', header: 'Team Name' }
  ];

  const processedData = data?.standings?.results?.map(row => ({
    ...row,
    points: row.total
  })) || [];

  return (
    <LeaderboardTable
      title="PL Fantasy results"
      data={processedData}
      loading={loading}
      error={error}
      columns={columns}
      pointsKey="points"
      loadingMessage="Loading FPL Data..."
      onRetry={refetch}
      lastUpdated={lastUpdated}
    />
  );
};

export default FplPage;
