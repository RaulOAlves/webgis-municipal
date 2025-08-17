# 🏥 Guia Completo: Implementar UBS no WebGIS

## 🎯 **Objetivo**
Adicionar uma camada de **UBS (Unidades Básicas de Saúde)** ao seu sistema WebGIS com dados reais da Base dos Dados.

---

## 📋 **Pré-requisitos**

### ✅ **Verificar se você tem:**
- [ ] Sistema WebGIS React funcionando
- [ ] PostgreSQL rodando com PostGIS
- [ ] GeoServer rodando (localhost:8080)
- [ ] Python 3.8+ instalado

### 🔍 **Verificar status atual:**
```bash
# 1. PostgreSQL
psql --version
# Deve mostrar: psql (PostgreSQL) 17.x

# 2. GeoServer
curl -f http://localhost:8080/geoserver/web
# Deve responder sem erro

# 3. Python
python3 --version
# Deve mostrar: Python 3.8+

# 4. React
cd /Users/raulalves/Desktop/webgis-test/webgis-municipal
npm start
# Deve abrir localhost:3000
```

---

## 🛠️ **Passo 1: Configurar Ambiente Python**

### **1.1 Criar diretório para scripts:**
```bash
cd /Users/raulalves/Desktop/webgis-test/webgis-municipal
mkdir -p scripts
cd scripts
```

### **1.2 Instalar dependências Python:**
```bash
# Salvar requirements.txt (use o conteúdo do artefato anterior)
pip3 install -r requirements.txt

# OU instalar individualmente:
pip3 install basedosdados geopandas psycopg2-binary sqlalchemy requests shapely python-dotenv
```

### **1.3 Configurar variáveis de ambiente:**
```bash
# Criar arquivo .env com suas configurações
cp .env.example .env
nano .env  # ou vim .env

# Editar com suas informações:
# DB_PASSWORD=SUA_SENHA_POSTGRESQL
# GEOSERVER_PASSWORD=SUA_SENHA_ADMIN_GEOSERVER
```

---

## 🔧 **Passo 2: Preparar Banco de Dados**

### **2.1 Conectar no PostgreSQL:**
```bash
psql -h localhost -U postgres -d sp_dashboard
```

### **2.2 Verificar PostGIS:**
```sql
-- No psql, executar:
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
-- Deve mostrar versão do PostGIS

-- Sair do psql
\q
```

### **2.3 Verificar workspace GeoServer:**
1. Acessar: http://localhost:8080/geoserver/web
2. Login: admin / sua_senha
3. Confirmar workspace `sp_dashboard` existe
4. Se não existir, criar novo workspace com URI: `http://sp_dashboard`

---

## 🐍 **Passo 3: Executar Script Python**

### **3.1 Salvar script UBS:**
```bash
# Salvar o script ubs_etl.py (conteúdo do primeiro artefato)
nano ubs_etl.py
# Colar o código completo
```

### **3.2 Configurar suas senhas no script:**
```python
# Editar no início do script:
DB_CONFIG = {
    'password': 'SUA_SENHA_POSTGRESQL',  # ⚠️ EDITAR AQUI
    # ... outras configs
}

GEOSERVER_CONFIG = {
    'password': 'SUA_SENHA_GEOSERVER',  # ⚠️ EDITAR AQUI  
    # ... outras configs
}
```

### **3.3 Executar script:**
```bash
python3 ubs_etl.py
```

### **3.4 Resultado esperado:**
```
🏥 ETL UBS - Unidades Básicas de Saúde
========================================

🔍 1. TESTANDO CONEXÕES
✅ PostgreSQL conectado: PostgreSQL 17.6
✅ PostGIS disponível: 3.x
✅ GeoServer conectado

🏗️ 2. PREPARANDO AMBIENTE
✅ Schema 'sp_saude' criado/verificado

📥 3. BAIXANDO DADOS
✅ 1247 UBS baixadas do Estado de São Paulo

🌍 4. PROCESSANDO DADOS ESPACIAIS
✅ 1247 UBS com dados espaciais válidos

💾 5. SALVANDO NO POSTGIS
✅ 1247 UBS salvas na tabela sp_saude.ubs
✅ Índice espacial criado

🗄️ 6. CONFIGURANDO GEOSERVER
✅ DataStore 'sp_postgis' criado/atualizado
✅ Camada 'ubs' publicada
✅ Estilo aplicado à camada UBS

🎉 ETL COMPLETO!
✅ 1247 UBS importadas
✅ Camada: sp_dashboard:ubs
✅ URL WMS: http://localhost:8080/geoserver/sp_dashboard/wms
```

---

## ⚛️ **Passo 4: Atualizar React**

### **4.1 Substituir MapViewer:**
```bash
cd /Users/raulalves/Desktop/webgis-test/webgis-municipal
# Backup do arquivo atual
cp src/pages/MapViewer.js src/pages/MapViewer.js.backup

# Substituir pelo novo código (use o segundo artefato)
nano src/pages/MapViewer.js
# Colar o código atualizado
```

### **4.2 Verificar se React está rodando:**
```bash
npm start
# Deve abrir localhost:3000
```

---

## 🧪 **Passo 5: Testar Sistema**

