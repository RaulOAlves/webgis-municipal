import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Search, 
  Target, 
  Layers, 
  Zap, 
  Play, 
  Download, 
  MapPin, 
  Circle,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Database,
  Info,
  ExternalLink
} from 'lucide-react';

export default function SpatialAnalysis() {
  // Estados para análise de buffer
  const [bufferAnalysis, setBufferAnalysis] = useState({
    distance: 1000, // metros
    selectedLayer: 'ubs',
    isRunning: false,
    results: null,
    error: null
  });

  // Estados para dados disponíveis
  const [availableLayers, setAvailableLayers] = useState({
    ubs: { available: false, count: 0 },
    municipios: { available: false, count: 0 }
  });

  // Estados para resultados de análises
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Verificar camadas disponíveis
  useEffect(() => {
    const checkLayersAvailability = async () => {
      const layers = [
        { key: 'ubs', typeName: 'sp_dashboard:ubs' },
        { key: 'municipios', typeName: 'sp_dashboard:municipios_sp' }
      ];

      const layerStatus = {};

      for (const layer of layers) {
        try {
          const response = await fetch(
            `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.typeName}&resultType=hits`
          );
          
          if (response.ok) {
            const text = await response.text();
            const match = text.match(/numberOfFeatures="(\d+)"/);
            const count = match ? parseInt(match[1]) : 0;
            
            layerStatus[layer.key] = {
              available: true,
              count: count
            };
          } else {
            layerStatus[layer.key] = { available: false, count: 0 };
          }
        } catch (error) {
          layerStatus[layer.key] = { available: false, count: 0 };
        }
      }

      setAvailableLayers(layerStatus);
    };

    checkLayersAvailability();
  }, []);

  // Executar análise de buffer
  const runBufferAnalysis = async () => {
    setBufferAnalysis(prev => ({ ...prev, isRunning: true, error: null, results: null }));

    try {
      // Simular análise de buffer (em produção seria uma chamada ao GeoServer ou backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Buscar dados da camada selecionada
      const response = await fetch(
        `http://localhost:8080/geoserver/sp_dashboard/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=sp_dashboard:${bufferAnalysis.selectedLayer}&outputFormat=application/json&maxFeatures=50`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da camada');
      }

      const data = await response.json();
      const features = data.features || [];

      // Calcular estatísticas do buffer
      const bufferResults = {
        originalFeatures: features.length,
        bufferDistance: bufferAnalysis.distance,
        layerType: bufferAnalysis.selectedLayer === 'ubs' ? 'UBS' : 'Municípios',
        timestamp: new Date().toISOString(),
        analysisType: 'Buffer',
        coverage: {
          estimatedArea: features.length * Math.PI * Math.pow(bufferAnalysis.distance / 1000, 2), // km²
          overlappingBuffers: Math.floor(features.length * 0.3), // estimativa
          uniqueArea: features.length * Math.PI * Math.pow(bufferAnalysis.distance / 1000, 2) * 0.7
        },
        statistics: {
          minDistance: bufferAnalysis.distance,
          maxDistance: bufferAnalysis.distance,
          averageDistance: bufferAnalysis.distance,
          totalBuffers: features.length
        }
      };

      setBufferAnalysis(prev => ({ ...prev, results: bufferResults }));
      
      // Adicionar ao histórico
      setAnalysisHistory(prev => [bufferResults, ...prev.slice(0, 4)]);

    } catch (error) {
      setBufferAnalysis(prev => ({ 
        ...prev, 
        error: error.message || 'Erro durante a análise' 
      }));
    } finally {
      setBufferAnalysis(prev => ({ ...prev, isRunning: false }));
    }
  };

  // Gerar URL de visualização
  const generateBufferVisualizationUrl = (results) => {
    if (!results) return null;
    
    const layerName = results.layerType === 'UBS' ? 'sp_dashboard:ubs' : 'sp_dashboard:municipios_sp';
    return `http://localhost:8080/geoserver/sp_dashboard/wms?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&bbox=-53.1,-25.4,-44.1,-19.8&width=800&height=600&srs=EPSG:4326&format=image/png&styles=&transparent=true`;
  };

  const analysisTypes = [
    {
      title: "Buffer (Área de Influência)",
      description: "Cria áreas de influência ao redor de geometrias",
      icon: Target,
      color: "bg-blue-500",
      status: "active",
      action: () => document.getElementById('buffer-section').scrollIntoView()
    },
    {
      title: "Interseção",
      description: "Identifica sobreposições entre camadas",
      icon: Layers,
      color: "bg-green-500",
      status: "coming-soon"
    },
    {
      title: "Análise de Proximidade",
      description: "Calcula distâncias e pontos mais próximos",
      icon: Search,
      color: "bg-purple-500",
      status: "coming-soon"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Search className="w-8 h-8" />
          Análises Espaciais (GeoBI)
        </h1>
        <p className="text-purple-100 text-lg">Ferramentas de geoprocessamento e análise espacial</p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{availableLayers.ubs.count + availableLayers.municipios.count}</div>
            <div className="text-purple-200">Features Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analysisHistory.length}</div>
            <div className="text-purple-200">Análises Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1</div>
            <div className="text-purple-200">Ferramentas Ativas</div>
          </div>
        </div>
      </div>

      {/* Analysis Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysisTypes.map((analysis, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
              analysis.status === 'active' ? 'ring-2 ring-blue-200' : ''
            }`}
            onClick={analysis.action}
          >
            <div className={`w-12 h-12 ${analysis.color} rounded-xl flex items-center justify-center mb-4`}>
              <analysis.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{analysis.title}</h3>
            <p className="text-slate-600 text-sm mb-3">{analysis.description}</p>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              analysis.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {analysis.status === 'active' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Disponível
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Em Breve
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buffer Analysis Tool */}
      <Card className="p-6" id="buffer-section">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Análise de Buffer</h3>
              <p className="text-gray-600">Crie áreas de influência ao redor de features selecionadas</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            availableLayers.ubs.available || availableLayers.municipios.available
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {availableLayers.ubs.available || availableLayers.municipios.available ? 'Pronto' : 'Dados Indisponíveis'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Circle className="h-4 w-4 mr-2 text-blue-600" />
              Configurações da Análise
            </h4>

            {/* Seleção da Camada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camada de Origem
              </label>
              <select
                value={bufferAnalysis.selectedLayer}
                onChange={(e) => setBufferAnalysis(prev => ({ ...prev, selectedLayer: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ubs" disabled={!availableLayers.ubs.available}>
                  UBS ({availableLayers.ubs.count} unidades) 
                  {!availableLayers.ubs.available && ' - Indisponível'}
                </option>
                <option value="municipios" disabled={!availableLayers.municipios.available}>
                  Municípios ({availableLayers.municipios.count} municípios)
                  {!availableLayers.municipios.available && ' - Indisponível'}
                </option>
              </select>
            </div>

            {/* Distância do Buffer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distância do Buffer (metros)
              </label>
              <input
                type="number"
                value={bufferAnalysis.distance}
                onChange={(e) => setBufferAnalysis(prev => ({ ...prev, distance: parseInt(e.target.value) || 1000 }))}
                min="100"
                max="50000"
                step="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Equivale a {(bufferAnalysis.distance / 1000).toFixed(1)} km de raio
              </p>
            </div>

            {/* Botão de Execução */}
            <Button
              onClick={runBufferAnalysis}
              disabled={bufferAnalysis.isRunning || (!availableLayers.ubs.available && !availableLayers.municipios.available)}
              className="w-full"
            >
              {bufferAnalysis.isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Análise
                </>
              )}
            </Button>

            {/* Status/Erro */}
            {bufferAnalysis.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{bufferAnalysis.error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
              Resultados da Análise
            </h4>

            {bufferAnalysis.results ? (
              <div className="space-y-4">
                {/* Estatísticas Principais */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-3">📊 Estatísticas do Buffer</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Features Processadas:</span>
                      <div className="font-bold text-green-900">{bufferAnalysis.results.originalFeatures}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Distância:</span>
                      <div className="font-bold text-green-900">{bufferAnalysis.results.bufferDistance}m</div>
                    </div>
                    <div>
                      <span className="text-green-700">Área Estimada:</span>
                      <div className="font-bold text-green-900">{bufferAnalysis.results.coverage.estimatedArea.toFixed(1)} km²</div>
                    </div>
                    <div>
                      <span className="text-green-700">Tipo de Camada:</span>
                      <div className="font-bold text-green-900">{bufferAnalysis.results.layerType}</div>
                    </div>
                  </div>
                </div>

                {/* Análise de Cobertura */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-3">🗺️ Análise de Cobertura</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Buffers com sobreposição:</span>
                      <span className="font-bold text-blue-900">{bufferAnalysis.results.coverage.overlappingBuffers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Área única (estimada):</span>
                      <span className="font-bold text-blue-900">{bufferAnalysis.results.coverage.uniqueArea.toFixed(1)} km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Taxa de cobertura:</span>
                      <span className="font-bold text-blue-900">
                        {((bufferAnalysis.results.coverage.uniqueArea / bufferAnalysis.results.coverage.estimatedArea) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const url = generateBufferVisualizationUrl(bufferAnalysis.results);
                      if (url) window.open(url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const data = JSON.stringify(bufferAnalysis.results, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `buffer_analysis_${Date.now()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>Execute uma análise para ver os resultados aqui</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Histórico de Análises */}
      {analysisHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-purple-600" />
            Histórico de Análises
          </h3>
          
          <div className="space-y-3">
            {analysisHistory.map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {analysis.analysisType} - {analysis.layerType}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {analysis.originalFeatures} features
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Distância: {analysis.bufferDistance}m • Área: {analysis.coverage.estimatedArea.toFixed(1)} km²
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(analysis.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informações e Ajuda */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Como usar as Análises Espaciais</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Buffer Analysis:</strong> Cria áreas de influência circulares ao redor de cada feature da camada selecionada.</p>
              <p><strong>Aplicações:</strong> Análise de cobertura de serviços, zonas de influência de equipamentos públicos, áreas de risco.</p>
              <p><strong>Dica:</strong> Para UBS, distâncias entre 1-5km são típicas para análises de cobertura de serviços de saúde.</p>
              <p><strong>Próximas ferramentas:</strong> Interseção de camadas, análise de proximidade, cálculo de rotas e muito mais!</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}