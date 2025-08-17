import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapViewer from './pages/MapViewer';
import DataCatalog from './pages/DataCatalog';
import SpatialAnalysis from './pages/SpatialAnalysis';
import Reports from './pages/Reports';
import DiagnosticoCamadas from './DiagnosticoCamadas';

import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mapviewer" element={<MapViewer />} />
          <Route path="/datacatalog" element={<DataCatalog />} />
          <Route path="/analysis" element={<SpatialAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/diagnostico" element={<DiagnosticoCamadas />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;