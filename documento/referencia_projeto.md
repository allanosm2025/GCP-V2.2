# Referência do Projeto: GCP General Control Protocol (GCP Automation Hub)

## 1. Visão Geral
Este sistema é uma **Single Page Application (SPA)** desenvolvida para automatizar a auditoria de campanhas de mídia da **One Station Media**. O objetivo principal é extrair, estruturar e auditar dados de múltiplos documentos (PDFs, E-mails, Excel) para garantir a consistência e conformidade dos planos de mídia.

## 2. Tecnologias Utilizadas
*   **Frontend**: React 19 (via Vite)
*   **Linguagem**: TypeScript
*   **Estilização**: Tailwind CSS v4 (via plugin `@tailwindcss/vite` e variáveis CSS nativas)
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
*   **Interface de Processamento (`FunProcessingView`)**:
    *   Feedback visual com animações e barra de progresso.
    *   **Botão de Cancelamento**: Opção "Cancelar e Limpar Cache" para abortar operações travadas ou limpar estado inconsistente.

### 3.2 Inteligência Artificial (`App.tsx`)
*   **Modelos e Resiliência**:
    *   Sistema de **Fallback Automático** focado na família **Gemini 3 Preview**:
        1. `gemini-3-pro-preview` (Prioridade: Capacidade Cognitiva)
        2. `gemini-3-flash-preview` (Velocidade)
    *   **Backoff Exponencial**: Em caso de erro 429 (Resource Exhausted), o sistema aguarda 10 segundos antes de tentar o próximo modelo.
    *   **Tokens Aumentados**: `maxOutputTokens` configurado para 65000 para suportar grandes volumes de dados extraídos.
*   **Segurança de Dados**:
    *   **Validação Pré-Parse**: O sistema verifica se a resposta da IA é um JSON válido antes de tentar processar, prevenindo falhas de execução (tela branca).
    *   Limpeza automática de blocos de código markdown (```json ... ```) na resposta.
*   **Prompt System**: Persona de "Auditor de Mídia Sênior" para extração rigorosa.
*   **Validações Obrigatórias de Auditoria**:
    1. **Período de Veiculação**: Consistência de `startDate` e `endDate`.
    2. **Budget Líquido**: Comparação do `netValue`.
    3. **Budget Bruto**: Comparação do `totalBudget`.
    4. **Meta de Impressões/Views/Cliques**: Verificação do `impressionGoal`.
    5. **CPM de Venda Líquido**: Validação cruzada de custos.
    6. **Praças/Endereços**: Validação geográfica (`targeting.geo`).
    7. **Meta de CTR ou VTR**: Verificação de KPIs de qualidade.

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

### 3.4 Relatórios (`ReportGenerator.tsx`)
*   Geração de arquivo HTML standalone com o resumo da auditoria.
*   Estilização profissional para envio ao cliente/interno.
*   Inclui todas as seções do dashboard (KPIs, targeting, auditoria, etc.)

## 4. Fluxo de Funcionamento Detalhado
O sistema opera em um pipeline linear com mecanismos de recuperação de falhas:

1.  **Entrada de Dados (Upload)**:
    *   O usuário fornece os arquivos PDF/Excel/Email.
    *   O frontend converte esses arquivos para Base64 sem enviá-los a nenhum servidor intermediário (processamento local/browser -> API Google).

2.  **Orquestração de IA (Extração)**:
    *   Um prompt complexo ("System Instruction") é montado contendo as regras de auditoria e o conteúdo dos arquivos.
    *   **Tentativa 1**: Chama o modelo `gemini-3-pro-preview` (melhor raciocínio).
    *   **Fallback**: Se houver erro de API (429/503) ou resposta inválida, o sistema aguarda 10 segundos e tenta o `gemini-3-flash-preview` (mais rápido).
    *   **Validação**: A resposta bruta é verificada. Se não for um JSON válido, é descartada e o fallback é acionado.

3.  **Pós-Processamento**:
    *   O JSON extraído é limpo (remoção de markdown ` ```json `).
    *   Os dados são normalizados e mesclados com a estrutura de dados padrão da aplicação.
    *   O estado é salvo no `localStorage` para persistência.

4.  **Dashboard e Interação**:
    *   O usuário visualiza os dados estruturados.
    *   Pode editar manualmente qualquer campo (o estado é atualizado em tempo real).
    *   Pode usar o "Deep Chat" para fazer perguntas específicas sobre os documentos (o chat tem seu próprio contexto de IA).

## 5. Estrutura de Pastas
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
*   `src/index.css`: Estilos globais e configuração Tailwind v4 (@theme).
*   `App.tsx`: Controlador principal, contém a lógica de integração com a IA e tratamento de erros.
*   `types.ts`: Definições de tipos TypeScript.
*   `vite.config.ts`: Configuração de build com plugin React e Tailwind.

## 6. Status Atual do Desenvolvimento
*   ✅ **Frontend**: Estrutura completa, migrada para **Tailwind CSS v4**.
*   ✅ **Integração IA**: Sistema robusto com **fallback de múltiplos modelos** e recuperação automática de erros.
*   ✅ **Build**: Configuração do Vite validada e build de produção funcionando (`npm run build`).
*   ✅ **UX**: Animações restauradas e botão de escape para processos travados.
*   ✅ **Persistência**: Dados e histórico de chat salvos localmente (`localStorage`).
*   ✅ **Chat IA**: Sistema conversacional funcional com formatação profissional.
*   ✅ **Auditoria Obrigatória**: 7 campos críticos sempre validados automaticamente.

## 7. Próximos Passos Sugeridos
*   Refinamento adicional das regras de validação da IA.
*   Sistema de exportação de dados para integração com outras ferramentas (CSV/JSON).
*   Dashboard de métricas globais (múltiplas campanhas).
*   Melhorias na UX de edição manual das tabelas extraídas.
*   Sistema de notificações para alertas de auditoria críticos.

## 7. Notas Importantes
*   **Limites de API**: O sistema gerencia automaticamente erros 429 trocando de modelo e aguardando (backoff), mas em casos extremos pode solicitar ao usuário que aguarde.
*   **Tailwind v4**: Não utilize `tailwind.config.js`. Configurações de tema devem ser feitas via CSS variables no `src/index.css` dentro da diretiva `@theme`.
