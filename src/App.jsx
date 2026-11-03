import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import PassportPage from './pages/PassportPage';
import DemoPage from './pages/DemoPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/passport" element={<PassportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
