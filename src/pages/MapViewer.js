import React, { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import { Map as MapIcon, Layers, Eye, EyeOff } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function MapViewer() {
  const [isLayerVisible, setIsLayerVisible] = useState(true);

  // Configuração do mapa centrado em São Paulo
  const mapCenter = [-23.5505, -46.6333];
  const mapZoom = 8;

  // URL do seu GeoServer local
  const geoserverUrl = "http://localhost:8080/geoserver/sp_dashboard/wms";

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapIcon className="w-6 h-6" />
              Visualizador de Mapas
            </h1>
            <p className="text-blue-100 text-sm">Interface cartográfica com dados de São Paulo</p>
          </div>
          <div className="hidden md:block">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        {/* Controls Panel */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[250px]">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Controle de Camadas
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isLayerVisible}
                onChange={(e) => setIsLayerVisible(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2 flex-1">
                {isLayerVisible ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <span className="font-medium">Municípios de SP</span>
              </div>
            </label>
            
            <div className="border-t border-slate-200 pt-3 text-sm text-slate-600 space-y-1">
              <p><strong>Workspace:</strong> sp_dashboard</p>
              <p><strong>Camada:</strong> municipios_sp</p>
              <p><strong>Status:</strong> 
                <span className={isLayerVisible ? "text-green-600 ml-1" : "text-slate-400 ml-1"}>
                  {isLayerVisible ? '✅ Ativa' : '❌ Inativa'}
                </span>
              </p>
              <p><strong>Tipo:</strong> WMS</p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-full">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            {/* Base Layer - OpenStreetMap */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />

            {/* WMS Layer - Municípios de SP */}
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

        {/* Info Panel - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <div className="text-sm text-slate-600 space-y-1">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <strong>GeoServer:</strong> localhost:8080
            </p>
            <p><strong>Coordenadas:</strong> EPSG:4326</p>
            <p><strong>Municípios:</strong> 645</p>
          </div>
        </div>

        {/* Legend */}
        {isLayerVisible && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Legenda</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-blue-200/50 rounded-sm"></div>
              <span className="text-sm text-slate-700">Municípios de SP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}