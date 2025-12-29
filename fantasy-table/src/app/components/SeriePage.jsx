import React, { useState } from 'react';
import Serie from './Serie';
import LeaderboardTable from './LeaderboardTable';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = (fetchedData) => {
    if (fetchedData.error) setError(fetchedData.error);
    else setData(fetchedData);
  };

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
    <div>
      <Serie onDataFetched={handleDataFetched} />
      <LeaderboardTable
        title="Serie A Fantasy results"
        data={processedData}
        loading={!data && !error}
        error={error}
        columns={columns}
        pointsKey="points"
        loadingMessage="Loading Serie A Data..."
      />
    </div>
  );
};

export default SeriePage;
