import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapViewer = () => {
  // Estados para controle das camadas
  const [layersVisible, setLayersVisible] = useState({
    municipios: true,
    ubs: true
  });

  // Estado para verificar disponibilidade das camadas
  const [layersAvailable, setLayersAvailable] = useState({
    municipios: true, // Já sabemos que funciona
    ubs: false // Será verificado
  });

  // Estado para estatísticas
  const [layerStats, setLayerStats] = useState({
    municipios: { count: 645, loaded: true },
    ubs: { count: 0, loaded: false }
  });

  // Configuração do mapa
  const mapCenter = [-23.5505, -46.6333];
  const mapZoom = 8; // Zoom um pouco menor para ver mais área

  // URLs do GeoServer
  const geoserverUrl = "http://localhost:8080/geoserver/sp_dashboard/wms";
  const geoserverWfs = "http://localhost:8080/geoserver/sp_dashboard/wfs";

  // Verificar disponibilidade das camadas
  useEffect(() => {
    const checkLayersAvailability = async () => {
      try {
        // Verificar UBS via WFS
        const ubsTestUrl = `${geoserverWfs}?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&maxFeatures=1&outputFormat=application/json`;
        
        const response = await fetch(ubsTestUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          // Contar features UBS
          const countUrl = `${geoserverWfs}?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&resultType=hits`;
          
          try {
            const countResponse = await fetch(countUrl);
            if (countResponse.ok) {
              const countText = await countResponse.text();
              const match = countText.match(/numberOfFeatures="(\d+)"/);
              const ubsCount = match ? parseInt(match[1]) : 0;
              
              setLayersAvailable(prev => ({ ...prev, ubs: true }));
              setLayerStats(prev => ({
                ...prev,
                ubs: { count: ubsCount, loaded: true }
              }));
            }
          } catch (error) {
            console.log('Erro contando UBS:', error);
          }
        } else {
          console.log('UBS layer not available yet');
        }
      } catch (error) {
        console.log('Erro verificando UBS:', error.message);
      }
    };

    checkLayersAvailability();
    
    // Verificar novamente a cada 30 segundos
    const interval = setInterval(checkLayersAvailability, 30000);
    return () => clearInterval(interval);
  }, [geoserverWfs]);

  // Toggle de visibilidade das camadas
  const toggleLayer = (layerKey) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Informações das camadas
  const layerInfo = {
    municipios: {
      title: 'Municípios de SP',
      name: 'sp_dashboard:municipios_sp',
      color: '#2563eb',
      icon: '🏛️'
    },
    ubs: {
      title: 'UBS - Unidades Básicas de Saúde',
      name: 'sp_dashboard:ubs',
      color: '#10b981',
      icon: '🏥'
    }
  };

  // Contar camadas ativas
  const activeLayers = Object.keys(layersVisible).filter(key => layersVisible[key] && layersAvailable[key]);
  const totalFeatures = layerStats.municipios.count + layerStats.ubs.count;

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
          Visualizador conectado ao GeoServer local • {activeLayers.length} camada{activeLayers.length !== 1 ? 's' : ''} ativa{activeLayers.length !== 1 ? 's' : ''} • {totalFeatures.toLocaleString()} features
        </p>
      </div>

      {/* Controles das Camadas */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '1rem',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1.25rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        minWidth: '280px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '1.1rem',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          📊 Camadas Disponíveis
        </h3>

        {/* Estatísticas Gerais */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #e0f2fe'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' }}>
            STATUS GERAL
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Camadas ativas:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#059669' }}>{activeLayers.length}/2</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Features total:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#7c3aed' }}>{totalFeatures.toLocaleString()}</span>
          </div>
        </div>

        {/* Controles individuais das camadas */}
        {Object.entries(layerInfo).map(([key, info]) => {
          const isVisible = layersVisible[key];
          const isAvailable = layersAvailable[key];
          const stats = layerStats[key];

          return (
            <div key={key} style={{
              background: isVisible && isAvailable ? 'rgba(16, 185, 129, 0.05)' : 'rgba(156, 163, 175, 0.05)',
              border: `2px solid ${isVisible && isAvailable ? '#10b981' : '#d1d5db'}`,
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: '#1f2937',
                      fontWeight: '600'
                    }}>
                      {info.title}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      fontSize: '0.75rem', 
                      color: '#6b7280'
                    }}>
                      {info.name}
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleLayer(key)}
                  disabled={!isAvailable}
                  style={{
                    background: isVisible && isAvailable ? info.color : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.5,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (isAvailable) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isVisible ? '👁️ Visível' : '🙈 Oculta'}
                </button>
              </div>

              {/* Informações da camada */}
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status:</span>
                  <span style={{ 
                    color: isAvailable ? '#059669' : '#dc2626',
                    fontWeight: '600'
                  }}>
                    {isAvailable ? '✅ Disponível' : '❌ Indisponível'}
                  </span>
                </div>
                {isAvailable && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span>Registros:</span>
                    <span style={{ fontWeight: '600' }}>{stats.count.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Legenda */}
        <div style={{
          background: 'rgba(249, 250, 251, 0.8)',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            🎨 Legenda
          </div>
          {activeLayers.map(layerKey => (
            <div key={layerKey} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.25rem',
              fontSize: '0.75rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: layerInfo[layerKey].color,
                borderRadius: layerKey === 'ubs' ? '50%' : '2px',
                opacity: 0.8
              }}></div>
              <span style={{ color: '#4b5563' }}>
                {layerKey === 'municipios' ? 'Limites municipais' : 'UBS ativas'}
              </span>
            </div>
          ))}
          {activeLayers.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
              Nenhuma camada ativa
            </span>
          )}
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

          {/* Camada WMS - Municípios de SP */}
          {layersVisible.municipios && layersAvailable.municipios && (
            <WMSTileLayer
              url={geoserverUrl}
              layers={layerInfo.municipios.name}
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.6}
            />
          )}

          {/* Camada WMS - UBS */}
          {layersVisible.ubs && layersAvailable.ubs && (
            <WMSTileLayer
              url={geoserverUrl}
              layers={layerInfo.ubs.name}
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.9}
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
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#64748b',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
          🌐 Conexão
        </div>
        <p style={{ margin: '0.25rem 0' }}>GeoServer: localhost:8080</p>
        <p style={{ margin: '0.25rem 0' }}>Workspace: sp_dashboard</p>
        <p style={{ margin: '0.25rem 0' }}>Coordenadas: EPSG:4326</p>
        <div style={{ 
          marginTop: '0.5rem', 
          paddingTop: '0.5rem', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10b981',
            borderRadius: '50%'
          }}></div>
          <span style={{ color: '#059669', fontWeight: '600' }}>Online</span>
        </div>
      </div>

      {/* Aviso se UBS não está disponível */}
      {!layersAvailable.ubs && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(251, 191, 36, 0.95)',
          color: '#92400e',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '600',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          ⚠️ Camada UBS não encontrada. Execute o script Python primeiro.
        </div>
      )}
    </div>
  );
};

export default MapViewer;