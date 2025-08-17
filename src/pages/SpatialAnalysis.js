import React from 'react';
import { Search, Target, Layers, Zap } from 'lucide-react';

export default function SpatialAnalysis() {
  const analysisTypes = [
    {
      title: "Buffer (Área de Influência)",
      description: "Cria áreas de influência ao redor de geometrias",
      icon: Target,
      color: "bg-blue-500"
    },
    {
      title: "Interseção",
      description: "Identifica sobreposições entre camadas",
      icon: Layers,
      color: "bg-green-500"
    },
    {
      title: "Análise de Proximidade",
      description: "Calcula distâncias e pontos mais próximos",
      icon: Search,
      color: "bg-purple-500"
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
      </div>

      {/* Analysis Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysisTypes.map((analysis, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className={`w-12 h-12 ${analysis.color} rounded-xl flex items-center justify-center mb-4`}>
              <analysis.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{analysis.title}</h3>
            <p className="text-slate-600 text-sm">{analysis.description}</p>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
        <div className="text-center">
          <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Em Desenvolvimento</h2>
          <p className="text-slate-600 text-lg mb-4">
            As ferramentas de análise espacial estão sendo implementadas
          </p>
          <p className="text-sm text-slate-500">
            Funcionalidades incluirão: Buffer, Intersect, Union, Clip, Dissolve, e análises estatísticas espaciais
          </p>
        </div>
      </div>
    </div>
  );
}