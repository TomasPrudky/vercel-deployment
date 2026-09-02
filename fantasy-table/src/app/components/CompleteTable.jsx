'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

// Přesné mapování podle dat, která reálně vrací Serie A API
const PLAYERS = [
  { id: 1, sourceA: 4329613, name: 'Pavel Scheiner', serieTeam: 'Emminini', serieManager: 'Pavel Scheiner' },
  { id: 2, sourceA: 4589170, name: 'Lukáš Budiš', serieTeam: 'Diavola', serieManager: 'Buda14' },
  { id: 3, sourceA: 6411289, name: 'Tomáš Bělehrádek', serieTeam: 'Trust the process 2.0', serieManager: 'Tomáš Bělehrádek' },
  { id: 4, sourceA: 1884869, name: 'Vojtěch Cichra', serieTeam: 'Nejlepšípravejbek', serieManager: 'Vojtěch Cichra' },
  { id: 5, sourceA: 48521, name: 'Tomáš Prudký', serieTeam: 'King Tomio Returns', serieManager: 'Tomas' },
  { id: 6, sourceA: 3659748, name: 'Zdenek Stanek', serieTeam: 'uno doppio', serieManager: 'zdensson' },
  { id: 7, sourceA: 1881097, name: 'Jakub Odehnal', serieTeam: 'La maledizione di Giacomo', serieManager: 'Jakub Odehnal' },
  { id: 8, sourceA: 1882099, name: 'Stanislav Dvořáček', serieTeam: 'Catenaccio Difende il Titolo', serieManager: 'Stana Dvoracek' },
  { id: 9, sourceA: 730983, name: 'Jan Prochazka', serieTeam: 'Celtic pyco', serieManager: 'Jan Prochazka' },
];

