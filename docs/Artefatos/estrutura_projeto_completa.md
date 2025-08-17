# 📁 Estrutura do Projeto - Melhores Práticas

## 🏗️ **Estrutura Recomendada**

```
webgis-municipal/                    # Projeto React existente
├── 📂 src/                         # ✅ Já existe - código React
│   ├── components/
│   ├── pages/
│   └── utils/
├── 📂 public/                      # ✅ Já existe
├── 📂 scripts/                     # 🆕 CRIAR - Scripts Python ETL
│   ├── 📂 etl/                     # Scripts de ETL por categoria
│   │   ├── ubs_etl.py             # Script UBS
│   │   ├── escolas_etl.py         # Futuro - escolas
│   │   ├── mapbiomas_etl.py       # Futuro - MapBiomas
│   │   └── __init__.py
│   ├── 📂 config/                  # Configurações
│   │   ├── database.py            # Config banco
│   │   ├── geoserver.py           # Config GeoServer
│   │   └── __init__.py
│   ├── 📂 utils/                   # Utilitários Python
│   │   ├── spatial.py             # Funções espaciais
│   │   ├── geoserver_api.py       # API GeoServer
│   │   └── __init__.py
│   ├── requirements.txt            # Dependências Python
│   ├── .env.example               # Exemplo configurações
│   └── README.md                  # Documentação scripts
├── 📂 data/                        # 🆕 CRIAR - Dados baixados
│   ├── 📂 raw/                     # Dados brutos
│   ├── 📂 processed/              # Dados processados
│   ├── 📂 exports/                # Exports para análise
│   └── .gitignore                 # Não versionar dados grandes
├── 📂 docs/                        # 🆕 CRIAR - Documentação
│   ├── setup.md                   # Guia de instalação
│   ├── api.md                     # Documentação APIs
│   └── deployment.md              # Deploy em produção
├── 📂 styles/                      # 🆕 CRIAR - Estilos SLD
│   ├── ubs_style.sld              # Estilo UBS
│   ├── escolas_style.sld          # Futuro - escolas
│   └── municipios_style.sld       # Estilo municípios
├── .env                           # 🆕 CRIAR - Configurações locais
├── .gitignore                     # ✅ Atualizar - ignorar .env, /data
├── package.json                   # ✅ Já existe
└── README.md                      # ✅ Atualizar - documentação completa
```

---

## 🚀 **Comandos para Criar Estrutura**

### **No diretório `webgis-municipal/`:**

```bash
# Criar diretórios principais
mkdir scripts data docs styles

# Criar subdiretórios para scripts
mkdir scripts/etl scripts/config scripts/utils

# Criar subdiretórios para dados
mkdir data/raw data/processed data/exports

# Criar arquivos iniciais Python
touch scripts/__init__.py
touch scripts/etl/__init__.py
touch scripts/config/__init__.py
touch scripts/utils/__init__.py

# Criar arquivos de configuração
touch scripts/.env.example
touch scripts/requirements.txt
touch scripts/README.md

# Criar .gitignore para dados
echo "*.csv" > data/.gitignore
echo "*.shp" >> data/.gitignore
echo "*.geojson" >> data/.gitignore
echo "*.tif" >> data/.gitignore
echo "raw/*" >> data/.gitignore
echo "processed/*" >> data/.gitignore

# Atualizar .gitignore principal
echo "" >> .gitignore
echo "# Python ETL" >> .gitignore
echo "scripts/.env" >> .gitignore
echo "scripts/__pycache__/" >> .gitignore
echo "scripts/**/__pycache__/" >> .gitignore
echo "" >> .gitignore
echo "# Dados" >> .gitignore
echo "data/raw/*" >> .gitignore
echo "data/processed/*" >> .gitignore
echo "!data/raw/.gitkeep" >> .gitignore
echo "!data/processed/.gitkeep" >> .gitignore
```

---

## 📋 **Vantagens desta Estrutura**

### **✅ Separação Clara de Responsabilidades**
- **`src/`**: Código React (frontend)
- **`scripts/`**: Scripts Python (ETL/backend)
- **`data/`**: Dados locais (não versionados)
- **`docs/`**: Documentação técnica
- **`styles/`**: Estilos SLD organizados

### **✅ Manutenibilidade**
- Scripts organizados por categoria
- Configurações centralizadas
- Utilitários reutilizáveis
- Documentação acessível

### **✅ Escalabilidade**
- Fácil adicionar novos ETLs
- Estrutura preparada para deploy
- Versionamento adequado
- Backup de dados organizado

### **✅ Colaboração**
- README claro para cada módulo
- Configurações de exemplo
- Dependências explícitas
- Git ignore adequado

---

## 🔧 **Próximos Passos**

1. **Executar comandos** para criar estrutura
2. **Mover scripts** para diretórios apropriados
3. **Configurar ambiente Python** virtual
4. **Documentar processo** de setup

---

## 📝 **Arquivos Específicos para Criar**

### **`scripts/requirements.txt`**
```
basedosdados>=2.0.0
geopandas>=0.14.0
psycopg2-binary>=2.9.0
sqlalchemy>=2.0.0
requests>=2.31.0
shapely>=2.0.0
python-dotenv>=1.0.0
```

### **`scripts/.env.example`**
```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sp_dashboard
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SCHEMA=sp_dashboard

# GeoServer Configuration
GEOSERVER_URL=http://localhost:8080/geoserver
GEOSERVER_USE