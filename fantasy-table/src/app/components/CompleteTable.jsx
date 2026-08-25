'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDominance, setShowDominance] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  
  const [simulatedPoints, setSimulatedPoints] = useState({});

  const players = [
    { id: 1, sourceA: 4329613, sourceB: 725, name: "Pavel Scheiner" },
    { id: 2, sourceA: 4589170, sourceB: 1019, name: "Lukáš Budiš" },
    { id: 3, sourceA: 6411289, sourceB: 1132, name: "Tomáš Bělehrádek" },
    { id: 4, sourceA: 1884869, sourceB: 969, name: "Vojtěch Cichra" },
    { id: 5, sourceA: 48521, sourceB: 236, name: "Tomáš Prudký" },
    { id: 6, sourceA: 3659748, sourceB: 1177, name: "Zdenek Stanek" },
    { id: 7, sourceA: 1881097, sourceB: 288, name: "Jakub Odehnal" },
    { id: 8, sourceA: 1882099, sourceB: 927, name: "Stanislav Dvořáček" },
    { id: 9, sourceA: 730983, sourceB: 219, name: "Jan Prochazka" }
  ];

  useEffect(() => {
    const fetchData = async () => {      
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fantasy-table-server.vercel.app';
        const [serieRes, fplRes] = await Promise.all([
          axios.get(`${API_BASE}/api/serie-a/`),
          axios.get(`${API_BASE}/api/fpl/`)
        ]);

        const serieList = Array.isArray(serieRes.data) ? serieRes.data : [];
        const fplList = fplRes.data?.standings?.results || [];

        const combined = players.map(p => {
          const seriePlayer = serieList.find(item => (item.teamId || item.id) === p.sourceB);
          const fplPlayer = fplList.find(item => item.entry === p.sourceA);

          let seriePoints = seriePlayer?.totalPoints ?? seriePlayer?.points ?? 0;
          if (p.id === 2) seriePoints += 54; // bonus pro Stenclika

          const fplPoints = fplPlayer?.total || 0;
          const totalPoints = seriePoints + fplPoints;

          return {
            ...p,
            seriePoints,
            fplPoints,
            totalPoints,
            baseRank: 0
          };
        });

        combined.sort((a, b) => b.totalPoints - a.totalPoints);
        combined.forEach((item, idx) => {
          item.baseRank = idx + 1;
        });

        setPlayersData(combined);
      } catch (err) {
        console.error('Chyba při načítání dat:', err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSimChange = (playerId, type, value) => {
    const val = parseInt(value, 10) || 0;
    setSimulatedPoints(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { fpl: 0, serie: 0 }),
        [type]: val
      }
    }));
  };

  const resetSimulator = () => {
    setSimulatedPoints({});
  };

  if (loading) return <div className="table-container">Loading Data...</div>;
  if (error) return <div className="table-container">{error}</div>;

  // Přepočet tabulky
  const processedData = playersData.map(p => {
    const sim = simulatedPoints[p.id] || { fpl: 0, serie: 0 };
    const currentFpl = p.fplPoints + sim.fpl;
    const currentSerie = p.seriePoints + sim.serie;
    const currentTotal = currentFpl + currentSerie;
    const totalSimAdded = sim.fpl + sim.serie;

    const fplShare = currentTotal > 0 ? Math.round((currentFpl / currentTotal) * 100) : 50;
    const serieShare = 100 - fplShare;

    return {
      ...p,
      displayFpl: currentFpl,
      displaySerie: currentSerie,
      displayTotal: currentTotal,
      fplShare,
      serieShare,
      simAdded: totalSimAdded
    };
  });

  processedData.sort((a, b) => b.displayTotal - a.displayTotal);

  // Globální součty za celou ligu
  const totalLeagueFpl = processedData.reduce((sum, p) => sum + p.displayFpl, 0);
  const totalLeagueSerie = processedData.reduce((sum, p) => sum + p.displaySerie, 0);
  const totalLeaguePoints = totalLeagueFpl + totalLeagueSerie;

  const totalFplPct = totalLeaguePoints > 0 ? Math.round((totalLeagueFpl / totalLeaguePoints) * 100) : 50;
  const totalSeriePct = 100 - totalFplPct;

  // Hráč nejvíce závislý na FPL vs. Serie A
  const topFplSpecialist = [...processedData].sort((a, b) => b.fplShare - a.fplShare)[0];
  const topSerieSpecialist = [...processedData].sort((a, b) => b.serieShare - a.serieShare)[0];

  return (
    <div className="table-container" suppressHydrationWarning>
      <h1>Complete Fantasy Table 25/26</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <label className="controls-label">
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
          />{" "}
          Show advanced stats
        </label>

        <label className="controls-label">
          <input
            type="checkbox"
            checked={showDominance}
            onChange={(e) => setShowDominance(e.target.checked)}
          />{" "}
          📊 League Points Split
        </label>

        <label className="controls-label">
          <input
            type="checkbox"
            checked={showSimulator}
            onChange={(e) => setShowSimulator(e.target.checked)}
          />{" "}
          🧮 What If? (Simulator)
        </label>
      </div>

      {/* Globální souhrn dominance lig */}
      {showDominance && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
              Celkový poměr bodů v lize:
            </span>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>PL: {totalLeagueFpl.toLocaleString()} b. ({totalFplPct}%)</span>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Serie A: {totalLeagueSerie.toLocaleString()} b. ({totalSeriePct}%)</span>
            </div>
          </div>

          {/* Celkový progress bar */}
          <div style={{
            display: 'flex',
            height: '10px',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#e2e8f0',
            width: '100%',
            marginBottom: '12px'
          }}>
            <div style={{ width: `${totalFplPct}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
            <div style={{ width: `${totalSeriePct}%`, backgroundColor: '#10b981', transition: 'width 0.3s' }} />
          </div>

          {/* Zajímavost / Specialisté */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}/>
        </div>
      )}

      {/* Kalkulačka / Simulátor */}
      {showSimulator && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Simulovat body příštího kola:</h3>
            <button
              onClick={resetSimulator}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              Resetovat
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {players.map(p => (
              <div key={p.id} style={{ background: '#fff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="+ FPL"
                    value={simulatedPoints[p.id]?.fpl || ''}
                    onChange={(e) => handleSimChange(p.id, 'fpl', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="number"
                    placeholder="+ Serie A"
                    value={simulatedPoints[p.id]?.serie || ''}
                    onChange={(e) => handleSimChange(p.id, 'serie', e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabulka */}
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Total Points</th>
              {showDominance && <th>FPL / Serie A Dominance</th>}
              {showAdvanced && <th>Diff to 1st</th>}
              {showAdvanced && <th>Diff to Previous</th>}
              {showAdvanced && <th>Diff to Next</th>}
            </tr>
          </thead>
          <tbody>
            {processedData.map((p, index) => {
              const leaderPoints = processedData[0]?.displayTotal ?? 0;
              const prevPoints = processedData[index - 1]?.displayTotal ?? null;
              const nextPoints = processedData[index + 1]?.displayTotal ?? null;

              let rankLabel = index + 1;
              if (index === 0) rankLabel = "🥇";
              else if (index === 1) rankLabel = "🥈";
              else if (index === 2) rankLabel = "🥉";
              else if (index === processedData.length - 1) rankLabel = "💩";

              const currentRank = index + 1;
              const rankDiff = p.baseRank - currentRank;

              return (
                <tr key={p.id}>
                  <td>
                    {rankLabel}
                    {showSimulator && rankDiff !== 0 && (
                      <span style={{
                        fontSize: '0.7rem',
                        marginLeft: '4px',
                        color: rankDiff > 0 ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        {rankDiff > 0 ? `▲${rankDiff}` : `▼${Math.abs(rankDiff)}`}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.name}
                    {p.simAdded > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', marginLeft: '6px' }}>
                        (+{p.simAdded})
                      </span>
                    )}
                  </td>
                  <td>{p.displayTotal}</td>

                  {showDominance && (
                    <td style={{ minWidth: '130px', verticalAlign: 'middle' }}>
                      <div 
                        title={`FPL: ${p.displayFpl} b. (${p.fplShare}%) | Serie A: ${p.displaySerie} b. (${p.serieShare}%)`}
                        style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
                      >
                        <div style={{
                          display: 'flex',
                          height: '7px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#e2e8f0',
                          width: '100%'
                        }}>
                          <div style={{ width: `${p.fplShare}%`, backgroundColor: '#3b82f6' }} />
                          <div style={{ width: `${p.serieShare}%`, backgroundColor: '#10b981' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{p.fplShare}%</span>
                          <span style={{ color: '#059669', fontWeight: 600 }}>{p.serieShare}%</span>
                        </div>
                      </div>
                    </td>
                  )}

                  {showAdvanced && (
                    <td>{leaderPoints - p.displayTotal}</td>
                  )}
                  {showAdvanced && (
                    <td>{prevPoints !== null ? `${prevPoints - p.displayTotal}` : "-"}</td>                        
                  )}
                  {showAdvanced && (
                    <td>{nextPoints !== null ? `+${p.displayTotal - nextPoints}` : "-"}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}