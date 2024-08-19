'use client';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SeriePage from '../app/components/SeriePage'; // Importuj komponentu Serie
import FplPage from '../app/components/FplPage';     // Importuj komponentu Fpl
import CompleteTable from './components/CompleteTable';

export default function Home() {
  return (
    <div>
     <CompleteTable />
     <FplPage />
     <SeriePage />
    </div>
  );
}