const clean = (str) =>
  (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDominance, setShowDominance] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const [simulatedPoints, setSimulatedPoints] = useState({});

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const API_BASE = rawApiBase.replace(/\/$/, '');

        const [serieRes, fplRes] = await Promise.all([
          axios.get(`${API_BASE}/api/serie-a/`, { signal: controller.signal }),
          axios.get(`${API_BASE}/api/fpl/`, { signal: controller.signal }),
        ]);

        // Bezpečné vytažení pole položek ze Serie A
        let serieList = [];
        if (Array.isArray(serieRes.data)) {
          serieList = serieRes.data;
        } else if (Array.isArray(serieRes.data?.data)) {
          serieList = serieRes.data.data;
        } else if (Array.isArray(serieRes.data?.standings)) {
          serieList = serieRes.data.standings;
        }

        const fplList = fplRes.data?.standings?.results || [];

        console.log('Serie A načtená data:', serieList);
        console.log('FPL načtená data:', fplList);

        const combined = PLAYERS.map((p) => {
          const targetManager = clean(p.serieManager);
          const targetTeam = clean(p.serieTeam);
          const targetName = clean(p.name);

          // Párování zkouší shodu na manažera, tým i obecné jméno
          const seriePlayer = serieList.find((item) => {
            const mName = clean(item.manager_name || item.manager);
            const tName = clean(item.team_name || item.teamName || item.name);

            return (
              (targetManager && mName === targetManager) ||
              (targetTeam && tName === targetTeam) ||
              mName === targetName ||
              tName === targetName
            );
          });

          const fplPlayer = fplList.find((item) => item.entry === p.sourceA);

          const seriePoints = Number(
            seriePlayer?.total_points ?? seriePlayer?.totalPoints ?? seriePlayer?.points ?? 0
          );
          const fplPoints = Number(fplPlayer?.total ?? 0);
          const totalPoints = seriePoints + fplPoints;

          return {
            ...p,
            seriePoints,
            fplPoints,
            totalPoints,
            baseRank: 0,
          };
        });

        // Seřazení podle součtu bodů sestupně
        combined.sort((a, b) => b.totalPoints - a.totalPoints);
        combined.forEach((item, idx) => {
          item.baseRank = idx + 1;
        });

        if (isMounted) {
          setPlayersData(combined);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Chyba při stahování ligových dat:', err);
        if (isMounted) {
          setError('Chyba při stahování dat');
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

  const handleSimChange = (playerId, type, value) => {
    const val = parseInt(value, 10) || 0;
    setSimulatedPoints((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { fpl: 0, serie: 0 }),
        [type]: val,
      },
    }));
  };

  const resetSimulator = () => {
    setSimulatedPoints({});
  };

  const {
    processedData,
    totalLeagueFpl,
    totalLeagueSerie,
    totalFplPct,
    totalSeriePct,
    topFplSpecialist,
    topSerieSpecialist,
  } = useMemo(() => {
    const data = playersData.map((p) => {
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
        simAdded: totalSimAdded,
      };
    });

    data.sort((a, b) => b.displayTotal - a.displayTotal);

    const fplSum = data.reduce((sum, p) => sum + p.displayFpl, 0);
    const serieSum = data.reduce((sum, p) => sum + p.displaySerie, 0);
    const totalSum = fplSum + serieSum;

    const fplPct = totalSum > 0 ? Math.round((fplSum / totalSum) * 100) : 50;
    const seriePct = 100 - fplPct;

    const sortedByFpl = [...data].sort((a, b) => b.fplShare - a.fplShare);
    const sortedBySerie = [...data].sort((a, b) => b.serieShare - a.serieShare);

    return {
      processedData: data,
      totalLeagueFpl: fplSum,
      totalLeagueSerie: serieSum,
      totalFplPct: fplPct,
      totalSeriePct: seriePct,
      topFplSpecialist: sortedByFpl[0],
      topSerieSpecialist: sortedBySerie[0],
    };
  }, [playersData, simulatedPoints]);

  if (loading) return <div className="table-container">Načítám data z FPL a Serie A...</div>;
  if (error) return <div className="table-container" style={{ color: '#dc2626' }}>{error}</div>;

  return (
    <div className="table-container" suppressHydrationWarning>
      <h1>Complete Fantasy Table 25/26</h1>

      <a
        href="https://www.livefpl.net/leagues/11825"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginBottom: '16px',
          color: '#2563eb',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '0.9rem',
        }}
      >
        🔗 LiveFPL League
      </a>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <label className="controls-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
          />{' '}
          Show advanced stats
        </label>

        <label className="controls-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showDominance}
            onChange={(e) => setShowDominance(e.target.checked)}
          />{' '}
          📊 League Points Split
        </label>

        <label className="controls-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showSimulator}
            onChange={(e) => setShowSimulator(e.target.checked)}
          />{' '}
          🧮 What If? (Simulator)
        </label>
      </div>

      {showDominance && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
              Celkový poměr bodů v lize:
            </span>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>
                PL: {totalLeagueFpl.toLocaleString()} b. ({totalFplPct}%)
              </span>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>
                Serie A: {totalLeagueSerie.toLocaleString()} b. ({totalSeriePct}%)
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              height: '10px',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#e2e8f0',
              width: '100%',
              marginBottom: '12px',
            }}
          >
            <div style={{ width: `${totalFplPct}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
            <div style={{ width: `${totalSeriePct}%`, backgroundColor: '#10b981', transition: 'width 0.3s' }} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#64748b',
            }}
          >
            {topFplSpecialist && (
              <div>
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 FPL specialista: <strong style={{ color: '#1e293b' }}>{topFplSpecialist.name}</strong> ({topFplSpecialist.fplShare}%)
              </div>
            )}
            {topSerieSpecialist && (
              <div>
                🇮🇹 Serie A specialista: <strong style={{ color: '#1e293b' }}>{topSerieSpecialist.name}</strong> ({topSerieSpecialist.serieShare}%)
              </div>
            )}
          </div>
        </div>
      )}

      {showSimulator && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Simulovat body příštího kola:</h3>
            <button
              onClick={resetSimulator}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Resetovat
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {PLAYERS.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="+ FPL"
                    value={simulatedPoints[p.id]?.fpl || ''}
                    onChange={(e) => handleSimChange(p.id, 'fpl', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="+ Serie A"
                    value={simulatedPoints[p.id]?.serie || ''}
                    onChange={(e) => handleSimChange(p.id, 'serie', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Total Points</th>
              {showDominance && <th>FPL / Serie A Dominance</th>}
              {showAdvanced && <th>Diff to 1st</th>}
              {showAdvanced && <th>Diff to Prev</th>}
              {showAdvanced && <th>Diff to Next</th>}
            </tr>
          </thead>
          <tbody>
            {processedData.map((p, index) => {
              const leaderPoints = processedData[0]?.displayTotal ?? 0;
              const prevPoints = processedData[index - 1]?.displayTotal ?? null;
              const nextPoints = processedData[index + 1]?.displayTotal ?? null;

              let rankLabel = index + 1;
              if (index === 0) rankLabel = '🥇';
              else if (index === 1) rankLabel = '🥈';
              else if (index === 2) rankLabel = '🥉';
              else if (index === processedData.length - 1) rankLabel = '💩';

              const currentRank = index + 1;
              const rankDiff = p.baseRank - currentRank;

              return (
                <tr key={p.id}>
                  <td>
                    {rankLabel}
                    {showSimulator && rankDiff !== 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          marginLeft: '4px',
                          color: rankDiff > 0 ? '#16a34a' : '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
                        {rankDiff > 0 ? `▲${rankDiff}` : `▼${Math.abs(rankDiff)}`}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.name}
                    {p.simAdded > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', marginLeft: '6px', fontWeight: 'bold' }}>
                        (+{p.simAdded})
                      </span>
                    )}
                  </td>

                  <td style={{ fontWeight: '700', fontSize: '1rem' }}>
                    {p.displayTotal}
                  </td>

                  {showDominance && (
                    <td style={{ minWidth: '130px', verticalAlign: 'middle' }}>
                      <div
                        title={`FPL: ${p.displayFpl} b. (${p.fplShare}%) | Serie A: ${p.displaySerie} b. (${p.serieShare}%)`}
                        style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            height: '7px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: '#e2e8f0',
                            width: '100%',
                          }}
                        >
                          <div style={{ width: `${p.fplShare}%`, backgroundColor: '#3b82f6' }} />
                          <div style={{ width: `${p.serieShare}%`, backgroundColor: '#10b981' }} />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.7rem',
                            color: '#64748b',
                          }}
                        >
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
                    <td>{prevPoints !== null ? `${prevPoints - p.displayTotal}` : '-'}</td>
                  )}
                  {showAdvanced && (
                    <td>{nextPoints !== null ? `+${p.displayTotal - nextPoints}` : '-'}</td>
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