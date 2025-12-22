# Referência do Projeto: GCP General Control Protocol (GCP Automation Hub)

## 1. Visão Geral
Este sistema é uma **Single Page Application (SPA)** desenvolvida para automatizar a auditoria de campanhas de mídia da **One Station Media**. O objetivo principal é extrair, estruturar e auditar dados de múltiplos documentos (PDFs, E-mails, Excel) para garantir a consistência e conformidade dos planos de mídia.

## 2. Tecnologias Utilizadas
*   **Frontend**: React 18 (via Vite)
*   **Linguagem**: TypeScript
*   **Estilização**: Tailwind CSS
*   **IA Generativa**: Google Gemini (via SDK `@google/genai`)
*   **Chat IA**: `react-markdown` para renderização rica de respostas
*   **Ícones**: Lucide React
*   **Gerenciamento de Estado**: React Hooks (useState, useEffect) + LocalStorage
*   **Gestão de API Keys**:
    *   **Nomes das Variáveis**: 
        - `GEMINI_API_KEY` e `GEMINI_API_KEY2` (processamento de documentos)
        - `GEMINI_API_KEY_CHAT` (chat conversacional)
        - `OPENAI_API_KEY` (reserva, não utilizado atualmente)
    *   **Prod/Vercel**: Variáveis de ambiente configuradas diretamente no painel da Vercel.
    *   **Local**: Arquivo `.env` (não versionado) na raiz do projeto. Necessário reiniciar o servidor após alterações.

## 3. Funcionalidades Principais

### 3.1 Upload e Processamento (`UploadZone.tsx`)
*   Interface para upload de 4 documentos essenciais:
    1.  **PI (Pedido de Inserção)**: PDF oficial da compra de mídia.
    2.  **Proposta**: PDF com o plano de mídia apresentado.
    3.  **E-mail**: Thread de negociação/aprovação (HTML ou PDF).
    4.  **OPEC**: Plano técnico/tabela (Excel/PDF).
*   Conversão automática de arquivos para Base64.
*   Monitoramento de cota de uso da API do Gemini.

### 3.2 Inteligência Artificial (`App.tsx`)
*   Uso da API do Google Gemini (`gemini-3-flash-preview` com fallback para `gemini-3-pro-preview`).
*   **Prompt System**: Persona de "Auditor de Mídia Sênior" para extração rigorosa.
*   **Schema**: Estrutura JSON rígida para garantir tipagem correta dos dados extraídos.
*   **Capacidades**:
    *   Extração linha a linha de estratégias de mídia.
    *   Comparação cruzada (Auditoria) entre documentos.
    *   Detecção de inconsistências (e.g., Valores divergentes entre PI e Proposta).
    *   **Validações Obrigatórias de Auditoria** (configuradas no `systemInstruction`):
        1. **Período de Veiculação**: Consistência de `startDate` e `endDate` entre PI, Proposta e OPEC.
        2. **Budget Líquido**: Comparação do `netValue` em todos os documentos.
        3. **Budget Bruto**: Comparação do `totalBudget` em todos os documentos.
        4. **Meta de Impressões/Views/Cliques**: Verificação da consistência do `impressionGoal`.
        5. **CPM de Venda Líquido**: CPM comercial da Proposta (não o CPM técnico do OPEC).
        6. **Praças/Endereços**: Validação de `targeting.geo` para garantir completude e consistência.
        7. **Meta de CTR ou VTR**: Verificação se a meta está especificada nos KPIs ou estratégias.
        
        > ⚠️ **Nota**: A IA é instruída a criar uma entrada no array `audit` para CADA um desses campos obrigatórios, comparando valores encontrados em PI, Proposta, E-mail e OPEC, marcando `isConsistent: true/false` e incluindo `notes` técnicas sobre divergências.
        
    *   **Tratamento de Dados Ausentes**: Campos não encontrados são marcados como "Não Encontrado" em vez de causar falhas.
    *   **Detecção de Erro 429**: Sistema detecta limite de API e orienta o usuário a aguardar antes de tentar novamente.

