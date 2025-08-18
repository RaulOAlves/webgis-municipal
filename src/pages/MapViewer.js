import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvents, Popup, Marker } from 'react-leaflet';
import { Map as MapIcon, Layers, Eye, EyeOff, Building2, Heart, CheckCircle, AlertCircle, Info, X, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix do ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para gerenciar cliques no mapa
function MapClickHandler({ onMapClick, layersVisible }) {
  useMapEvents({
    click(e) {
      if (layersVisible.municipios || layersVisible.ubs) {
        onMapClick(e);
      }
    },
  });
  return null;
}

export default function MapViewer() {
  // Estados existentes
  const [layersVisible, setLayersVisible] = useState({
    municipios: true,
    ubs: true
  });

  const [ubsAvailable, setUbsAvailable] = useState(false);
  const [ubsCount, setUbsCount] = useState(0);
  const [isTestingUbs, setIsTestingUbs] = useState(true);

  // Novos estados para GetFeatureInfo
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [loadingFeatureInfo, setLoadingFeatureInfo] = useState(false);
  const [featureInfoError, setFeatureInfoError] = useState(null);

  const mapRef = useRef();

  // Configuração do mapa
  const mapCenter = [-23.5505, -46.6333];
  const mapZoom = 8;
  const geoserverUrl = "http://localhost:8080/geoserver/sp_dashboard/wms";

  // Verificar disponibilidade UBS (código existente)
  useEffect(() => {
    const checkUbsAvailability = async () => {
      try {
        setIsTestingUbs(true);
        const ubsWfsUrl = `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&maxFeatures=1&outputFormat=application/json`;
        const response = await fetch(ubsWfsUrl);
        
        if (response.ok) {
          const countUrl = `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:ubs&resultType=hits`;
          try {
            const countResponse = await fetch(countUrl);
            if (countResponse.ok) {
              const countText = await countResponse.text();
              const match = countText.match(/numberOfFeatures="(\d+)"/);
              const count = match ? parseInt(match[1]) : 0;
              setUbsCount(count);
              setUbsAvailable(true);
            }
          } catch (error) {
            setUbsAvailable(true);
          }
        } else {
          setUbsAvailable(false);
        }
      } catch (error) {
        setUbsAvailable(false);
      } finally {
        setIsTestingUbs(false);
      }
    };

    checkUbsAvailability();
    const interval = setInterval(checkUbsAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  // Função para fazer GetFeatureInfo
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setClickPosition([lat, lng]);
    setLoadingFeatureInfo(true);
    setFeatureInfoError(null);
    setSelectedFeature(null);

    try {
      const map = mapRef.current;
      if (!map) return;

      const mapSize = map.getSize();
      const bounds = map.getBounds();
      
      // Converter coordenadas do clique para pixel
      const point = map.latLngToContainerPoint([lat, lng]);
      
      // Configurar bbox
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      
      // Lista de camadas ativas para consultar
      const activeLayers = [];
      if (layersVisible.municipios) activeLayers.push('sp_dashboard:municipios_sp');
      if (layersVisible.ubs && ubsAvailable) activeLayers.push('sp_dashboard:ubs');

      if (activeLayers.length === 0) {
        setLoadingFeatureInfo(false);
        return;
      }

      // Fazer GetFeatureInfo para todas as camadas ativas
      const results = await Promise.all(
        activeLayers.map(async (layer) => {
          const getFeatureInfoUrl = `${geoserverUrl}?` +
            `service=WMS&version=1.1.0&request=GetFeatureInfo&` +
            `layers=${layer}&query_layers=${layer}&` +
            `bbox=${bbox}&width=${mapSize.x}&height=${mapSize.y}&` +
            `x=${Math.round(point.x)}&y=${Math.round(point.y)}&` +
            `srs=EPSG:4326&info_format=application/json&` +
            `feature_count=1`;

          try {
            const response = await fetch(getFeatureInfoUrl);
            if (response.ok) {
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                return {
                  layer: layer,
                  feature: data.features[0],
                  layerName: layer === 'sp_dashboard:municipios_sp' ? 'Município' : 'UBS'
                };
              }
            }
          } catch (error) {
            console.error(`Erro no GetFeatureInfo para ${layer}:`, error);
          }
          return null;
        })
      );

      // Pegar o primeiro resultado válido
      const validResult = results.find(result => result !== null);
      
      if (validResult) {
        setSelectedFeature(validResult);
      } else {
        setFeatureInfoError('Nenhuma informação encontrada neste local');
      }

    } catch (error) {
      console.error('Erro no GetFeatureInfo:', error);
      setFeatureInfoError('Erro ao buscar informações');
    } finally {
      setLoadingFeatureInfo(false);
    }
  };

  // Toggle de visibilidade das camadas
  const toggleLayer = (layerKey) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
    // Limpar seleção quando camada é desativada
    if (selectedFeature && !layersVisible[layerKey]) {
      setSelectedFeature(null);
      setClickPosition(null);
    }
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

  // Componente para exibir informações da feature
  const FeatureInfoPanel = () => {
    if (!selectedFeature && !loadingFeatureInfo && !featureInfoError) return null;

    return (
      <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 min-w-[300px] max-w-[400px]">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-600" />
            Informações do Local
          </h3>
          <button
            onClick={() => {
              setSelectedFeature(null);
              setClickPosition(null);
              setFeatureInfoError(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {loadingFeatureInfo && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600">Buscando informações...</span>
            </div>
          )}

          {featureInfoError && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">{featureInfoError}</p>
            </div>
          )}

          {selectedFeature && (
            <div>
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  selectedFeature.layerName === 'Município' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedFeature.layerName === 'Município' ? 
                    <Building2 className="h-3 w-3 mr-1" /> : 
                    <Heart className="h-3 w-3 mr-1" />
                  }
                  {selectedFeature.layerName}
                </span>
              </div>

              <div className="space-y-3">
                {selectedFeature.layerName === 'Município' ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedFeature.feature.properties.nome || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código IBGE</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.codigo_ibge || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.area_km2 ? 
                          `${selectedFeature.feature.properties.area_km2} km²` : 'N/A'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome da UBS</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedFeature.feature.properties.nome_fantasia || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Município</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.municipio || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Endereço</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.endereco || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefone</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.telefone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CNES</label>
                      <p className="text-sm text-gray-700">
                        {selectedFeature.feature.properties.codigo_cnes || 'N/A'}
                      </p>
                    </div>
                  </>
                )}

                {/* Coordenadas */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Coordenadas</label>
                  <p className="text-xs text-gray-600">
                    Lat: {clickPosition ? clickPosition[0].toFixed(6) : 'N/A'}<br/>
                    Lng: {clickPosition ? clickPosition[1].toFixed(6) : 'N/A'}
                  </p>
                </div>

                {/* Ações */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (clickPosition) {
                        const [lat, lng] = clickPosition;
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                      }
                    }}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver no Google Maps
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
                Visualizador interativo • Clique no mapa para informações • {Object.values(layersVisible).filter(Boolean).length} camada(s) ativa(s)
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

          {/* Instruções de uso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">💡 Como usar:</p>
                <p>Clique em qualquer local do mapa para ver informações detalhadas dos municípios e UBS.</p>
              </div>
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
                  <span className="text-gray-700">Limites municipais (clicáveis)</span>
                </div>
              )}
              {layersVisible.ubs && ubsAvailable && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700"></div>
                  <span className="text-gray-700">UBS ativas (clicáveis)</span>
                </div>
              )}
              {!Object.values(layersVisible).some(Boolean) && (
                <span className="text-gray-500 italic">Nenhuma camada visível</span>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Informações da Feature */}
        <FeatureInfoPanel />

        {/* Mapa */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          ref={mapRef}
        >
          {/* Handler de cliques */}
          <MapClickHandler onMapClick={handleMapClick} layersVisible={layersVisible} />

          {/* Camada base */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

          {/* Camada WMS - Municípios */}
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

          {/* Marker na posição clicada */}
          {clickPosition && (
            <Marker position={clickPosition}>
              <Popup>
                📍 Local clicado<br/>
                {clickPosition[0].toFixed(6)}, {clickPosition[1].toFixed(6)}
              </Popup>
            </Marker>
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