import React, { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapViewer = () => {
  const [isLayerVisible, setIsLayerVisible] = useState(true);

  // Configuração do mapa centrado em São Paulo
  const mapCenter = [-23.5505, -46.6333];
  const mapZoom = 9;

  // URL do seu GeoServer local
  const geoserverUrl = "http://localhost:8080/geoserver/sp_dashboard/wms";

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1rem',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#2563eb' }}>
          🗺️ WebGIS Municipal - São Paulo
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Visualizador conectado ao GeoServer local
        </p>
      </div>

      {/* Controles da Camada */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '1rem',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Camadas</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isLayerVisible}
            onChange={(e) => setIsLayerVisible(e.target.checked)}
          />
          <span>Municípios de SP</span>
        </label>
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.8rem', 
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '0.5rem'
        }}>
          <p>Workspace: sp_dashboard</p>
          <p>Camada: municipios_sp</p>
          <p>Status: {isLayerVisible ? '✅ Ativa' : '❌ Inativa'}</p>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ height: '100%', paddingTop: '80px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Camada base - OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

          {/* Camada WMS do seu GeoServer - Municípios de SP */}
          {isLayerVisible && (
            <WMSTileLayer
              url={geoserverUrl}
              layers="sp_dashboard:municipios_sp"
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Informações de Status */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <p>🌐 GeoServer: localhost:8080</p>
        <p>📍 Coordenadas: EPSG:4326</p>
      </div>
    </div>
  );
};

export default MapViewer;