### **5.1 Verificar dados no banco:**
```sql
psql -h localhost -U postgres -d sp_dashboard

-- Contar UBS importadas
SELECT COUNT(*) FROM sp_saude.ubs;

-- Ver distribuição por município
SELECT municipio, COUNT(*) as total_ubs 
FROM sp_saude.ubs 
GROUP BY municipio 
ORDER BY total_ubs DESC 
LIMIT 10;

-- Ver amostra dos dados
SELECT codigo_cnes, nome_fantasia, municipio, latitude, longitude 
FROM sp_saude.ubs 
LIMIT 5;
```

### **5.2 Verificar no GeoServer:**
1. **Admin Interface**: http://localhost:8080/geoserver/web
2. **Layer Preview**: Layers → `sp_dashboard:ubs` → OpenLayers
3. **Deve mostrar**: Mapa com pontos verdes espalhados por SP

### **5.3 Verificar no React:**
1. **Abrir**: http://localhost:3000/mapviewer
2. **Verificar controles**: Painel esquerdo com toggle UBS
3. **Ativar UBS**: Clicar no ícone de olho da camada UBS
4. **Ver pontos verdes**: Zoom em São Paulo para ver detalhes

---

## 🎨 **Passo 6: Funcionalidades Disponíveis**

### ✅ **O que funciona agora:**
- **Toggle de camadas**: Liga/desliga municípios e UBS
- **Legenda dinâmica**: Mostra cores e símbolos
- **Contador de features**: Quantas UBS estão carregadas
- **Status em tempo real**: Conexão com GeoServer
- **Design responsivo**: Interface moderna

### 🔄 **Para fazer depois:**
- **GetFeatureInfo**: Clicar UBS → ver detalhes
- **Filtros**: Por município, tipo de UBS
- **Análises espaciais**: Proximidade, cobertura
- **Dashboard**: Gráficos com dados das UBS

---

## 🚨 **Solução de Problemas**

### **❌ Erro: "Module not found"**
```bash
pip3 install [nome-do-módulo]
# ou
pip3 install -r requirements.txt
```

### **❌ Erro: PostgreSQL connection**
```bash
# Verificar se PostgreSQL está rodando
brew services list | grep postgresql
# ou
sudo systemctl status postgresql

# Testar conexão manual
psql -h localhost -U postgres
```

### **❌ Erro: GeoServer Unauthorized (401)**
1. Verificar usuário/senha admin no GeoServer
2. Acessar web admin primeiro: http://localhost:8080/geoserver/web
3. Confirmar que workspace `sp_dashboard` existe

### **❌ UBS não aparecem no mapa**
1. **Verificar toggle**: Camada UBS deve estar ativa (ícone olho)
2. **Fazer zoom**: Aproximar em São Paulo capital
3. **Console do navegador**: F12 → verificar erros JavaScript
4. **Verificar camada**: GeoServer → Layer Preview

### **❌ Script Python falha**
```bash
# Verificar dependências
python3 -c "import basedosdados, geopandas, psycopg2"

# Verificar conexão PostgreSQL
python3 -c "import psycopg2; psycopg2.connect('host=localhost user=postgres')"

# Verificar Base dos Dados
python3 -c "import basedosdados as bd; print(bd.__version__)"
```

---

## 📊 **Dados Obtidos**

### **Campos disponíveis nas UBS:**
- `codigo_cnes`: Código único nacional
- `nome_fantasia`: Nome da unidade  
- `municipio`: Município da UBS
- `endereco_estabelecimento`: Endereço completo
- `numero_telefone_estabelecimento`: Telefone
- `latitude/longitude`: Coordenadas exatas
- `situacao_funcionamento`: Status (ativa/inativa)

### **Possibilidades de análise:**
- **Cobertura municipal**: UBS per capita por cidade
- **Distribuição geográfica**: Áreas bem/mal atendidas  
- **Análises de proximidade**: Distância entre UBS
- **Cruzamento populacional**: Atendimento por habitante

---

## 🎯 **Próximos Passos**

### **Dados para adicionar depois:**
1. **🎓 Escolas**: INEP/Censo Escolar
2. **🌳 MapBiomas**: Uso e cobertura da terra  
3. **🏛️ Equipamentos**: Delegacias, hospitais, etc.

### **Funcionalidades avançadas:**
1. **GetFeatureInfo**: Popup com detalhes ao clicar
2. **Filtros dinâmicos**: Por município, tipo
3. **Análises espaciais**: Buffer, intersect
4. **Dashboard atualizado**: Gráficos com dados reais

---

## ✅ **Checklist Final**

- [ ] Script Python executado com sucesso
- [ ] Dados importados no PostgreSQL (sp_saude.ubs)
- [ ] Camada publicada no GeoServer (sp_dashboard:ubs)
- [ ] React atualizado com novo MapViewer
- [ ] UBS visíveis como pontos verdes no mapa
- [ ] Controles de camadas funcionando
- [ ] Status "Carregada" para UBS no painel

**🎉 Parabéns! Sistema WebGIS com dados reais de saúde funcionando!**

---

## 📞 **Para Suporte**

Se encontrar problemas:
1. **Verificar logs**: Console Python e JavaScript
2. **Testar conexões**: PostgreSQL e GeoServer individualmente
3. **Confirmar configurações**: .env e senhas
4. **Verificar portas**: 5432 (PostgreSQL) e 8080 (GeoServer)

**Sistema funcionando = Base sólida para evoluir com mais dados!** 🚀