### 3.3 Dashboard (`Dashboard.tsx`)
Visualização dos dados processados em abas:
*   **Visão Geral**: Resumo financeiro, datas e status.
*   **Perfil & E-mail**: Detalhes do cliente e resumo da negociação.
*   **Estratégias (PI e Proposta)**: Tabela editável (`InternalPM.tsx`) das táticas de mídia.
*   **Auditoria GCP**: Lista de discrepâncias encontradas pela IA com validações obrigatórias.
*   **Deep Chat IA** (`ChatTab.tsx`): Assistente conversacional para análise profunda:
    - Modelo: Gemini 3 Flash (`gemini-3-flash-preview`)
    - **Limite**: 3 perguntas por projeto (para controle de custos de API)
    - **Persistência**: Histórico salvo no `localStorage` por campanha
    - **Formatação**: Renderização Markdown rica (tabelas, listas, negrito, emojis)
    - **Contexto**: Acesso completo aos dados extraídos da campanha
    - **Contadores**: Badge visual mostrando perguntas restantes

### 3.4 Relatórios (`ReportGenerator.tsx`)
*   Geração de arquivo HTML standalone com o resumo da auditoria.
*   Estilização profissional para envio ao cliente/interno.
*   Inclui todas as seções do dashboard (KPIs, targeting, auditoria, etc.)

## 4. Estrutura de Pastas
*   `/components`: Componentes React modulares
    - `UploadZone.tsx`: Interface de upload
    - `AuditTable.tsx`: Tabela de auditoria
    - `InternalPM.tsx`: Editor de estratégias
    - `/dashboard`: Componentes do dashboard
        - `ChatTab.tsx`: Chat conversacional com IA
        - `OverviewTab.tsx`: Visão geral
        - Outros tabs...
*   `/documento`: Documentação do projeto
    - `referencia_projeto.md`: Este arquivo
    - `instrucoes_desenvolvimento.md`: Diretrizes para desenvolvimento
    - `instrucoes_seguranca.md`: Diretrizes de segurança
*   `App.tsx`: Controlador principal, contém a lógica de integração com a IA.
*   `types.ts`: Definições de tipos TypeScript (Interfaces para CampaignData, StrategyItem, etc.).
*   `constants.ts`: Valores iniciais e constantes do sistema.

## 5. Status Atual do Desenvolvimento
*   ✅ **Frontend**: Estrutura completa e funcional.
*   ✅ **Integração IA**: Implementada com tratamento robusto de erros e retentativas.
*   ✅ **Build**: Configuração do Vite validada e build de produção funcionando (`npm run build`).
*   ✅ **Persistência**: Dados e histórico de chat salvos localmente (`localStorage`) para evitar perda.
*   ✅ **Chat IA**: Sistema conversacional totalmente funcional com formatação profissional.
*   ✅ **Auditoria Obrigatória**: 7 campos críticos sempre validados automaticamente.
*   ✅ **Controle de Custos**: Limite de 3 perguntas por projeto no chat.
*   ✅ **Tratamento de Erros**: Detecção de erro 429 (limite de API) com mensagens claras.

## 6. Próximos Passos Sugeridos
*   Refinamento adicional das regras de validação da IA.
*   Sistema de exportação de dados para integração com outras ferramentas.
*   Dashboard de métricas globais (múltiplas campanhas).
*   Melhorias na UX de edição manual das tabelas extraídas.
*   Sistema de notificações para alertas de auditoria críticos.

## 7. Notas Importantes
*   **Limites de API**: O Google Gemini possui quotas por minuto. Se atingir o limite (erro 429), aguardar 2-3 minutos.
*   **Persistência de Chat**: Cada campanha tem seu próprio histórico isolado no `localStorage`.
*   **Contador de Perguntas**: Armazenado por nome da campanha, pode ser resetado limpando o `localStorage`.
*   **Markdown no Chat**: Suporta tabelas, listas, negrito, itálico, código inline, títulos e emojis.
