import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const reports = [
    {
      title: "Relatório de Conexão GeoServer",
      description: "Status da conexão e camadas disponíveis",
      date: "17/08/2025",
      format: "PDF",
      status: "Disponível"
    },
    {
      title: "Inventário de Dados Geoespaciais",
      description: "Catálogo completo das camadas e metadados",
      date: "17/08/2025", 
      format: "XLSX",
      status: "Disponível"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Central de Relatórios
        </h1>
        <p className="text-orange-100 text-lg">Documentos e relatórios do sistema WebGIS</p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-slate-600 text-sm mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {report.format}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {report.status}
                  </span>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate New Report */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Gerar Novo Relatório</h3>
        <p className="text-slate-600 mb-4">Crie relatórios personalizados com base nos dados do sistema</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium">Relatório de Status</p>
          </button>
          <button className="bg-white border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium">Inventário de Dados</p>
          </button>
          <button className="bg-white border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium">Relatório Customizado</p>
          </button>
        </div>
      </div>
    </div>
  );
}