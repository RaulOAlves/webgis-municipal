import React from "react";
import { 
  Users, 
  Building2, 
  TreePine, 
  Car,
  MapPin,
  Activity,
  BarChart3
} from "lucide-react";
import KPICard from "../components/dashboard/KPICard";

export default function Dashboard() {
  // Dados específicos do Estado de São Paulo (mais realistas)
  const kpiData = [
    {
      title: "Municípios SP",
      value: "645",
      change: "Completo",
      trend: "up",
      icon: Building2,
      color: "blue"
    },
    {
      title: "População Estimada",
      value: "46.6M",
      change: "+0.4%",
      trend: "up",
      icon: Users,
      color: "purple"
    },
    {
      title: "Área Total",
      value: "248.219 km²",
      change: "Estável",
      trend: "up",
      icon: TreePine,
      color: "green"
    },
    {
      title: "Camadas Ativas",
      value: "1",
      change: "Municípios",
      trend: "up",
      icon: MapPin,
      color: "orange"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Executivo</h1>
            <p className="text-blue-100 text-lg">Sistema de Inteligência Geoespacial Municipal</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">São Paulo - SP</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Activity className="w-3 h-3" />
                <span className="text-sm">GeoServer Conectado</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* GeoServer Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🌐 Conexão GeoServer
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">URL</span>
              <span className="text-blue-600 font-medium">localhost:8080</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Workspace</span>
              <span className="text-green-600 font-medium">sp_dashboard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Status</span>
              <span className="text-green-600 font-medium">✅ Conectado</span>
            </div>
          </div>
        </div>

        {/* Camadas Disponíveis */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🗂️ Camadas Disponíveis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Municípios SP</span>
              <span className="text-green-600 font-medium">✅ Ativa</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Formato</span>
              <span className="text-blue-600 font-medium">WMS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Geometria</span>
              <span className="text-purple-600 font-medium">Polígono</span>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            🚀 Próximos Passos
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Configurar Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Conectar GeoServer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              <span>Adicionar mais camadas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              <span>Implementar análises</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}