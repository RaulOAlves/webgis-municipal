import React, { useState, useEffect } from 'react';

const DiagnosticoCamadas = () => {
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(true);

  // URLs para testar
  const geoserverBase = "http://localhost:8080/geoserver";
  const workspace = "sp_dashboard";

  useEffect(() => {
    const executarDiagnostico = async () => {
      setLoading(true);
      const resultados = {};

      console.log("🔍 Iniciando diagnóstico completo...");

      // 1. Testar acesso básico ao GeoServer
      try {
        const response = await fetch(`${geoserverBase}/web`);
        resultados.geoserverAcesso = {
          status: response.status,
          ok: response.ok,
          resultado: response.ok ? "✅ GeoServer acessível" : "❌ GeoServer não acessível"
        };
      } catch (error) {
        resultados.geoserverAcesso = {
          status: "ERRO",
          ok: false,
          resultado: `❌ Erro: ${error.message}`
        };
      }

      // 2. Testar GetCapabilities WMS
      try {
        const wmsUrl = `${geoserverBase}/${workspace}/wms?service=WMS&version=1.1.0&request=GetCapabilities`;
        const response = await fetch(wmsUrl);
        const text = await response.text();
        
        // Procurar por camadas no XML
        const camadas = [];
        const layerMatches = text.match(/<Layer[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<\/Layer>/g);
        
        if (layerMatches) {
          layerMatches.forEach(match => {
            const nameMatch = match.match(/<Name>([^<]+)<\/Name>/);
            if (nameMatch) {
              camadas.push(nameMatch[1]);
            }
          });
        }

        resultados.wmsCapabilities = {
          status: response.status,
          ok: response.ok,
          resultado: response.ok ? `✅ WMS OK - ${camadas.length} camadas encontradas` : "❌ WMS falhou",
          camadas: camadas,
          detalhes: camadas.join(', ')
        };
      } catch (error) {
        resultados.wmsCapabilities = {
          status: "ERRO",
          ok: false,
          resultado: `❌ Erro WMS: ${error.message}`
        };
      }

      // 3. Testar WFS
      try {
        const wfsUrl = `${geoserverBase}/${workspace}/wfs?service=WFS&version=1.0.0&request=GetCapabilities`;
        const response = await fetch(wfsUrl);
        const text = await response.text();
        
        // Procurar por FeatureTypes no XML
        const featureTypes = [];
        const typeMatches = text.match(/<FeatureType>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<\/FeatureType>/g);
        
        if (typeMatches) {
          typeMatches.forEach(match => {
            const nameMatch = match.match(/<Name>([^<]+)<\/Name>/);
            if (nameMatch) {
              featureTypes.push(nameMatch[1]);
            }
          });
        }

        resultados.wfsCapabilities = {
          status: response.status,
          ok: response.ok,
          resultado: response.ok ? `✅ WFS OK - ${featureTypes.length} tipos encontrados` : "❌ WFS falhou",
          camadas: featureTypes,
          detalhes: featureTypes.join(', ')
        };
      } catch (error) {
        resultados.wfsCapabilities = {
          status: "ERRO",
          ok: false,
          resultado: `❌ Erro WFS: ${error.message}`
        };
      }

      // 4. Testar camadas específicas
      const camadasTeste = [
        'sp_dashboard:municipios_sp',
        'sp_dashboard:ubs',
        'municipios_sp',
        'ubs'
      ];

      for (const camada of camadasTeste) {
        try {
          const wfsUrl = `${geoserverBase}/${workspace}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${camada}&maxFeatures=1&outputFormat=application/json`;
          const response = await fetch(wfsUrl);
          
          if (response.ok) {
            const data = await response.json();
            const count = data.features ? data.features.length : 0;
            
            resultados[`camada_${camada.replace(':', '_').replace('sp_dashboard_', '')}`] = {
              status: response.status,
              ok: true,
              resultado: `✅ ${camada} - ${count} feature(s) testadas`,
              dados: data
            };
          } else {
            resultados[`camada_${camada.replace(':', '_').replace('sp_dashboard_', '')}`] = {
              status: response.status,
              ok: false,
              resultado: `❌ ${camada} - HTTP ${response.status}`
            };
          }
        } catch (error) {
          resultados[`camada_${camada.replace(':', '_').replace('sp_dashboard_', '')}`] = {
            status: "ERRO",
            ok: false,
            resultado: `❌ ${camada} - Erro: ${error.message}`
          };
        }
      }

      // 5. Testar URLs WMS diretas (para usar no mapa)
      const urlsTeste = [
        `${geoserverBase}/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=sp_dashboard:ubs&bbox=-48,-24,-45,-21&width=256&height=256&srs=EPSG:4326&format=image/png`,
        `${geoserverBase}/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=ubs&bbox=-48,-24,-45,-21&width=256&height=256&srs=EPSG:4326&format=image/png`
      ];

      for (let i = 0; i < urlsTeste.length; i++) {
        try {
          const response = await fetch(urlsTeste[i]);
          resultados[`wms_url_${i + 1}`] = {
            status: response.status,
            ok: response.ok,
            resultado: response.ok ? `✅ URL WMS ${i + 1} funciona` : `❌ URL WMS ${i + 1} falha`,
            url: urlsTeste[i]
          };
        } catch (error) {
          resultados[`wms_url_${i + 1}`] = {
            status: "ERRO",
            ok: false,
            resultado: `❌ URL WMS ${i + 1} - Erro: ${error.message}`,
            url: urlsTeste[i]
          };
        }
      }

      setResultados(resultados);
      setLoading(false);
      console.log("🔍 Diagnóstico completo:", resultados);
    };

    executarDiagnostico();
  }, []);

  const ResultadoItem = ({ titulo, resultado }) => (
    <div style={{
      background: resultado?.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `2px solid ${resultado?.ok ? '#10b981' : '#ef4444'}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{titulo}</h3>
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
        {resultado?.resultado || 'Testando...'}
      </p>
      {resultado?.detalhes && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
          <strong>Detalhes:</strong> {resultado.detalhes}
        </p>
      )}
      {resultado?.camadas && resultado.camadas.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <strong style={{ fontSize: '0.8rem' }}>Camadas encontradas:</strong>
          <ul style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>
            {resultado.camadas.map((camada, index) => (
              <li key={index} style={{ color: '#6b7280' }}>📄 {camada}</li>
            ))}
          </ul>
        </div>
      )}
      {resultado?.url && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6b7280', wordBreak: 'break-all' }}>
          <strong>URL:</strong> {resultado.url}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>
        🔍 Diagnóstico de Camadas GeoServer
      </h1>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>⏳ Executando diagnóstico completo...</p>
        </div>
      )}

      {!loading && (
        <>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📋 Resumo dos Testes</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Este diagnóstico testa todas as conexões entre React e GeoServer para identificar 
              por que a camada UBS não aparece no mapa.
            </p>
          </div>

          <ResultadoItem 
            titulo="1. 🌐 Acesso ao GeoServer"
            resultado={resultados.geoserverAcesso}
          />

          <ResultadoItem 
            titulo="2. 🗺️ WMS GetCapabilities"
            resultado={resultados.wmsCapabilities}
          />

          <ResultadoItem 
            titulo="3. 📊 WFS GetCapabilities"
            resultado={resultados.wfsCapabilities}
          />

          <ResultadoItem 
            titulo="4. 🏛️ Teste Camada Municípios (completa)"
            resultado={resultados.camada_municipios_sp}
          />

          <ResultadoItem 
            titulo="5. 🏥 Teste Camada UBS (completa)"
            resultado={resultados.camada_ubs}
          />

          <ResultadoItem 
            titulo="6. 🏛️ Teste Camada Municípios (simples)"
            resultado={resultados.camada_municipios_sp}
          />

          <ResultadoItem 
            titulo="7. 🏥 Teste Camada UBS (simples)"
            resultado={resultados.camada_ubs}
          />

          <ResultadoItem 
            titulo="8. 🖼️ Teste URL WMS UBS (completa)"
            resultado={resultados.wms_url_1}
          />

          <ResultadoItem 
            titulo="9. 🖼️ Teste URL WMS UBS (simples)"
            resultado={resultados.wms_url_2}
          />

          {/* Instruções baseadas nos resultados */}
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>💡 Próximos Passos</h2>
            
            {resultados.camada_ubs?.ok ? (
              <div>
                <p style={{ color: '#059669', fontWeight: '600' }}>✅ UBS está funcionando no GeoServer!</p>
                <p>O problema está na configuração do React. Verifique:</p>
                <ul>
                  <li>Nome exato da camada no código React</li>
                  <li>Console do navegador (F12) para erros</li>
                  <li>Network tab para ver requisições bloqueadas</li>
                </ul>
              </div>
            ) : (
              <div>
                <p style={{ color: '#dc2626', fontWeight: '600' }}>❌ UBS não está acessível via WFS!</p>
                <p>Execute novamente o script Python ou verifique:</p>
                <ul>
                  <li>Se dados estão realmente no PostgreSQL</li>
                  <li>Se camada foi publicada corretamente no GeoServer</li>
                  <li>Nome exato da camada no Layer Preview</li>
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              🔄 Executar Diagnóstico Novamente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosticoCamadas;