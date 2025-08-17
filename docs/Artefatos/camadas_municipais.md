# 🗺️ Guia Completo: Camadas Essenciais para Município

## 🏛️ **1. ADMINISTRATIVO & TERRITORIAL**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Limites Municipais** | Perímetro oficial do município | IBGE - Malhas Territoriais | SHP |
| **Distritos/Subprefeituras** | Divisões administrativas | Prefeitura Local / IBGE | SHP |
| **Bairros Oficiais** | Limites dos bairros | Prefeitura Local | SHP |
| **Setores Censitários** | Divisões do censo IBGE | IBGE - Censo 2022 | SHP |
| **Loteamentos** | Parcelamento do solo | Prefeitura / Cartório | SHP |
| **Quadras Fiscais** | Cadastro imobiliário | Secretaria da Fazenda | SHP |

### **📍 Fontes de Download:**
- **IBGE**: https://www.ibge.gov.br/geociencias/downloads-geociencias.html
- **Portal Brasileiro de Dados Abertos**: https://dados.gov.br/
- **GeoSampa (SP)**: http://geosampa.prefeitura.sp.gov.br/

---

## 🚗 **2. TRANSPORTE & MOBILIDADE**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Malha Viária** | Ruas, avenidas, estradas | OpenStreetMap / Prefeitura | SHP |
| **Pontos de Ônibus** | Paradas de transporte público | SPTrans / Prefeitura | CSV/SHP |
| **Ciclovias/Ciclofaixas** | Infraestrutura ciclística | Prefeitura / CET | SHP |
| **Estações Metrô/Trem** | Transporte sobre trilhos | CPTM / Metrô | CSV/SHP |
| **Semáforos** | Sinalização semafórica | CET / Prefeitura | CSV |
| **Acidentes de Trânsito** | Ocorrências de trânsito | Detran / CET | CSV |

### **📍 Fontes de Download:**
- **OpenStreetMap**: https://download.geofabrik.de/ (Brasil)
- **SPTrans (SP)**: http://www.sptrans.com.br/desenvolvedores/
- **Portal da Transparência Municipal**: Cada cidade tem o seu

---

## 🏥 **3. SAÚDE**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **UBS - Unidades Básicas** | Postos de saúde | CNES / DataSUS | CSV |
| **Hospitais** | Hospitais públicos e privados | CNES / DataSUS | CSV |
| **Farmácias Populares** | Programa Farmácia Popular | DataSUS | CSV |
| **CAPS** | Centros de Atenção Psicossocial | CNES / DataSUS | CSV |
| **UPA** | Unidades de Pronto Atendimento | CNES / DataSUS | CSV |
| **Laboratórios** | Laboratórios públicos | CNES / DataSUS | CSV |

### **📍 Fontes de Download:**
- **CNES - Cadastro Nacional**: https://cnes.datasus.gov.br/
- **DataSUS**: https://datasus.saude.gov.br/
- **Portal da Saúde**: https://www.gov.br/saude/pt-br

---

## 🎓 **4. EDUCAÇÃO**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Escolas Municipais** | Rede municipal de ensino | INEP / Secretaria Educação | CSV |
| **Escolas Estaduais** | Rede estadual de ensino | INEP / Secretaria Educação | CSV |
| **Escolas Privadas** | Rede particular | INEP | CSV |
| **Creches** | Educação infantil | INEP / Prefeitura | CSV |
| **Universidades** | Ensino superior | INEP / MEC | CSV |
| **Bibliotecas Públicas** | Sistema de bibliotecas | Secretaria Cultura | CSV |

### **📍 Fontes de Download:**
- **INEP**: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos
- **Censo Escolar**: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar

---

## 🌳 **5. MEIO AMBIENTE**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Áreas Verdes** | Parques, praças, jardins | Prefeitura / SNUC | SHP |
| **Unidades de Conservação** | UC federais, estaduais | ICMBio / SNUC | SHP |
| **Hidrografia** | Rios, córregos, nascentes | ANA / IBGE | SHP |
| **Áreas de Risco** | Encostas, inundação | Defesa Civil / CEMADEN | SHP |
| **Cobertura Vegetal** | Mata Atlântica, Cerrado | MapBiomas | SHP/Raster |
| **Pontos de Coleta** | Reciclagem, resíduos | Prefeitura | CSV |

### **📍 Fontes de Download:**
- **ICMBio**: https://www.icmbio.gov.br/portal/geoprocessamento
- **ANA**: https://www.snirh.gov.br/hidroweb/
- **MapBiomas**: https://mapbiomas.org/
- **SNUC**: https://www.mma.gov.br/areas-protegidas/sistema-nacional-de-ucs-snuc

---

## 🏗️ **6. INFRAESTRUTURA & UTILITIES**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Rede Elétrica** | Postes, subestações | Concessionária Local | SHP |
| **Rede de Água** | Tubulações, reservatórios | SABESP / Saneamento | SHP |
| **Rede de Esgoto** | Sistema de esgotamento | SABESP / Saneamento | SHP |
| **Antenas de Telecom** | Torres de telecomunicações | ANATEL | CSV |
| **Iluminação Pública** | Postes, luminárias | Prefeitura | CSV |
| **Pontos de WiFi** | Internet pública | Prefeitura | CSV |

