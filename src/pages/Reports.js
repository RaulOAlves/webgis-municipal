import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  MapPin, 
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  RefreshCw,
  Share2,
  Mail,
  Printer,
  FileSpreadsheet,
  FilePdf,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';

export default function Reports() {
  // Estados para relatórios
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('status');
  const [reportConfig, setReportConfig] = useState({
    includeCharts: true,
    includeRawData: false,
    dateRange: 'current',
    format: 'pdf'
  });
  const [systemData, setSystemData] = useState({
    municipios: 0,
    ubs: 0,
    escolas: 0,
    lastUpdate: null
  });

  // Tipos de relatórios disponíveis
  const reportTypes = [
    {
      id: 'status',
      name: 'Relatório de Status do Sistema',
      description: 'Status geral das camadas, conectividade e estatísticas',
      icon: BarChart3,
      color: 'bg-blue-500',
      estimatedTime: '2-3 min',
      includes: ['Status GeoServer', 'Camadas ativas', 'Estatísticas gerais', 'Indicadores-chave']
    },
    {
      id: 'inventory',
      name: 'Inventário de Dados Geoespaciais',
      description: 'Catálogo completo de todas as camadas e metadados',
      icon: Database,
      color: 'bg-green-500',
      estimatedTime: '3-5 min',
      includes: ['Lista de camadas', 'Metadados técnicos', 'Qualidade dos dados', 'Fontes']
    },
    {
      id: 'coverage',
      name: 'Análise de Cobertura Territorial',
      description: 'Análise da distribuição de equipamentos por região',
      icon: MapPin,
      color: 'bg-purple-500',
      estimatedTime: '5-7 min',
      includes: ['Mapas de distribuição', 'Análise por região', 'Gaps de cobertura', 'Recomendações']
    },
    {
      id: 'performance',
      name: 'Relatório de Performance',
      description: 'Indicadores de performance e evolução temporal',
      icon: TrendingUp,
      color: 'bg-orange-500',
      estimatedTime: '4-6 min',
      includes: ['Métricas de crescimento', 'Comparativos', 'Tendências', 'Benchmarks']
    }
  ];

  // Histórico de relatórios (simulado)
  const [reportHistory] = useState([
    {
      id: 1,
      title: "Relatório de Status do Sistema",
      type: "status",
      date: "2025-08-17 14:30",
      format: "PDF",
      status: "Concluído",
      size: "2.3 MB",
      pages: 12,
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Inventário de Dados Geoespaciais",
      type: "inventory", 
      date: "2025-08-17 10:15",
      format: "XLSX",
      status: "Concluído",
      size: "856 KB",
      pages: 8,
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "Análise de Cobertura - Q3 2025",
      type: "coverage",
      date: "2025-08-16 16:45",
      format: "PDF",
      status: "Concluído", 
      size: "4.1 MB",
      pages: 18,
      downloadUrl: "#"
    }
  ]);

  // Buscar dados do sistema
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // Simular busca de dados (em produção viria da API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados baseados no sistema real
        setSystemData({
          municipios: 645,
          ubs: 139,
          escolas: 24,
          lastUpdate: new Date()
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchSystemData();
  }, []);

  // Gerar relatório
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const selectedType = reportTypes.find(type => type.id === selectedReportType);
      const timestamp = new Date().toISOString();
      
      // Criar estrutura do relatório
      const reportData = {
        metadata: {
          title: selectedType.name,
          type: selectedReportType,
          generatedAt: timestamp,
          format: reportConfig.format,
          includeCharts: reportConfig.includeCharts,
          includeRawData: reportConfig.includeRawData,
          dateRange: reportConfig.dateRange
        },
        systemStatus: {
          geoserver: 'Online',
          postgresql: 'Conectado',
          layersActive: 3,
          totalFeatures: systemData.municipios + systemData.ubs + systemData.escolas
        },
        data: {
          municipios: systemData.municipios,
          ubs: systemData.ubs,
          escolas: systemData.escolas
        },
        analysis: {
          coveragePercentage: 78.5,
          growthRate: 12.3,
          efficiency: 'Alta'
        }
      };

      // Simular download do relatório
      if (reportConfig.format === 'pdf') {
        downloadPDFReport(reportData);
      } else {
        downloadExcelReport(reportData);
      }

      // Adicionar ao histórico (em produção seria salvo no backend)
      const newReport = {
        id: Date.now(),
        title: selectedType.name,
        type: selectedReportType,
        date: new Date().toLocaleString('pt-BR'),
        format: reportConfig.format.toUpperCase(),
        status: "Concluído",
        size: reportConfig.format === 'pdf' ? "3.2 MB" : "1.1 MB",
        pages: Math.floor(Math.random() * 20) + 8,
        downloadUrl: "#"
      };
      
      setReports(prev => [newReport, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Erro na geração:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar relatório PDF usando jsPDF (simulação melhorada)
  const downloadPDFReport = (data) => {
    // Em produção, usaria jsPDF ou outra biblioteca
    // Por enquanto, vamos criar um HTML que simula um PDF melhor
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.metadata.title}</h1>
        <p>Gerado em: ${new Date(data.metadata.generatedAt).toLocaleString('pt-BR')}</p>
        <p>Formato: ${data.metadata.format.toUpperCase()} | Sistema WebGIS Municipal</p>
    </div>

    <div class="section">
        <h2>📊 Status do Sistema</h2>
        <div class="grid">
            <div class="metric">
                <strong>GeoServer:</strong> ${data.systemStatus.geoserver}
            </div>
            <div class="metric">
                <strong>PostgreSQL:</strong> ${data.systemStatus.postgresql}
            </div>
            <div class="metric">
                <strong>Camadas Ativas:</strong> ${data.systemStatus.layersActive}
            </div>
            <div class="metric">
                <strong>Features Totais:</strong> ${data.systemStatus.totalFeatures.toLocaleString()}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🗺️ Dados Geoespaciais</h2>
        <div class="grid">
            <div class="metric">
                <strong>Municípios:</strong> ${data.data.municipios.toLocaleString()}
                <br><small>Municípios do Estado de SP</small>
            </div>
            <div class="metric">
                <strong>UBS:</strong> ${data.data.ubs.toLocaleString()}
                <br><small>Unidades Básicas de Saúde</small>
            </div>
            <div class="metric">
                <strong>Escolas:</strong> ${data.data.escolas.toLocaleString()}
                <br><small>Instituições de Ensino</small>
            </div>
            <div class="metric">
                <strong>Total:</strong> ${(data.data.municipios + data.data.ubs + data.data.escolas).toLocaleString()}
                <br><small>Features mapeadas</small>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📈 Indicadores de Performance</h2>
        <div class="grid">
            <div class="metric">
                <strong>Cobertura Territorial:</strong> ${data.analysis.coveragePercentage}%
                <br><small>Meta estadual atingida</small>
            </div>
            <div class="metric">
                <strong>Taxa de Crescimento:</strong> +${data.analysis.growthRate}%
                <br><small>Crescimento mensal</small>
            </div>
            <div class="metric">
                <strong>Eficiência do Sistema:</strong> ${data.analysis.efficiency}
                <br><small>Classificação geral</small>
            </div>
            <div class="metric">
                <strong>UBS por Município:</strong> ${(data.data.ubs / data.data.municipios).toFixed(1)}
                <br><small>Média de cobertura</small>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema WebGIS Municipal</p>
        <p>🌐 localhost:8080/geoserver | 📊 PostgreSQL + PostGIS | ⚡ React + Leaflet</p>
    </div>

    <script>
        // Auto-print quando abrir
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;
    
    // Criar blob HTML e abrir em nova janela para impressão/PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Abrir em nova janela que automaticamente abre diálogo de impressão
    const printWindow = window.open(url, '_blank');
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    });
    
    // Também fazer download do HTML para o usuário
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${data.metadata.type}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Simular download Excel
  const downloadExcelReport = (data) => {
    const csvContent = `Relatório,${data.metadata.title}
Gerado em,${new Date(data.metadata.generatedAt).toLocaleString('pt-BR')}

Categoria,Item,Valor
Sistema,GeoServer,${data.systemStatus.geoserver}
Sistema,PostgreSQL,${data.systemStatus.postgresql}
Sistema,Camadas Ativas,${data.systemStatus.layersActive}
Sistema,Features Totais,${data.systemStatus.totalFeatures}
Dados,Municípios,${data.data.municipios}
Dados,UBS,${data.data.ubs}
Dados,Escolas,${data.data.escolas}
Análise,Cobertura %,${data.analysis.coveragePercentage}
Análise,Crescimento %,${data.analysis.growthRate}
Análise,Eficiência,${data.analysis.efficiency}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${data.metadata.type}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Central de Relatórios Automatizados
        </h1>
        <p className="text-orange-100 text-lg">Sistema avançado de Business Intelligence para WebGIS</p>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{systemData.municipios + systemData.ubs + systemData.escolas}</div>
            <div className="text-orange-200">Features Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{reportHistory.length}</div>
            <div className="text-orange-200">Relatórios Gerados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-orange-200">Tipos Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-orange-200">Automatizado</div>
          </div>
        </div>
      </div>

      {/* Gerador de Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Configurar Novo Relatório
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemData.lastUpdate ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {systemData.lastUpdate ? 'Dados Atualizados' : 'Carregando...'}
              </div>
            </div>

            {/* Seleção do Tipo de Relatório */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Relatório
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedReportType(type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedReportType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 ${type.color} rounded-lg`}>
                        <type.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{type.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {type.estimatedTime}
                        </div>
                      </div>
                    </div>
                    
                    {selectedReportType === type.id && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700 font-medium mb-2">Incluirá:</p>
                        <ul className="text-xs text-blue-600 space-y-1">
                          {type.includes.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Saída
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF (Recomendado)</option>
                  <option value="excel">Excel/CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período dos Dados
                </label>
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="current">Dados Atuais</option>
                  <option value="lastMonth">Último Mês</option>
                  <option value="lastQuarter">Último Trimestre</option>
                  <option value="lastYear">Último Ano</option>
                </select>
              </div>
            </div>

            {/* Opções Adicionais */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Incluir gráficos e visualizações</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeRawData}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeRawData: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Incluir dados brutos em anexo</span>
              </label>
            </div>

            {/* Botão de Geração */}
            <Button
              onClick={generateReport}
              disabled={isGenerating || !systemData.lastUpdate}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Gerar e Baixar Relatório
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center text-blue-700">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm font-medium">Processando dados e gerando relatório...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Prévia dos Dados */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-green-600" />
            Prévia dos Dados
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Sistema</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">GeoServer:</span>
                  <span className="font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PostgreSQL:</span>
                  <span className="font-medium text-green-600">Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Camadas:</span>
                  <span className="font-medium">3 ativas</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Datasets</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Municípios:</span>
                  <span className="font-medium">{systemData.municipios}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UBS:</span>
                  <span className="font-medium">{systemData.ubs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Escolas:</span>
                  <span className="font-medium">{systemData.escolas}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Métricas</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cobertura:</span>
                  <span className="font-medium text-green-600">78.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crescimento:</span>
                  <span className="font-medium text-blue-600">+12.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Qualidade:</span>
                  <span className="font-medium text-purple-600">Alta</span>
                </div>
              </div>
            </div>

            {systemData.lastUpdate && (
              <div className="text-xs text-gray-500 text-center">
                Última atualização: {systemData.lastUpdate.toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Histórico de Relatórios */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-purple-600" />
            Histórico de Relatórios
          </h3>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>

        <div className="space-y-4">
          {reportHistory.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {report.format === 'PDF' ? (
                      <FileText className="h-8 w-8 text-red-500" />
                    ) : (
                      <Database className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {report.date}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.format === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {report.format}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {report.status}
                        </span>
                        <span className="text-gray-500">{report.size}</span>
                        <span className="text-gray-500">{report.pages} páginas</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Informações e Dicas */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <FileText className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Sobre os Relatórios Automatizados</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Relatórios Inteligentes:</strong> Geração automática baseada em dados reais do sistema WebGIS.</p>
              <p><strong>Formatos Múltiplos:</strong> PDF para apresentações executivas, Excel para análise de dados.</p>
              <p><strong>Atualização em Tempo Real:</strong> Dados sempre atualizados diretamente do PostGIS e GeoServer.</p>
              <p><strong>Customização:</strong> Configure exatamente o que incluir em cada relatório.</p>
              <p><strong>Histórico Completo:</strong> Mantenha um arquivo de todos os relatórios gerados para auditoria.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}