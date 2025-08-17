# 🎯 Implementação Completa: UBS no WebGIS

## 📋 **Resumo do Processo**

Vamos implementar uma camada de **UBS (Unidades Básicas de Saúde)** no seu sistema WebGIS usando:
- **Fonte**: Base dos Dados (CNES/DataSUS)
- **Processamento**: Script Python automatizado
- **Destino**: PostGIS → GeoServer → React

---

## 🔧 **Passo 1: Configurar Ambiente**

### **1.1 Verificar Pré-requisitos:**
```bash
# Verificar versões
python --version    # Deve ser 3.8+
psql --version     # PostgreSQL deve estar rodando
```

### **1.2 Instalar Dependências Python:**
```bash
pip install basedosdados geopandas psycopg2-binary sqlalchemy requests shapely
```

### **1.3 Verificar PostgreSQL/PostGIS:**
```sql
-- Conectar no banco e executar:
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

### **1.4 Verificar GeoServer:**
- Acessar: http://localhost:8080/geoserver
- Login: admin / geoserver (ou sua senha)
- Confirmar workspace `sp_dashboard` existe

---

## 🐍 **Passo 2: Executar Script Python**

### **2.1 Baixar e Configurar Script:**
1. Baixe o script `ubs_etl.py` (fornecido no artefato anterior)
2. **EDITE as configurações:**

```python
# SUAS CONFIGURAÇÕES:
DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'SEU_BANCO',     # ⚠️ EDITAR
    'username': 'SEU_USUARIO',   # ⚠️ EDITAR  
    'password': 'SUA_SENHA',     # ⚠️ EDITAR
    'schema': 'sp_saude'
}

GEOSERVER_CONFIG = {
    'url': 'http://localhost:8080/geoserver',
    'username': 'admin',         # ⚠️ EDITAR
    'password': 'SUA_SENHA',     # ⚠️ EDITAR
    'workspace': 'sp_dashboard',
    'store': 'sp_postgis'
}
```

### **2.2 Executar Script:**
```bash
python ubs_etl.py
```

### **2.3 Resultado Esperado:**
```
🎉 ETL COMPLETO!
✅ 1247 UBS importadas
✅ Camada: sp_dashboard:ubs
✅ URL: http://localhost:8080/geoserver/sp_dashboard/wms
```

---

## ⚛️ **Passo 3: Atualizar React**

### **3.1 Substituir `src/pages/MapViewer.js`:**
- Use o código atualizado (fornecido no artefato anterior)
- Inclui controles para a nova camada UBS
- Interface melhorada com legendas

### **3.2 Funcionalidades Adicionadas:**
- ✅ **Toggle UBS**: Liga/desliga camada UBS
- ✅ **Legenda**: Mostra cores e símbolos
- ✅ **Contador**: Quantas camadas estão ativas
- ✅ **Status**: Informações em tempo real
- ✅ **Ícones**: Heart para UBS, Building para municípios

---

## 🧪 **Passo 4: Testar Sistema**

### **4.1 Verificar Dados no PostGIS:**
```sql
-- Verificar se dados foram importados
SELECT COUNT(*) FROM sp_saude.ubs;
SELECT municipio, COUNT(*) FROM sp_saude.ubs GROUP BY municipio ORDER BY COUNT(*) DESC LIMIT 10;
```

### **4.2 Verificar no GeoServer:**
- Admin → Layers → `sp_dashboard:ubs`
- Preview → OpenLayers
- Deve mostrar pontos verdes no mapa

### **4.3 Verificar no React:**
```bash
npm start
```
- Navegar para `/mapviewer`
- Ver controles de camadas
- Toggle UBS liga/desliga pontos verdes
- Zoom em São Paulo para ver detalhes

---

## 🎨 **Passo 5: Personalizar (Opcional)**

### **5.1 Mudar Cor das UBS:**
No script Python, editar SLD:
```xml
<!-- Mudar cor dos pontos -->
<CssParameter name="fill">#ef4444</CssParameter>  <!-- Vermelho -->
<CssParameter name="stroke">#dc2626</CssParameter>
```

### **5.2 Adicionar Mais Informações:**
No React, modificar popup/tooltip:
```javascript
// Adicionar mais campos no getFeatureInfo
"nome_fantasia", "municipio", "endereco_estabelecimento"
```

---

## 📊 **Passo 6: Dados Obtidos**

### **Campos Disponíveis nas UBS:**
- **`codigo_cnes`**: Código único da UBS
- **`nome_fantasia`**: Nome da unidade
- **`municipio`**: Município da UBS
- **`endereco_estabelecimento`**: Endereço completo
- **`numero_telefone_estabelecimento`**: Telefone
- **`latitude/longitude`**: Coordenadas exatas
- **`situacao_funcionamento`**: Status (ativa/inativa)

### **Possibilidades de Análise:**
- **Cobertura por município**: Quantas UBS por cidade
- **Distribuição geográfica**: Áreas bem/mal atendidas
- **Análises de proximidade**: Distância entre UBS
- **Cruzamento com população**: UBS per capita

---

## 🚨 **Resolução de Problemas**

### **Erro: "Module not found"**
```bash
pip install [nome-do-modulo]
```

### **Erro: PostgreSQL Connection**
- Verificar se PostgreSQL está rodando
- Confirmar usuário/senha
- Testar: `psql -h localhost -U postgres`

### **Erro: GeoServer Unauthorized**
- Verificar usuário/senha admin
- Acessar web admin primeiro
- Confirmar workspace existe

### **UBS não aparecem no mapa:**
- Verificar se camada está visível (toggle)
- Fazer zoom em São Paulo
- Verificar console do navegador por erros

---

## 🎯 **Próximos Passos**

Após UBS funcionando:

### **Dados para Implementar Depois:**
1. **🎓 Escolas**: INEP/Censo Escolar
2. **🌍 MapBiomas**: Uso e cobertura da terra
3. **🏛️ Equipamentos públicos**: Diversos

### **Funcionalidades Avançadas:**
1. **GetFeatureInfo**: Clicar UBS → Ver detalhes
2. **Filtros**: Por município, tipo, etc.
3. **Análises**: Buffer, proximidade
4. **Dashboard**: Gráficos com dados reais

---

## ✅ **Checklist Final**

- [ ] Python 3.8+ instalado e bibliotecas
- [ ] PostgreSQL/PostGIS funcionando  
- [ ] GeoServer rodando (localhost:8080)
- [ ] Script configurado com suas senhas
- [ ] Script executado com sucesso
- [ ] React atualizado com novo MapViewer
- [ ] UBS visíveis no mapa como pontos verdes
- [ ] Controles de camadas funcionando

**🎉 Parabéns! Sistema WebGIS com dados reais funcionando!**

---

## 📞 **Para Suporte**

Se encontrar problemas:
1. Verificar logs do script Python
2. Testar cada conexão individualmente  
3. Verificar console do navegador
4. Confirmar todas as configurações

**Sistema funcionando = Base sólida para evoluir!** 🚀