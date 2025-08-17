#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETL Script: UBS (Unidades Básicas de Saúde) - São Paulo
VERSÃO ALTERNATIVA - Sem dependência da Base dos Dados
Fonte: Dados.gov.br ou dados mockados realistas
Destino: PostGIS → GeoServer → React WebGIS
"""

import os
import sys
from dotenv import load_dotenv
import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine, text
import psycopg2
import requests
from requests.auth import HTTPBasicAuth
import json
from shapely.geometry import Point
import warnings
import random
import urllib.request
warnings.filterwarnings('ignore')

# Carregar variáveis de ambiente
load_dotenv()

# ============================================
# CONFIGURAÇÕES AUTOMÁTICAS DO .ENV
# ============================================

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'sp_dashboard'),
    'username': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD'),
    'schema': os.getenv('DB_SCHEMA', 'public')
}

GEOSERVER_CONFIG = {
    'url': os.getenv('GEOSERVER_URL', 'http://localhost:8080/geoserver'),
    'username': os.getenv('GEOSERVER_USER', 'admin'),
    'password': os.getenv('GEOSERVER_PASSWORD'),
    'workspace': os.getenv('GEOSERVER_WORKSPACE', 'sp_dashboard'),
    'store': 'sp_postgis'
}

def create_connection_string():
    """Criar string de conexão PostgreSQL"""
    return f"postgresql://{DB_CONFIG['username']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

def test_database_connection():
    """Testar conexão com PostgreSQL"""
    try:
        engine = create_engine(create_connection_string())
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ PostgreSQL conectado: {version[:50]}...")
            
            # Verificar PostGIS
            try:
                result = conn.execute(text("SELECT PostGIS_Version()"))
                postgis_version = result.fetchone()[0]
                print(f"✅ PostGIS disponível: {postgis_version}")
            except:
                print("⚠️  PostGIS pode não estar habilitado")
            
        return True
    except Exception as e:
        print(f"❌ Erro conexão PostgreSQL: {e}")
        return False

def ensure_schema_and_postgis():
    """Garantir que schema existe e PostGIS está habilitado"""
    try:
        engine = create_engine(create_connection_string())
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {DB_CONFIG['schema']}"))
            conn.commit()
            print(f"✅ Schema '{DB_CONFIG['schema']}' preparado")
        return True
    except Exception as e:
        print(f"❌ Erro preparando schema: {e}")
        return False

def download_ubs_data_alternative():
    """Baixar dados UBS de fonte alternativa ou criar dados realistas"""
    try:
        print("📥 Criando dados UBS realistas para São Paulo...")
        
        # Lista de municípios reais do Estado de São Paulo (amostra)
        municipios_sp = [
            {'municipio': 'São Paulo', 'lat_base': -23.5505, 'lon_base': -46.6333, 'ubs_count': 150},
            {'municipio': 'Guarulhos', 'lat_base': -23.4538, 'lon_base': -46.5333, 'ubs_count': 35},
            {'municipio': 'Campinas', 'lat_base': -22.9056, 'lon_base': -47.0608, 'ubs_count': 40},
            {'municipio': 'São Bernardo do Campo', 'lat_base': -23.6939, 'lon_base': -46.5650, 'ubs_count': 25},
            {'municipio': 'Santos', 'lat_base': -23.9618, 'lon_base': -46.3322, 'ubs_count': 18},
            {'municipio': 'Osasco', 'lat_base': -23.5320, 'lon_base': -46.7916, 'ubs_count': 22},
            {'municipio': 'Ribeirão Preto', 'lat_base': -21.1775, 'lon_base': -47.8103, 'ubs_count': 30},
            {'municipio': 'Sorocaba', 'lat_base': -23.5014, 'lon_base': -47.4526, 'ubs_count': 28},
            {'municipio': 'Mauá', 'lat_base': -23.6681, 'lon_base': -46.4611, 'ubs_count': 15},
            {'municipio': 'São José dos Campos', 'lat_base': -23.2237, 'lon_base': -45.9009, 'ubs_count': 32},
            {'municipio': 'Diadema', 'lat_base': -23.6862, 'lon_base': -46.6228, 'ubs_count': 12},
            {'municipio': 'Piracicaba', 'lat_base': -22.7253, 'lon_base': -47.6492, 'ubs_count': 20},
            {'municipio': 'Bauru', 'lat_base': -22.3147, 'lon_base': -49.0608, 'ubs_count': 18},
            {'municipio': 'Jundiaí', 'lat_base': -23.1864, 'lon_base': -46.8842, 'ubs_count': 16},
            {'municipio': 'Franca', 'lat_base': -20.5447, 'lon_base': -47.4003, 'ubs_count': 14},
            {'municipio': 'São Vicente', 'lat_base': -23.9631, 'lon_base': -46.3914, 'ubs_count': 10},
            {'municipio': 'Itaquaquecetuba', 'lat_base': -23.4864, 'lon_base': -46.3481, 'ubs_count': 8},
            {'municipio': 'Guarujá', 'lat_base': -23.9933, 'lon_base': -46.2564, 'ubs_count': 12},
            {'municipio': 'Taubaté', 'lat_base': -23.0261, 'lon_base': -45.5556, 'ubs_count': 15},
            {'municipio': 'Limeira', 'lat_base': -22.5647, 'lon_base': -47.4017, 'ubs_count': 13},
        ]
        
        # Tipos de UBS comuns
        tipos_ubs = [
            {'codigo': '01', 'nome': 'POSTO DE SAÚDE'},
            {'codigo': '02', 'nome': 'CENTRO DE SAÚDE'},
            {'codigo': '32', 'nome': 'UNIDADE MISTA'},
            {'codigo': '36', 'nome': 'CLÍNICA ESPECIALIZADA'},
            {'codigo': '70', 'nome': 'CENTRO DE ATENÇÃO PSICOSSOCIAL'},
        ]
        
        # Gerar dados realistas
        dados_ubs = []
        codigo_cnes_base = 2000000
        
        for municipio_info in municipios_sp:
            municipio = municipio_info['municipio']
            lat_base = municipio_info['lat_base']
            lon_base = municipio_info['lon_base']
            ubs_count = municipio_info['ubs_count']
            
            for i in range(ubs_count):
                # Gerar coordenadas próximas ao centro do município
                lat_offset = random.uniform(-0.05, 0.05)
                lon_offset = random.uniform(-0.05, 0.05)
                
                tipo = random.choice(tipos_ubs)
                
                ubs = {
                    'codigo_cnes': codigo_cnes_base + len(dados_ubs),
                    'nome_fantasia': f"UBS {municipio} {i+1:02d}",
                    'codigo_tipo_unidade': tipo['codigo'],
                    'codigo_turno_atendimento': '01',
                    'codigo_estabelecimento_saude': f"SP{random.randint(100000, 999999)}",
                    'codigo_uf': '35',
                    'codigo_municipio': f"35{random.randint(100, 999):03d}",
                    'municipio': municipio,
                    'endereco_estabelecimento': f"Rua das Flores, {random.randint(100, 9999)}",
                    'numero_endereco_estabelecimento': str(random.randint(100, 9999)),
                    'bairro_estabelecimento': f"Bairro {random.choice(['Centro', 'Vila Nova', 'Jardim América', 'Parque', 'Vila São João'])}",
                    'numero_telefone_estabelecimento': f"11{random.randint(90000000, 99999999)}",
                    'latitude': lat_base + lat_offset,
                    'longitude': lon_base + lon_offset,
                    'situacao_funcionamento': 'ATIVO',
                    'data_atualizacao': '2024-12-01',
                    'tipo_ubs': tipo['nome']
                }
                
                dados_ubs.append(ubs)
        
        df = pd.DataFrame(dados_ubs)
        
        print(f"✅ {len(df)} UBS criadas para {len(municipios_sp)} municípios")
        print(f"📊 Distribuição por município:")
        for municipio_info in municipios_sp[:5]:  # Mostrar apenas os 5 primeiros
            count = municipio_info['ubs_count']
            print(f"   📍 {municipio_info['municipio']}: {count} UBS")
        print(f"   ... e mais {len(municipios_sp)-5} municípios")
        
        return df
        
    except Exception as e:
        print(f"❌ Erro criando dados: {e}")
        return None

def process_spatial_data(df):
    """Processar dados espaciais"""
    try:
        print("🌍 Processando dados espaciais...")
        
        # Converter para numeric
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        
        # Remover registros sem coordenadas válidas
        initial_count = len(df)
        df = df.dropna(subset=['latitude', 'longitude'])
        
        print(f"✅ {len(df)} UBS com coordenadas válidas")
        
        # Criar pontos geométricos
        geometry = [Point(lon, lat) for lon, lat in zip(df['longitude'], df['latitude'])]
        
        # Criar GeoDataFrame
        gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
        
        # Limpar dados
        gdf['nome_fantasia'] = gdf['nome_fantasia'].fillna('UBS SEM NOME')
        gdf['endereco_estabelecimento'] = gdf['endereco_estabelecimento'].fillna('')
        gdf['bairro_estabelecimento'] = gdf['bairro_estabelecimento'].fillna('')
        gdf['numero_telefone_estabelecimento'] = gdf['numero_telefone_estabelecimento'].fillna('')
        
        print(f"✅ GeoDataFrame criado com {len(gdf)} UBS")
        return gdf
        
    except Exception as e:
        print(f"❌ Erro processando dados espaciais: {e}")
        return None

def save_to_postgis(gdf):
    """Salvar GeoDataFrame no PostGIS"""
    try:
        print("💾 Salvando no PostGIS...")
        
        engine = create_engine(create_connection_string())
        
        # Salvar no PostGIS
        gdf.to_postgis(
            name='ubs',
            con=engine,
            schema=DB_CONFIG['schema'],
            if_exists='replace',
            index=False
        )
        
        print(f"✅ {len(gdf)} UBS salvas na tabela {DB_CONFIG['schema']}.ubs")
        
        # Criar índices
        with engine.connect() as conn:
            # Índice espacial
            conn.execute(text(f"""
                CREATE INDEX IF NOT EXISTS idx_ubs_geom 
                ON {DB_CONFIG['schema']}.ubs 
                USING GIST (geometry)
            """))
            
            # Índice por município
            conn.execute(text(f"""
                CREATE INDEX IF NOT EXISTS idx_ubs_municipio 
                ON {DB_CONFIG['schema']}.ubs (municipio)
            """))
            
            conn.commit()
        
        print("✅ Índices criados")
        return True
        
    except Exception as e:
        print(f"❌ Erro salvando no PostGIS: {e}")
        return False

def test_geoserver_connection():
    """Testar conexão com GeoServer"""
    try:
        url = f"{GEOSERVER_CONFIG['url']}/rest/about/version"
        auth = HTTPBasicAuth(GEOSERVER_CONFIG['username'], GEOSERVER_CONFIG['password'])
        
        response = requests.get(url, auth=auth, timeout=10)
        
        if response.status_code == 200:
            print("✅ GeoServer conectado e acessível")
            return True
        elif response.status_code == 401:
            print("❌ Erro 401: Verifique usuário/senha do GeoServer no .env")
            return False
        else:
            print(f"❌ GeoServer respondeu com HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro conectando GeoServer: {e}")
        return False

def publish_layer():
    """Publicar camada UBS no GeoServer"""
    try:
        print("🌐 Publicando camada UBS no GeoServer...")
        
        # Primeiro, garantir que temos um datastore PostgreSQL
        datastore_url = f"{GEOSERVER_CONFIG['url']}/rest/workspaces/{GEOSERVER_CONFIG['workspace']}/datastores/{GEOSERVER_CONFIG['store']}"
        
        datastore_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <dataStore>
            <n>{GEOSERVER_CONFIG['store']}</n>
            <connectionParameters>
                <host>{DB_CONFIG['host']}</host>
                <port>{DB_CONFIG['port']}</port>
                <database>{DB_CONFIG['database']}</database>
                <user>{DB_CONFIG['username']}</user>
                <passwd>{DB_CONFIG['password']}</passwd>
                <dbtype>postgis</dbtype>
                <schema>{DB_CONFIG['schema']}</schema>
            </connectionParameters>
        </dataStore>"""
        
        headers = {'Content-Type': 'application/xml'}
        auth = HTTPBasicAuth(GEOSERVER_CONFIG['username'], GEOSERVER_CONFIG['password'])
        
        # Criar/atualizar datastore
        response = requests.put(datastore_url, data=datastore_xml, headers=headers, auth=auth)
        
        if response.status_code in [200, 201]:
            print(f"✅ DataStore '{GEOSERVER_CONFIG['store']}' configurado")
        else:
            print(f"⚠️ DataStore pode já existir (HTTP {response.status_code})")
        
        # Publicar a camada UBS
        layer_url = f"{GEOSERVER_CONFIG['url']}/rest/workspaces/{GEOSERVER_CONFIG['workspace']}/datastores/{GEOSERVER_CONFIG['store']}/featuretypes"
        
        layer_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <featureType>
            <n>ubs</n>
            <nativeName>ubs</nativeName>
            <namespace>
                <n>{GEOSERVER_CONFIG['workspace']}</n>
            </namespace>
            <title>UBS - Unidades Básicas de Saúde SP</title>
            <abstract>Unidades Básicas de Saúde do Estado de São Paulo - Dados Realistas para Demo</abstract>
            <keywords>
                <string>saude</string>
                <string>ubs</string>
                <string>demo</string>
                <string>sao_paulo</string>
            </keywords>
            <srs>EPSG:4326</srs>
            <projectionPolicy>FORCE_DECLARED</projectionPolicy>
            <enabled>true</enabled>
            <store>
                <n>{GEOSERVER_CONFIG['store']}</n>
            </store>
        </featureType>"""
        
        response = requests.post(layer_url, data=layer_xml, headers=headers, auth=auth)
        
        if response.status_code in [200, 201]:
            print(f"✅ Camada 'ubs' publicada no workspace '{GEOSERVER_CONFIG['workspace']}'")
            return True
        elif response.status_code == 401:
            print("❌ Erro 401: Verifique credenciais do GeoServer")
            return False
        else:
            print(f"⚠️ Camada pode já existir (HTTP {response.status_code})")
            return True
            
    except Exception as e:
        print(f"❌ Erro publicando camada: {e}")
        return False

def create_ubs_style():
    """Criar estilo SLD para UBS"""
    try:
        print("🎨 Criando estilo para UBS...")
        
        sld_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <StyledLayerDescriptor version="1.0.0"
            xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
            xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            
            <NamedLayer>
                <n>ubs_style</n>
                <UserStyle>
                    <Title>UBS - Unidades Básicas de Saúde</Title>
                    <Abstract>Estilo para UBS com símbolos verdes de saúde</Abstract>
                    
                    <FeatureTypeStyle>
                        <Rule>
                            <Title>UBS Ativas</Title>
                            <PointSymbolizer>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>circle</WellKnownName>
                                        <Fill>
                                            <CssParameter name="fill">#10b981</CssParameter>
                                            <CssParameter name="fill-opacity">0.8</CssParameter>
                                        </Fill>
                                        <Stroke>
                                            <CssParameter name="stroke">#059669</CssParameter>
                                            <CssParameter name="stroke-width">2</CssParameter>
                                        </Stroke>
                                    </Mark>
                                    <Size>8</Size>
                                </Graphic>
                            </PointSymbolizer>
                        </Rule>
                    </FeatureTypeStyle>
                </UserStyle>
            </NamedLayer>
        </StyledLayerDescriptor>"""
        
        style_name = "ubs_style"
        url = f"{GEOSERVER_CONFIG['url']}/rest/styles/{style_name}"
        
        headers = {'Content-Type': 'application/vnd.ogc.sld+xml'}
        auth = HTTPBasicAuth(GEOSERVER_CONFIG['username'], GEOSERVER_CONFIG['password'])
        
        response = requests.put(url, data=sld_xml, headers=headers, auth=auth)
        
        if response.status_code in [200, 201]:
            print(f"✅ Estilo '{style_name}' criado")
            
            # Aplicar estilo à camada
            layer_url = f"{GEOSERVER_CONFIG['url']}/rest/layers/{GEOSERVER_CONFIG['workspace']}:ubs"
            layer_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <layer>
                <defaultStyle>
                    <n>{style_name}</n>
                </defaultStyle>
            </layer>"""
            
            headers = {'Content-Type': 'application/xml'}
            response = requests.put(layer_url, data=layer_xml, headers=headers, auth=auth)
            
            if response.status_code == 200:
                print("✅ Estilo aplicado à camada UBS")
            
            return True
        else:
            print(f"⚠️ Erro criando estilo (HTTP {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Erro criando estilo: {e}")
        return False

def main():
    """Função principal do ETL"""
    print("=" * 60)
    print("🏥 ETL UBS - Unidades Básicas de Saúde")
    print("📍 Estado de São Paulo (VERSÃO DEMO)")
    print("📊 Dados Realistas → PostGIS → GeoServer")
    print("=" * 60)
    
    # Verificar configurações
    if not DB_CONFIG['password']:
        print("❌ DB_PASSWORD não configurado no .env")
        return False
    
    if not GEOSERVER_CONFIG['password']:
        print("❌ GEOSERVER_PASSWORD não configurado no .env")
        return False
    
    # 1. Testar conexões
    print("\n🔍 1. TESTANDO CONEXÕES")
    if not test_database_connection():
        return False
    
    if not test_geoserver_connection():
        return False
    
    # 2. Preparar ambiente
    print("\n🏗️ 2. PREPARANDO AMBIENTE")
    if not ensure_schema_and_postgis():
        return False
    
    # 3. Criar dados UBS
    print("\n📥 3. CRIANDO DADOS UBS REALISTAS")
    df = download_ubs_data_alternative()
    if df is None or len(df) == 0:
        return False
    
    # 4. Processar dados espaciais
    print("\n🌍 4. PROCESSANDO DADOS ESPACIAIS")
    gdf = process_spatial_data(df)
    if gdf is None or len(gdf) == 0:
        return False
    
    # 5. Salvar no PostGIS
    print("\n💾 5. SALVANDO NO POSTGIS")
    if not save_to_postgis(gdf):
        return False
    
    # 6. Configurar GeoServer
    print("\n🗄️ 6. CONFIGURANDO GEOSERVER")
    if not publish_layer():
        return False
    
    if not create_ubs_style():
        print("⚠️ Estilo não criado, mas camada funcionará")
    
    # 7. Resultado final
    print("\n" + "=" * 60)
    print("🎉 ETL COMPLETO!")
    print(f"✅ {len(gdf)} UBS importadas (dados demo realistas)")
    print(f"✅ Tabela: {DB_CONFIG['schema']}.ubs")
    print(f"✅ Camada: {GEOSERVER_CONFIG['workspace']}:ubs")
    print(f"✅ URL WMS: {GEOSERVER_CONFIG['url']}/{GEOSERVER_CONFIG['workspace']}/wms")
    print("=" * 60)
    
    # URLs para teste
    print("\n🔗 LINKS PARA TESTE:")
    print(f"📊 GeoServer Admin: {GEOSERVER_CONFIG['url']}/web")
    preview_url = f"{GEOSERVER_CONFIG['url']}/{GEOSERVER_CONFIG['workspace']}/wms?service=WMS&version=1.1.0&request=GetMap&layers={GEOSERVER_CONFIG['workspace']}%3Aubs&bbox=-53.1,-25.4,-44.1,-19.8&width=512&height=512&srs=EPSG%3A4326&format=application/openlayers"
    print(f"🗺️ Preview UBS: {preview_url}")
    
    print("\n📈 ESTATÍSTICAS:")
    print(f"🏙️ Municípios com UBS: {gdf['municipio'].nunique()}")
    top_municipios = gdf['municipio'].value_counts().head(5)
    for municipio, count in top_municipios.items():
        print(f"   📍 {municipio}: {count} UBS")
    
    print(f"\n💡 NOTA: Estes são dados realistas criados para demonstração.")
    print(f"   Para dados reais, configure Google Cloud e use o script original.")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🚀 Agora atualize o React para ver as UBS no mapa!")
        print("🔄 Execute: npm start (na pasta raiz do projeto)")
        sys.exit(0)
    else:
        print("\n❌ ETL falhou. Verifique as configurações e tente novamente.")
        sys.exit(1)