### **📍 Fontes de Download:**
- **ANATEL**: https://www.anatel.gov.br/dadosabertos/
- **Concessionárias Locais**: Site da Enel, CPFL, etc.
- **SNIS - Saneamento**: http://www.snis.gov.br/

---

## 🚔 **7. SEGURANÇA PÚBLICA**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **Delegacias** | Delegacias de polícia | SSP / Polícia Civil | CSV |
| **Batalhões PM** | Polícia Militar | PM Estado | CSV |
| **Câmeras de Segurança** | Monitoramento urbano | Prefeitura | CSV |
| **Ocorrências Criminais** | Dados de criminalidade | SSP / Polícia Civil | CSV |
| **Bombeiros** | Quartéis do Corpo de Bombeiros | Bombeiros Estado | CSV |
| **Defesa Civil** | Pontos da Defesa Civil | Defesa Civil | CSV |

### **📍 Fontes de Download:**
- **SSP-SP**: https://www.ssp.sp.gov.br/transparenciassp/
- **Portal da Transparência**: Cada estado tem o seu
- **IBGE - Perfil Municípios**: https://cidades.ibge.gov.br/

---

## 📊 **8. DADOS SOCIOECONÔMICOS**

### **Essenciais**
| Camada | Descrição | Fonte | Formato |
|--------|-----------|-------|---------|
| **IPTU** | Dados do imposto predial | Secretaria Fazenda | CSV |
| **Empresas** | Cadastro de empresas | Receita Federal / Junta Comercial | CSV |
| **Renda por Setor** | Dados censo demográfico | IBGE - Censo 2022 | CSV |
| **Densidade Populacional** | Habitantes por km² | IBGE | CSV |
| **Mercados/Feiras** | Comércio alimentar | Prefeitura | CSV |
| **Agências Bancárias** | Sistema financeiro | Banco Central | CSV |

### **📍 Fontes de Download:**
- **IBGE - Censo**: https://censo2022.ibge.gov.br/
- **Receita Federal**: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/dados-abertos
- **Banco Central**: https://www.bcb.gov.br/acessoinformacao/dadosabertos

---

## 🎯 **PRIORIZAÇÃO PARA SEU PROJETO**

### **🔥 Implementar PRIMEIRO (Impact Alto)**
1. **Malha Viária** - Base para tudo
2. **UBS/Hospitais** - Saúde pública
3. **Escolas** - Educação
4. **Áreas Verdes** - Meio ambiente
5. **Hidrografia** - Recursos hídricos

### **⚡ Implementar SEGUNDO (Funcionalidade)**
1. **Transporte Público** - Mobilidade
2. **Segurança Pública** - Delegacias/PM
3. **Infraestrutura** - Utilities
4. **Dados Socioeconômicos** - Análises

### **📈 Implementar DEPOIS (Análises Avançadas)**
1. **Setores Censitários** - Demografia
2. **Empresas** - Economia
3. **Ocorrências** - Segurança
4. **Risco Ambiental** - Prevenção

---

## 🛠️ **PROCESSO DE IMPLEMENTAÇÃO**

### **1. Download dos Dados**
```bash
# Criar diretório para dados
mkdir ~/dados_municipais
cd ~/dados_municipais

# Organizar por categoria
mkdir administrativo transporte saude educacao meio_ambiente
```

### **2. Preparação para PostGIS**
```sql
-- Criar schema organizado
CREATE SCHEMA IF NOT EXISTS sp_administrativo;
CREATE SCHEMA IF NOT EXISTS sp_transporte;
CREATE SCHEMA IF NOT EXISTS sp_saude;
CREATE SCHEMA IF NOT EXISTS sp_educacao;
CREATE SCHEMA IF NOT EXISTS sp_meio_ambiente;
```

### **3. Importação via QGIS/ogr2ogr**
```bash
# Exemplo para shapefile
ogr2ogr -f "PostgreSQL" PG:"host=localhost user=postgres dbname=geoserver" arquivo.shp -nln sp_administrativo.distritos

# Exemplo para CSV com coordenadas
ogr2ogr -f "PostgreSQL" PG:"host=localhost user=postgres dbname=geoserver" -oo X_POSSIBLE_NAMES=longitude -oo Y_POSSIBLE_NAMES=latitude arquivo.csv -nln sp_saude.ubs
```

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Administrativo**
- [ ] Distritos/Subprefeituras
- [ ] Bairros oficiais
- [ ] Setores censitários

### **Saúde**
- [ ] UBS (Unidades Básicas)
- [ ] Hospitais
- [ ] Farmácias populares

### **Educação**
- [ ] Escolas municipais
- [ ] Escolas estaduais
- [ ] Creches

### **Transporte**
- [ ] Pontos de ônibus
- [ ] Estações metrô/trem
- [ ] Ciclovias

### **Meio Ambiente**
- [ ] Parques e praças
- [ ] Hidrografia
- [ ] Áreas de risco

---

## 🎯 **RESULTADO ESPERADO**
Com essas camadas, seu sistema terá:
- **Análises espaciais** robustas
- **Dashboard** com dados reais
- **Indicadores** municipais completos
- **Base** para tomada de decisão

**Próximo passo**: Escolher 3-5 camadas prioritárias e implementar no PostGIS + GeoServer!