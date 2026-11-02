import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import PassportPage from './pages/PassportPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/passport" element={<PassportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
