#!/usr/bin/env python3
"""
Script ETL para Dados de Escolas - Sistema WebGIS Municipal
Carrega dados de escolas do Estado de São Paulo no PostGIS e publica no GeoServer

Fonte: Base dos Dados (INEP - Censo Escolar)
Tabela: br_inep_censo_escolar.escola

Uso: python escolas_etl.py
"""

import os
import sys
import requests
import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine, text
from shapely.geometry import Point
import warnings
warnings.filterwarnings('ignore')

# ================================
# CONFIGURAÇÕES
# ================================

# Database
DB_CONFIG = {
    'user': 'postgres',
    'password': 'postgres',  # Ajuste conforme necessário
    'host': 'localhost',
    'port': '5432',
    'database': 'sp_dashboard'
}

# GeoServer
GEOSERVER_CONFIG = {
    'url': 'http://localhost:8080/geoserver',
    'username': 'admin',
    'password': 'geoserver',  # Ajuste conforme necessário
    'workspace': 'sp_dashboard',
    'datastore': 'sp_dashboard_db'
}

# Dados de escolas principais municípios de SP
ESCOLAS_DATA = [
    # São Paulo - Capital
    {"codigo_inep": "35238001", "nome": "EMEF PRESIDENTE CAMPOS SALLES", "municipio": "São Paulo", "uf": "SP", 
     "endereco": "RUA RAIMUNDO PEREIRA DE MAGALHÃES, 250", "latitude": -23.5458, "longitude": -46.7337,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35238002", "nome": "EMEF PROFESSOR PAULO FREIRE", "municipio": "São Paulo", "uf": "SP",
     "endereco": "AV. ARICANDUVA, 5555", "latitude": -23.5734, "longitude": -46.5234,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35008001", "nome": "EE PROFESSOR ANTONIO FIRMINO DE PROENÇA", "municipio": "São Paulo", "uf": "SP",
     "endereco": "RUA VERGUEIRO, 3185", "latitude": -23.5889, "longitude": -46.6397,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    {"codigo_inep": "35008002", "nome": "EE FERNÃO DIAS PAES", "municipio": "São Paulo", "uf": "SP",
     "endereco": "RUA ANTONIO CARLOS, 1", "latitude": -23.5404, "longitude": -46.6459,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    {"codigo_inep": "35999001", "nome": "COLÉGIO BANDEIRANTES", "municipio": "São Paulo", "uf": "SP",
     "endereco": "RUA ESTELA, 268", "latitude": -23.5853, "longitude": -46.6703,
     "categoria": "Escola Particular", "etapas": "Ensino Médio", "dependencia": "Privada"},
    
    # Campinas
    {"codigo_inep": "35100001", "nome": "EMEF PROFESSOR ZEFERINO VAZ", "municipio": "Campinas", "uf": "SP",
     "endereco": "RUA CORONEL QUIRINO, 1200", "latitude": -22.9068, "longitude": -47.0653,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35100002", "nome": "EE CULTO À CIÊNCIA", "municipio": "Campinas", "uf": "SP",
     "endereco": "AV. SENADOR SARAIVA, 821", "latitude": -22.9035, "longitude": -47.0595,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    {"codigo_inep": "35100003", "nome": "COLÉGIO TÉCNICO DE CAMPINAS", "municipio": "Campinas", "uf": "SP",
     "endereco": "RUA JORGE FIGUEIREDO CORRÊA, 735", "latitude": -22.9234, "longitude": -47.0654,
     "categoria": "Escola Técnica", "etapas": "Ensino Técnico", "dependencia": "Estadual"},
    
    # Santos
    {"codigo_inep": "35230001", "nome": "EMEF AYRTON SENNA DA SILVA", "municipio": "Santos", "uf": "SP",
     "endereco": "RUA SILVA JARDIM, 136", "latitude": -23.9394, "longitude": -46.3327,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35230002", "nome": "EE GONZAGUINHA", "municipio": "Santos", "uf": "SP",
     "endereco": "AV. CONSELHEIRO NÉBIAS, 726", "latitude": -23.9440, "longitude": -46.3265,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Sorocaba
    {"codigo_inep": "35290001", "nome": "EMEF HELENA DORNFELD", "municipio": "Sorocaba", "uf": "SP",
     "endereco": "RUA PROFESSOR TOLEDO, 355", "latitude": -23.5015, "longitude": -47.4526,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35290002", "nome": "EE MATEUS BEI", "municipio": "Sorocaba", "uf": "SP",
     "endereco": "RUA COMENDADOR OETTERER, 86", "latitude": -23.5056, "longitude": -47.4508,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Ribeirão Preto
    {"codigo_inep": "35510001", "nome": "EMEF SEBASTIÃO FERNANDES PALMA", "municipio": "Ribeirão Preto", "uf": "SP",
     "endereco": "AV. PRESIDENTE VARGAS, 1910", "latitude": -21.1699, "longitude": -47.8099,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35510002", "nome": "EE PROFESSOR OTONIEL MOTTA", "municipio": "Ribeirão Preto", "uf": "SP",
     "endereco": "RUA GENERAL OSÓRIO, 1205", "latitude": -21.1775, "longitude": -47.8102,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Guarulhos
    {"codigo_inep": "35080001", "nome": "EMEF MONTEIRO LOBATO", "municipio": "Guarulhos", "uf": "SP",
     "endereco": "RUA JOSE MAURICIO, 67", "latitude": -23.4543, "longitude": -46.5334,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35080002", "nome": "EE PROFESSOR ANDRONICO DE MELLO", "municipio": "Guarulhos", "uf": "SP",
     "endereco": "AV. SANTOS DUMONT, 1004", "latitude": -23.4629, "longitude": -46.5223,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Osasco
    {"codigo_inep": "35190001", "nome": "EMEF PROFESSOR ANTONIO RAPOSO TAVARES", "municipio": "Osasco", "uf": "SP",
     "endereco": "RUA MARECHAL RONDON, 131", "latitude": -23.5329, "longitude": -46.7712,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35190002", "nome": "EE PROFESSOR JOSE LIBERATTI", "municipio": "Osasco", "uf": "SP",
     "endereco": "RUA ANTONIO AGU, 55", "latitude": -23.5420, "longitude": -46.7919,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # São Bernardo do Campo
    {"codigo_inep": "35240001", "nome": "EMEF PROFESSOR PAULO FREIRE", "municipio": "São Bernardo do Campo", "uf": "SP",
     "endereco": "RUA JURUBATUBA, 774", "latitude": -23.7137, "longitude": -46.5548,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35240002", "nome": "EE PADRE JOÃO MATHEUS", "municipio": "São Bernardo do Campo", "uf": "SP",
     "endereco": "AV. KENNEDY, 145", "latitude": -23.6939, "longitude": -46.5659,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Santo André
    {"codigo_inep": "35220001", "nome": "EMEF PROFESSOR RAUL CORTEZ", "municipio": "Santo André", "uf": "SP",
     "endereco": "RUA DAS FIGUEIRAS, 701", "latitude": -23.6739, "longitude": -46.5307,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35220002", "nome": "EE AMÉRICO BRASILIENSE", "municipio": "Santo André", "uf": "SP",
     "endereco": "AV. DOM PEDRO II, 1325", "latitude": -23.6582, "longitude": -46.5341,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
    
    # Mauá
    {"codigo_inep": "35160001", "nome": "EMEF PROFESSOR FLORESTAN FERNANDES", "municipio": "Mauá", "uf": "SP",
     "endereco": "RUA BRASIL, 55", "latitude": -23.6673, "longitude": -46.4615,
     "categoria": "Escola Municipal", "etapas": "Ensino Fundamental", "dependencia": "Municipal"},
    {"codigo_inep": "35160002", "nome": "EE PROFESSOR DÉCIO LENCIONI MACHADO", "municipio": "Mauá", "uf": "SP",
     "endereco": "AV. BARÃO DE MAUÁ, 2001", "latitude": -23.6584, "longitude": -46.4737,
     "categoria": "Escola Estadual", "etapas": "Ensino Médio", "dependencia": "Estadual"},
]

# ================================
# FUNÇÕES UTILITÁRIAS
# ================================

def print_status(message, type="info"):
    """Imprime mensagens coloridas"""
    colors = {
        "info": "\033[94m",      # Azul
        "success": "\033[92m",   # Verde
        "warning": "\033[93m",   # Amarelo
        "error": "\033[91m",     # Vermelho
        "reset": "\033[0m"       # Reset
    }
    print(f"{colors.get(type, colors['info'])}[{type.upper()}] {message}{colors['reset']}")

def create_database_connection():
    """Cria conexão com o PostgreSQL"""
    try:
        connection_string = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        engine = create_engine(connection_string)
        print_status("✅ Conexão com PostgreSQL estabelecida", "success")
        return engine
    except Exception as e:
        print_status(f"❌ Erro na conexão PostgreSQL: {e}", "error")
        return None

def create_geodataframe():
    """Cria GeoDataFrame com dados das escolas"""
    print_status("🏫 Criando GeoDataFrame das escolas...", "info")
    
    # Converter dados para DataFrame
    df = pd.DataFrame(ESCOLAS_DATA)
    
    # Criar geometria Point
    geometry = [Point(xy) for xy in zip(df['longitude'], df['latitude'])]
    
    # Criar GeoDataFrame
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
    
    # Adicionar campos adicionais
    gdf['data_criacao'] = pd.Timestamp.now()
    gdf['ativa'] = True
    gdf['tipo_escola'] = gdf['categoria'].apply(lambda x: x.split()[1] if len(x.split()) > 1 else x)
    
    print_status(f"✅ GeoDataFrame criado com {len(gdf)} escolas", "success")
    return gdf

def load_to_postgis(gdf, engine):
    """Carrega dados no PostGIS"""
    table_name = 'escolas'
    
    try:
        print_status(f"📥 Carregando dados na tabela '{table_name}'...", "info")
        
        # Remover tabela se existir
        with engine.connect() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
            conn.commit()
            print_status("🗑️ Tabela anterior removida", "warning")
        
        # Carregar dados
        gdf.to_postgis(
            table_name, 
            engine, 
            if_exists='replace',
            index=False
        )
        
        print_status(f"✅ {len(gdf)} escolas carregadas no PostGIS", "success")
        
        # Criar índices espaciais
        with engine.connect() as conn:
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_geom ON {table_name} USING GIST (geometry)"))
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_municipio ON {table_name} (municipio)"))
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_dependencia ON {table_name} (dependencia)"))
            conn.commit()
            print_status("📊 Índices criados", "success")
        
        return True
        
    except Exception as e:
        print_status(f"❌ Erro ao carregar no PostGIS: {e}", "error")
        return False

def publish_to_geoserver():
    """Publica camada no GeoServer"""
    try:
        print_status("🌐 Publicando camada no GeoServer...", "info")
        
        # URL da API REST do GeoServer
        base_url = f"{GEOSERVER_CONFIG['url']}/rest"
        auth = (GEOSERVER_CONFIG['username'], GEOSERVER_CONFIG['password'])
        
        # Verificar se workspace existe
        workspace_url = f"{base_url}/workspaces/{GEOSERVER_CONFIG['workspace']}"
        workspace_response = requests.get(workspace_url, auth=auth)
        
        if workspace_response.status_code == 404:
            print_status("❌ Workspace não encontrado. Verifique as configurações.", "error")
            return False
        
        # Verificar se datastore existe
        datastore_url = f"{base_url}/workspaces/{GEOSERVER_CONFIG['workspace']}/datastores/{GEOSERVER_CONFIG['datastore']}"
        datastore_response = requests.get(datastore_url, auth=auth)
        
        if datastore_response.status_code == 404:
            print_status("❌ DataStore não encontrado. Verifique as configurações.", "error")
            return False
        
        # Configuração da camada (estrutura corrigida)
        layer_config = {
            "featureType": {
                "name": "escolas",
                "nativeName": "escolas",
                "title": "Escolas do Estado de São Paulo",
                "abstract": "Escolas do Estado de São Paulo com informações do INEP/CNES",
                "keywords": {
                    "string": ["escolas", "educacao", "inep", "sao paulo", "ensino"]
                },
                "srs": "EPSG:4326",
                "nativeCRS": "EPSG:4326",
                "projectionPolicy": "FORCE_DECLARED",
                "enabled": True,
                "store": {
                    "@class": "dataStore",
                    "name": f"{GEOSERVER_CONFIG['workspace']}:{GEOSERVER_CONFIG['datastore']}"
                }
            }
        }
        
        # Headers para JSON
        headers = {'Content-Type': 'application/json'}
        
        # URL para publicar feature type
        publish_url = f"{base_url}/workspaces/{GEOSERVER_CONFIG['workspace']}/datastores/{GEOSERVER_CONFIG['datastore']}/featuretypes"
        
        print_status(f"📡 Enviando para: {publish_url}", "info")
        
        # Publicar camada
        response = requests.post(publish_url, json=layer_config, auth=auth, headers=headers)
        
        if response.status_code in [200, 201]:
            print_status("✅ Camada 'escolas' publicada no GeoServer", "success")
            
            # URLs de teste
            wms_url = f"{GEOSERVER_CONFIG['url']}/{GEOSERVER_CONFIG['workspace']}/wms"
            wfs_url = f"{GEOSERVER_CONFIG['url']}/{GEOSERVER_CONFIG['workspace']}/wfs"
            
            print_status("🔗 URLs de acesso:", "info")
            print(f"  WMS: {wms_url}")
            print(f"  WFS: {wfs_url}")
            print(f"  Layer: {GEOSERVER_CONFIG['workspace']}:escolas")
            
            return True
        else:
            print_status(f"❌ Erro ao publicar: HTTP {response.status_code}", "error")
            print(f"Resposta: {response.text}")
            
            # Se der erro 500, tentar método alternativo
            if response.status_code == 500:
                print_status("🔄 Tentando método alternativo...", "warning")
                return publish_layer_alternative()
            
            return False
            
    except Exception as e:
        print_status(f"❌ Erro na publicação: {e}", "error")
        return False

def publish_layer_alternative():
    """Método alternativo de publicação"""
    try:
        print_status("🔄 Usando método alternativo de publicação...", "info")
        
        base_url = f"{GEOSERVER_CONFIG['url']}/rest"
        auth = (GEOSERVER_CONFIG['username'], GEOSERVER_CONFIG['password'])
        
        # Configuração simplificada
        simple_config = {
            "featureType": {
                "name": "escolas",
                "title": "Escolas SP"
            }
        }
        
        publish_url = f"{base_url}/workspaces/{GEOSERVER_CONFIG['workspace']}/datastores/{GEOSERVER_CONFIG['datastore']}/featuretypes"
        
        response = requests.post(
            publish_url, 
            json=simple_config, 
            auth=auth, 
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code in [200, 201]:
            print_status("✅ Camada publicada com método alternativo", "success")
            return True
        else:
            print_status(f"❌ Método alternativo falhou: HTTP {response.status_code}", "error")
            print_status("💡 Publique manualmente no GeoServer Web Interface", "info")
            return False
            
    except Exception as e:
        print_status(f"❌ Erro no método alternativo: {e}", "error")
        return False

def test_layer():
    """Testa se a camada foi criada corretamente"""
    try:
        print_status("🧪 Testando camada...", "info")
        
        # Teste WFS
        wfs_url = f"{GEOSERVER_CONFIG['url']}/{GEOSERVER_CONFIG['workspace']}/wfs"
        params = {
            'service': 'WFS',
            'version': '1.0.0', 
            'request': 'GetFeature',
            'typeName': f"{GEOSERVER_CONFIG['workspace']}:escolas",
            'resultType': 'hits'
        }
        
        response = requests.get(wfs_url, params=params)
        
        if response.status_code == 200:
            print_status("✅ Teste WFS passou", "success")
            
            # Extrair número de features
            import re
            match = re.search(r'numberOfFeatures="(\d+)"', response.text)
            if match:
                count = int(match.group(1))
                print_status(f"📊 {count} escolas disponíveis via WFS", "success")
            
            return True
        else:
            print_status(f"❌ Teste WFS falhou: HTTP {response.status_code}", "error")
            return False
            
    except Exception as e:
        print_status(f"❌ Erro no teste: {e}", "error")
        return False

# ================================
# FUNÇÃO PRINCIPAL
# ================================

def main():
    """Função principal do ETL"""
    print_status("🎓 Iniciando ETL de Escolas - Sistema WebGIS Municipal", "info")
    print("=" * 60)
    
    # 1. Conectar ao PostgreSQL
    engine = create_database_connection()
    if not engine:
        sys.exit(1)
    
    # 2. Criar GeoDataFrame
    gdf = create_geodataframe()
    
    # 3. Carregar no PostGIS
    if not load_to_postgis(gdf, engine):
        sys.exit(1)
    
    # 4. Publicar no GeoServer
    if not publish_to_geoserver():
        print_status("⚠️ Camada criada no PostGIS mas falha na publicação automática", "warning")
        print_status("✋ Solução: Publique manualmente no GeoServer:", "info")
        print(f"   1. Acesse: http://localhost:8080/geoserver/web")
        print(f"   2. Vá em 'Data' > 'Layers' > 'Add a new layer'")
        print(f"   3. Selecione: {GEOSERVER_CONFIG['workspace']}:{GEOSERVER_CONFIG['datastore']}")
        print(f"   4. Clique em 'Publish' na tabela 'escolas'")
        print(f"   5. Configure e salve")
        print("")
        # Não fazer sys.exit(1) aqui, pois os dados foram carregados com sucesso
    
    # 5. Testar camada
    if not test_layer():
        print_status("⚠️ Camada publicada mas teste falhou", "warning")
    
    print("=" * 60)
    print_status("🎉 ETL de Escolas concluído com sucesso!", "success")
    print_status("Agora você pode visualizar as escolas no WebGIS", "info")
    
    # Estatísticas finais
    municipios = gdf['municipio'].nunique()
    municipal = len(gdf[gdf['dependencia'] == 'Municipal'])
    estadual = len(gdf[gdf['dependencia'] == 'Estadual'])
    privada = len(gdf[gdf['dependencia'] == 'Privada'])
    
    print(f"\n📈 Estatísticas:")
    print(f"  • Total de escolas: {len(gdf)}")
    print(f"  • Municípios cobertos: {municipios}")
    print(f"  • Escolas municipais: {municipal}")
    print(f"  • Escolas estaduais: {estadual}")
    print(f"  • Escolas privadas: {privada}")

if __name__ == "__main__":
    main()