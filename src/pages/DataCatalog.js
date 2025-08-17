import React from 'react';
import { Database, Layers } from 'lucide-react';

export default function DataCatalog() {
  const layers = [
    {
      name: "Municípios de SP",
      workspace: "sp_dashboard",
      layer: "municipios_sp",
      type: "WMS",
      status: "Ativa",
      description: "Limites territoriais dos 645 municípios do Estado de São Paulo"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="w-8 h-8" />
          Catálogo de Dados Geoespaciais
        </h1>
        <p className="text-green-100 text-lg">Gerencie as camadas de dados disponíveis para o município</p>
      </div>

      {/* Layers List */}
      <div className="grid grid-cols-1 gap-6">
        {layers.map((layer, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-green-600" />
                  {layer.name}
                </h3>
                <p className="text-slate-600 mb-4">{layer.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-500">Workspace:</span>
                    <p className="text-slate-900">{layer.workspace}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Camada:</span>
                    <p className="text-slate-900">{layer.layer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Tipo:</span>
                    <p className="text-slate-900">{layer.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Status:</span>
                    <p className="text-green-600 font-medium">✅ {layer.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Layer */}
      <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-300">
        <div className="text-center">
          <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Adicionar Nova Camada</h3>
          <p className="text-slate-600 mb-4">Configure novas camadas WMS/WFS do seu GeoServer</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Adicionar Camada
          </button>
        </div>
      </div>
    </div>
  );
}