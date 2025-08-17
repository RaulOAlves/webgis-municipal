import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import { Map as MapIcon, Layers, Eye, EyeOff, Building2, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function MapViewer() {
  // Estados para controle das camadas
  const [layersVisible, setLayersVisible] = useState({
    municipios: true,
    ubs: true
  });

  // Estado para verificar se UBS está disponível
  const [ubsAvailable, setUbsAvailable] = useState(false);
  const [ubsCount, setUbsCount] = useState(0);
  const [isTestingUbs, setIsTestingUbs] = useState(true);

  // Configuração do mapa centrado em São Paulo
  const mapCenter = [-23.5505, -46.6333];
  const mapZoom = 8;

  // URL do GeoServer local
  const geoserverUrl = "http://localhost:8080/geoserver/sp_dashboard/wms";

  // Verificar se UBS está disponível
  useEffect(() => {
    const checkUbsAvailability = async () => {
      try {
        setIsTestingUbs(true);
        
        // Testar via WFS (como no diagnóstico que funcionou)
        const ubsWfsUrl = `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&maxFeatures=1&outputFormat=application/json`;
        
        const response = await fetch(ubsWfsUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          // Contar total de UBS
          const countUrl = `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&resultType=hits`;
          
          try {
            const countResponse = await fetch(countUrl);
            if (countResponse.ok) {
              const countText = await countResponse.text();
              const match = countText.match(/numberOfFeatures="(\d+)"/);
              const count = match ? parseInt(match[1]) : 0;
              
              setUbsCount(count);
              setUbsAvailable(true);
              console.log(`✅ UBS detectadas: ${count}`);
            }
          } catch (error) {
            console.log('Erro contando UBS:', error);
            setUbsAvailable(true); // Ainda consideramos disponível se WFS funciona
          }
        } else {
          setUbsAvailable(false);
          console.log('UBS não disponível');
        }
      } catch (error) {
        setUbsAvailable(false);
        console.log('Erro verificando UBS:', error);
      } finally {
        setIsTestingUbs(false);
      }
    };

    checkUbsAvailability();
    
    // Verificar novamente a cada 30 segundos
    const interval = setInterval(checkUbsAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

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
      name: 'sp_dashboard:municipios_sp',
      title: 'Municípios de SP',
      icon: Building2,
      color: 'text-blue-600',
      count: 645
    },
    ubs: {
      name: 'sp_dashboard:ubs',
      title: 'UBS - Unidades Básicas de Saúde',
      icon: Heart,
      color: 'text-green-600',
      count: ubsCount
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapIcon className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">WebGIS Municipal - São Paulo</h1>
              <p className="text-blue-100 text-sm">
                Visualizador conectado ao GeoServer local • {Object.values(layersVisible).filter(Boolean).length} camada(s) ativa(s)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">🌐 localhost:8080</div>
            <div className="text-xs text-blue-200">sp_dashboard</div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Painel de Controles */}
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Camadas Disponíveis</h2>
          </div>

          {/* Status Geral */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4 border border-blue-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Camadas ativas:</span>
              <span className="font-semibold text-blue-600">
                {Object.values(layersVisible).filter(Boolean).length}/2
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Features total:</span>
              <span className="font-semibold text-green-600">
                {(layerInfo.municipios.count + layerInfo.ubs.count).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Controles das Camadas */}
          <div className="space-y-3">
            {Object.entries(layerInfo).map(([key, layer]) => {
              const IconComponent = layer.icon;
              const isVisible = layersVisible[key];
              const isAvailable = key === 'municipios' || ubsAvailable;
              const isLoading = key === 'ubs' && isTestingUbs;

              return (
                <div
                  key={key}
                  className={`border-2 rounded-lg p-3 transition-all duration-200 ${
                    isVisible && isAvailable
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        key === 'municipios' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${layer.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {layer.title}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {layer.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleLayer(key)}
                      disabled={!isAvailable || isLoading}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        !isAvailable || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isVisible
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                          <span>Test...</span>
                        </>
                      ) : isVisible ? (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Visível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Oculta</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Informações da Camada */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <div className="flex items-center space-x-1">
                        {isLoading ? (
                          <>
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            <span className="text-yellow-600">Testando...</span>
                          </>
                        ) : isAvailable ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Disponível</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-red-600">Indisponível</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isAvailable && !isLoading && (
                      <div className="flex justify-between items-center mt-1">
                        <span>Registros:</span>
                        <span className="font-medium">{layer.count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">🎨 Legenda</h4>
            <div className="space-y-2 text-xs">
              {layersVisible.municipios && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-blue-600 bg-blue-100 opacity-70 rounded"></div>
                  <span className="text-gray-700">Limites municipais</span>
                </div>
              )}
              {layersVisible.ubs && ubsAvailable && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700"></div>
                  <span className="text-gray-700">UBS ativas</span>
                </div>
              )}
              {!Object.values(layersVisible).some(Boolean) && (
                <span className="text-gray-500 italic">Nenhuma camada visível</span>
              )}
            </div>
          </div>

          {/* Teste Manual UBS */}
          {ubsAvailable && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const testUrl = "http://localhost:8080/geoserver/sp_dashboard/wms?service=WMS&version=1.1.0&request=GetMap&layers=sp_dashboard:ubs&bbox=-47,-24,-46,-23&width=400&height=400&srs=EPSG:4326&format=image/png";
                  window.open(testUrl, '_blank');
                }}
                className="w-full bg-green-500 text-white text-xs py-2 px-3 rounded hover:bg-green-600 transition-colors"
              >
                🧪 Testar URL WMS UBS
              </button>
            </div>
          )}
        </div>

        {/* Mapa */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
        >
          {/* Camada base - OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

          {/* Camada WMS - Municípios de SP */}
          {layersVisible.municipios && (
            <WMSTileLayer
              url={geoserverUrl}
              layers="sp_dashboard:municipios_sp"
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.6}
            />
          )}

          {/* Camada WMS - UBS */}
          {layersVisible.ubs && ubsAvailable && (
            <WMSTileLayer
              url={geoserverUrl}
              layers="sp_dashboard:ubs"
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.9}
            />
          )}
        </MapContainer>

        {/* Aviso se UBS não disponível */}
        {!ubsAvailable && !isTestingUbs && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Camada UBS não encontrada. Execute o script Python primeiro.
              </span>
            </div>
          </div>
        )}

        {/* Informações de Status */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600">
          <div className="font-medium text-gray-900 mb-2">🌐 Conexão</div>
          <div>GeoServer: localhost:8080</div>
          <div>Workspace: sp_dashboard</div>
          <div>Coordenadas: EPSG:4326</div>
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}