
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { CampaignData } from '../../types';

interface ChatTabProps {
    data: CampaignData;
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

type AIModel = 'openai' | 'gemini';

export const ChatTab: React.FC<ChatTabProps> = ({ data }) => {
    const QUESTION_LIMIT = 3;
    const storageKey = `chat_questions_${data.campaignName.replace(/\s+/g, '_')}`;
    const messagesStorageKey = `chat_messages_${data.campaignName.replace(/\s+/g, '_')}`;

    const [questionCount, setQuestionCount] = useState<number>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved) : 0;
    });

    const [messages, setMessages] = useState<Message[]>(() => {
        // Tentar carregar mensagens salvas do localStorage
        const savedMessages = localStorage.getItem(messagesStorageKey);
        if (savedMessages) {
            try {
                return JSON.parse(savedMessages);
            } catch (e) {
                console.error('Erro ao carregar mensagens:', e);
            }
        }

        // Se não houver mensagens salvas, usar mensagem de boas-vindas padrão
        return [
            {
                id: 'welcome',
                role: 'assistant',
                content: `Olá! Sou seu assistente Deep Research. Já analisei todos os documentos desta campanha (${data.clientName} - ${data.campaignName}). \n\nPosso ajudar com:\n- Análise de inconsistências profundas.\n- Resumo executivo dos planos.\n- Comparação de Investimento vs. KPIs.\n- Dúvidas técnicas sobre o OPEC.\n\n⚠️ Limite: ${QUESTION_LIMIT} perguntas por projeto devido a custos de API.\n\nO que você gostaria de saber?`,
                timestamp: new Date()
            }
        ];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Salvar mensagens no localStorage sempre que mudarem
    useEffect(() => {
        localStorage.setItem(messagesStorageKey, JSON.stringify(messages));
    }, [messages, messagesStorageKey]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Verificar limite
        if (questionCount >= QUESTION_LIMIT) {
            alert(`❌ Limite de ${QUESTION_LIMIT} perguntas atingido para este projeto.\n\nMotivo: Custos de API (tokens).\n\n👤 Entre em contato com o administrador do sistema para aumentar o limite ou criar um novo projeto.`);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const context = JSON.stringify(data, null, 2);
            const systemPrompt = `Você é um Auditor de Mídia Sênior e Analista de Dados da One Station Media.
Sua função é realizar um 'Deep Research' nos dados brutos de uma campanha de publicidade extraídos de PDFs (PI, Proposta, OPEC e E-mails).

DADOS DA CAMPANHA (JSON COMPLETO):
${context}

DIRETRIZES:
1. Seja extremamente técnico, analítico e direto.
2. Se encontrar inconsistências nos dados (ex: valores divergentes entre tabelas), aponte-as.
3. Use formatação Markdown (negrito, listas, tabelas) para facilitar a leitura.
4. Responda em Português do Brasil.
5. Se o usuário perguntar algo que não está nos dados, diga que não encontrou a informação nos documentos processados.`;

            const apiKey = process.env.GEMINI_API_KEY_CHAT;
            if (!apiKey) throw new Error("Chave API do Gemini Chat não configurada.");

            const genAI = new GoogleGenAI({ apiKey });
            const conversationHistory = messages
                .filter(m => m.role !== 'system')
                .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
                .join('\n\n');

            const fullPrompt = `${systemPrompt}\n\n--- HISTÓRICO DA CONVERSA ---\n${conversationHistory}\n\nUsuário: ${userMsg.content}`;

            const response = await genAI.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ text: fullPrompt }] },
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 8000
                }
            });

            const responseText = response.text || 'Sem resposta.';

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);

            // Incrementar contador
            const newCount = questionCount + 1;
            setQuestionCount(newCount);
            localStorage.setItem(storageKey, newCount.toString());

        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ Erro: ${error.message || "Falha na comunicação com a IA."}. Verifique as chaves no .env.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const remainingQuestions = QUESTION_LIMIT - questionCount;

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center text-slate-700 font-bold">
                        <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                        GCP Deep Research AI
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${remainingQuestions > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {remainingQuestions > 0 ? `${remainingQuestions} perguntas restantes` : 'Limite atingido'}
                        </span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mx-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>
                                    {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex max-w-[80%]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-sm mx-2">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 bg-white border rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                    <span className="text-xs text-slate-500 font-medium">Analisando documentos...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pergunte sobre inconsistências, valores, totais ou detalhes técnicos..."
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none text-sm shadow-sm"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 bottom-2.5 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-[10px] text-center text-slate-400 mt-2">
                        A IA pode cometer erros. Verifique informações críticas nos documentos originais.
                    </div>
                </div>
            </div>
        </div>
    );
};
