#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DIAGNÓSTICO DO AMBIENTE WEBGIS MUNICIPAL
Mapear situação atual do projeto antes de continuar
"""

import os
import sys
from pathlib import Path
import subprocess
import json

def print_header(title):
    print("\n" + "=" * 60)
    print(f"🔍 {title}")
    print("=" * 60)

def print_section(title):
    print(f"\n📋 {title}")
    print("-" * 40)

def check_file_exists(filepath):
    if os.path.exists(filepath):
        print(f"✅ {filepath}")
        return True
    else:
        print(f"❌ {filepath} (não encontrado)")
        return False

def get_directory_structure(path, max_depth=2, current_depth=0):
    """Mapear estrutura de diretórios"""
    items = []
    if current_depth >= max_depth:
        return items
    
    try:
        for item in sorted(os.listdir(path)):
            if item.startswith('.'):
                continue
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                items.append(f"{'  ' * current_depth}📁 {item}/")
                items.extend(get_directory_structure(item_path, max_depth, current_depth + 1))
            else:
                items.append(f"{'  ' * current_depth}📄 {item}")
    except PermissionError:
        items.append(f"{'  ' * current_depth}❌ Acesso negado")
    
    return items

def check_command(cmd):
    """Verificar se comando existe"""
    try:
        result = subprocess.run([cmd, '--version'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version = result.stdout.strip().split('\n')[0]
            print(f"✅ {cmd}: {version}")
            return True
    except:
        pass
    
    try:
        result = subprocess.run(['which', cmd], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ {cmd}: {result.stdout.strip()}")
            return True
    except:
        pass
    
    print(f"❌ {cmd}: não encontrado")
    return False

def check_python_packages():
    """Verificar pacotes Python instalados"""
    packages = [
        'basedosdados', 'geopandas', 'psycopg2', 'sqlalchemy', 
        'requests', 'shapely', 'python-dotenv', 'pandas'
    ]
    
    installed = []
    missing = []
    
    for package in packages:
        try:
            __import__(package.replace('-', '_'))
            installed.append(package)
            print(f"✅ {package}")
        except ImportError:
            missing.append(package)
            print(f"❌ {package}")
    
    return installed, missing

def check_env_file(filepath):
    """Analisar arquivo .env"""
    if not os.path.exists(filepath):
        print(f"❌ {filepath} não encontrado")
        return {}
    
    print(f"✅ {filepath} encontrado")
    
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        lines = content.strip().split('\n')
        configs = {}
        
        for line in lines:
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                configs[key.strip()] = value.strip()
        
        print(f"   📊 {len(configs)} configurações encontradas:")
        for key, value in configs.items():
            if 'password' in key.lower() or 'passwd' in key.lower():
                print(f"   🔑 {key}=***")
            else:
                print(f"   📝 {key}={value}")
        
        return configs
    except Exception as e:
        print(f"   ❌ Erro lendo arquivo: {e}")
        return {}

def test_network_connections():
    """Testar conexões de rede"""
    connections = {
        'GeoServer': 'http://localhost:8080/geoserver',
        'PostgreSQL': 'localhost:5432'
    }
    
    for name, url in connections.items():
        try:
            if 'http' in url:
                import urllib.request
                urllib.request.urlopen(url, timeout=5)
                print(f"✅ {name}: {url}")
            else:
                # Testar porta TCP
                import socket
                host, port = url.split(':')
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(3)
                result = sock.connect_ex((host, int(port)))
                sock.close()
                if result == 0:
                    print(f"✅ {name}: {url}")
                else:
                    print(f"❌ {name}: {url} (não acessível)")
        except Exception as e:
            print(f"❌ {name}: {url} (erro: {e})")

def main():
    print_header("DIAGNÓSTICO AMBIENTE WEBGIS MUNICIPAL")
    
    # 1. Informações básicas
    print_section("1. INFORMAÇÕES DO SISTEMA")
    print(f"📍 Diretório atual: {os.getcwd()}")
    print(f"🐍 Python: {sys.version}")
    print(f"💻 Sistema: {os.name}")
    print(f"👤 Usuário: {os.getenv('USER', 'unknown')}")
    
    # 2. Estrutura do projeto
    print_section("2. ESTRUTURA DO PROJETO")
    cwd = os.getcwd()
    structure = get_directory_structure(cwd, max_depth=3)
    for item in structure[:30]:  # Limitar saída
        print(item)
    
    if len(structure) > 30:
        print(f"... e mais {len(structure) - 30} itens")
    
    # 3. Arquivos importantes
    print_section("3. ARQUIVOS IMPORTANTES")
    important_files = [
        'package.json',
        'src/App.js',
        'src/pages/MapViewer.js',
        'scripts/.env',
        'scripts/.env.example',
        'scripts/requirements.txt',
        'scripts/ubs_etl.py',
        '.env',
        '.env.example'
    ]
    
    for file in important_files:
        check_file_exists(file)
    
    # 4. Comandos do sistema
    print_section("4. COMANDOS DISPONÍVEIS")
    commands = ['node', 'npm', 'python3', 'psql', 'curl']
    for cmd in commands:
        check_command(cmd)
    
    # 5. Pacotes Python
    print_section("5. PACOTES PYTHON")
    print("🔍 Verificando ambiente Python atual...")
    print(f"📍 Executável Python: {sys.executable}")
    print(f"📦 Ambiente virtual: {'✅ Ativo' if 'venv' in sys.executable else '❌ Não detectado'}")
    
    installed, missing = check_python_packages()
    
    if missing:
        print(f"\n📋 Pacotes faltando ({len(missing)}):")
        for pkg in missing:
            print(f"   ❌ {pkg}")
    
    # 6. Arquivos de configuração
    print_section("6. CONFIGURAÇÕES")
    
    env_files = ['.env', 'scripts/.env', '.env.example', 'scripts/.env.example']
    configs_found = {}
    
    for env_file in env_files:
        if os.path.exists(env_file):
            print(f"\n🔧 Analisando {env_file}:")
            config = check_env_file(env_file)
            configs_found[env_file] = config
    
    # 7. Conexões de rede
    print_section("7. CONEXÕES DE REDE")
    test_network_connections()
    
    # 8. Resumo e recomendações
    print_header("RESUMO E PRÓXIMOS PASSOS")
    
    # Verificar se React está funcionando
    if check_file_exists('package.json'):
        print("✅ Projeto React detectado")
    
    # Verificar scripts
    if os.path.exists('scripts'):
        print("✅ Pasta scripts existe")
        if os.path.exists('scripts/.env') or os.path.exists('scripts/.env.example'):
            print("✅ Configurações encontradas em scripts/")
        else:
            print("⚠️  Configurações não encontradas em scripts/")
    else:
        print("❌ Pasta scripts não encontrada")
    
    # Verificar ambiente virtual
    if 'venv' in sys.executable:
        print("✅ Ambiente virtual Python ativo")
    else:
        print("⚠️  Ambiente virtual não detectado")
    
    print("\n🎯 PRÓXIMAS AÇÕES RECOMENDADAS:")
    
    if not os.path.exists('scripts'):
        print("1. Criar pasta scripts/")
    
    if 'venv' not in sys.executable:
        print("2. Ativar ambiente virtual Python")
    
    if missing:
        print("3. Instalar pacotes Python faltando")
    
    if not any(os.path.exists(f) for f in ['scripts/.env', '.env']):
        print("4. Configurar arquivo .env")
    
    print("5. Executar script UBS")

if __name__ == "__main__":
    main()