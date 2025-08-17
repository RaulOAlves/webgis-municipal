import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Map, 
  BarChart3, 
  Database, 
  Search, 
  Settings, 
  Building2,
  Activity,
  FileText
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard Executivo",
    url: "/",
    icon: BarChart3,
    description: "Visão geral municipal"
  },
  {
    title: "Visualizador de Mapas",
    url: "/mapviewer",
    icon: Map,
    description: "Interface cartográfica"
  },
  {
    title: "Catálogo de Dados",
    url: "/datacatalog",
    icon: Database,
    description: "Gestão de camadas"
  },
  {
    title: "Análises Espaciais",
    url: "/analysis",
    icon: Search,
    description: "Geoprocessamento"
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText,
    description: "Documentos e relatórios"
  }
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-slate-200/60 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200/60 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">GeoMunicipal</h2>
              <p className="text-xs text-slate-500 font-medium">Sistema WebGIS + GeoBI</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
              Módulos Principais
            </h3>
            {navigationItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.url 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-semibold text-sm">{item.title}</span>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Status */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-slate-700">Status do Sistema</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">GeoServer</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Camadas Ativas</span>
                  <span className="text-blue-600 font-medium">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">SP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">São Paulo</p>
              <p className="text-xs text-slate-500 truncate">Município Ativo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}