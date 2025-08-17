import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { 
  Database, 
  Building2, 
  Heart, 
  Eye, 
  Download, 
  ExternalLink, 
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Tag,
  Globe,
  FileText
} from 'lucide-react';

const DataCatalog = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Buscar informações das camadas
  useEffect(() => {
    const fetchLayerInfo = async () => {
      setLoading(true);
      
      const layersData = [
        {
          id: 'municipios_sp',
          name: 'sp_dashboard:municipios_sp',
          title: 'Municípios do Estado de São Paulo',
          description: 'Limites administrativos dos 645 municípios do Estado de São Paulo com informações demográficas e geográficas.',
          icon: Building2,
          color: 'blue',
          type: 'Polygon',
          source: 'IBGE',
          lastUpdate: '2024-01-15',
          recordCount: 0,
          available: false,
          tags: ['administrativo', 'limites', 'municipios', 'ibge'],
          wmsUrl: 'http://localhost:8080/geoserver/sp_dashboard/wms',
          wfsUrl: 'http://localhost:8080/geoserver/sp_dashboard/wfs',
          previewUrl: 'http://localhost:8080/geoserver/sp_dashboard/wms?service=WMS&version=1.1.0&request=GetMap&layers=sp_dashboard:municipios_sp&bbox=-53.1,-25.4,-44.1,-19.8&width=400&height=400&srs=EPSG:4326&format=image/png',
          metadata: {
            projection: 'EPSG:4326',
            format: 'WMS/WFS',
            quality: 'Alta',
            coverage: 'Estado de São Paulo'
          }
        },
        {
          id: 'ubs',
          name: 'sp_dashboard:ubs',
          title: 'UBS - Unidades Básicas de Saúde',
          description: 'Localização e informações das Unidades Básicas de Saúde ativas no Estado de São Paulo, incluindo dados de contato e serviços.',
          icon: Heart,
          color: 'green',
          type: 'Point',
          source: 'CNES/DataSUS',
          lastUpdate: new Date().toISOString().split('T')[0],
          recordCount: 0,
          available: false,
          tags: ['saude', 'ubs', 'cnes', 'pontos'],
          wmsUrl: 'http://localhost:8080/geoserver/sp_dashboard/wms',
          wfsUrl: 'http://localhost:8080/geoserver/sp_dashboard/wfs',
          previewUrl: 'http://localhost:8080/geoserver/sp_dashboard/wms?service=WMS&version=1.1.0&request=GetMap&layers=sp_dashboard:ubs&bbox=-48,-24,-45,-21&width=400&height=400&srs=EPSG:4326&format=image/png',
          metadata: {
            projection: 'EPSG:4326',
            format: 'WMS/WFS',
            quality: 'Alta',
            coverage: 'Estado de São Paulo'
          }
        }
      ];

      // Verificar disponibilidade e contagem de cada camada
      for (const layer of layersData) {
        try {
          const response = await fetch(`${layer.wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.name}&resultType=hits`);
          
          if (response.ok) {
            const text = await response.text();
            const match = text.match(/numberOfFeatures="(\d+)"/);
            
            if (match) {
              layer.recordCount = parseInt(match[1]);
              layer.available = true;
            }
          }
        } catch (error) {
          console.log(`Erro verificando ${layer.name}:`, error);
        }
      }

      setLayers(layersData);
      setLastUpdate(new Date());
      setLoading(false);
    };

    fetchLayerInfo();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchLayerInfo, 300000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar camadas
  const filteredLayers = layers.filter(layer => {
    const matchesSearch = layer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         layer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         layer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'available' && layer.available) ||
                         (filterStatus === 'unavailable' && !layer.available);
    
    return matchesSearch && matchesFilter;
  });

  const LayerCard = ({ layer }) => {
    const IconComponent = layer.icon;
    
    return (
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              layer.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                layer.color === 'blue' ? 'text-blue-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{layer.title}</h3>
              <p className="text-sm text-gray-600">{layer.name}</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            layer.available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {layer.available ? (
              <>
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Disponível
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Indisponível
              </>
            )}
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {layer.description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Tipo:</span>
            <span className="ml-2 font-medium">{layer.type}</span>
          </div>
          <div>
            <span className="text-gray-500">Fonte:</span>
            <span className="ml-2 font-medium">{layer.source}</span>
          </div>
          <div>
            <span className="text-gray-500">Registros:</span>
            <span className="ml-2 font-medium">{layer.recordCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Atualização:</span>
            <span className="ml-2 font-medium">{layer.lastUpdate}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {layer.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Metadados técnicos */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Metadados Técnicos</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Projeção: {layer.metadata.projection}</div>
            <div>Formato: {layer.metadata.format}</div>
            <div>Qualidade: {layer.metadata.quality}</div>
            <div>Cobertura: {layer.metadata.coverage}</div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2">
          <a
            href="/mapviewer"
            className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Visualizar</span>
          </a>
          
          {layer.available && (
            <>
              <button
                onClick={() => window.open(layer.previewUrl, '_blank')}
                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Preview</span>
              </button>
              
              <button
                onClick={() => {
                  const wfsUrl = `${layer.wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.name}&outputFormat=application/json`;
                  window.open(wfsUrl, '_blank');
                }}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Catálogo de Dados</h1>
            <p className="text-purple-100 text-lg">Repositório de camadas geoespaciais do sistema</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{layers.length}</div>
            <div className="text-purple-100">Camadas Totais</div>
            {lastUpdate && (
              <div className="text-xs text-purple-200 mt-1">
                Atualizado: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar camadas, tags ou descrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="available">Disponíveis</option>
                <option value="unavailable">Indisponíveis</option>
              </select>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{layers.length}</div>
              <div className="text-gray-600">Total de Camadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {layers.filter(l => l.available).length}
              </div>
              <div className="text-gray-600">Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {layers.reduce((sum, l) => sum + l.recordCount, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Features Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredLayers.length}
              </div>
              <div className="text-gray-600">Resultados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Carregando informações das camadas...</span>
        </div>
      )}

      {/* Lista de Camadas */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLayers.map((layer) => (
            <LayerCard key={layer.id} layer={layer} />
          ))}
        </div>
      )}

      {/* Sem resultados */}
      {!loading && filteredLayers.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma camada encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou termos de busca.</p>
        </div>
      )}
    </div>
  );
};

export default DataCatalog;