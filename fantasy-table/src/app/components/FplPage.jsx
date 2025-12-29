import React, { useState } from 'react';
import Fpl from './Fpl';
import LeaderboardTable from './LeaderboardTable';

const FplPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = (fetchedData) => {
    if (fetchedData.error) setError(fetchedData.error);
    else setData(fetchedData);
  };

  const columns = [
    { key: 'player_name', header: 'Player Name' },
    { key: 'entry_name', header: 'Team Name' }
  ];

  const processedData = data?.standings?.results?.map(row => ({
    ...row,
    points: row.total
  })) || [];

  return (
    <div>
      <Fpl onDataFetched={handleDataFetched} />
      <LeaderboardTable
        title="PL Fantasy results"
        data={processedData}
        loading={!data && !error}
        error={error}
        columns={columns}
        pointsKey="points"
        loadingMessage="Loading FPL Data..."
      />
    </div>
  );
};

export default FplPage;
