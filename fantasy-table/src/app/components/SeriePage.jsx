'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import FantasyTable from './FantasyTable';
import { players } from '../data/players';

export default function SeriePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ošetření trailing slashe
        const rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const API_BASE = rawApiBase.replace(/\/$/, '');

        const response = await axios.get(`${API_BASE}/api/serie-a/`, {
          signal: controller.signal,
        });

        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error('Chyba při stahování Serie A:', err.response?.data || err.message);

        if (isMounted) {
          setError(
            err.response?.data?.error ||
            err.message ||
            'Nepodařilo se načíst data Serie A'
          );
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const normalizedRows = useMemo(() => {
    // API vrací buď pole přímo, nebo objekt { data: [...] }
    const rawRows = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    return rawRows.map((item, index) => {
      const managerName = item.manager_name || item.manager || 'Neznámý';
      const teamName = item.team_name || item.teamName || item.name || 'Bez názvu';
      const points = item.total_points ?? item.totalPoints ?? item.points ?? 0;

      const player = players?.find(
        (p) =>
          p.sourceB === (item.team_id || item.teamId || item.id) ||
          p.name?.toLowerCase() === managerName.toLowerCase()
      );

      return {
        key: (item.team_id || item.id || item.rank) ?? index,
        rank: item.rank,
        playerName: player ? player.name : managerName,
        teamName: teamName,
        gwPoints: item.gameweek_points ?? item.gwPoints ?? 0,
        totalPoints: points,
      };
    });
  }, [data]);

  return (
    <FantasyTable
      title="Serie A Fantasy results"
      rows={normalizedRows}
      loading={loading}
      error={error}
    />
  );
}