"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Square, Download, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import * as XLSX from 'xlsx';

// Extrai a query oculta do conteúdo da mensagem, se existir
const extrairExcelQuery = (content: string): string | null => {
  const match = content.match(/<!--EXCEL_QUERY:([\s\S]*?)-->/);
  return match ? match[1].trim() : null;
};

// Remove o bloco oculto antes de renderizar o markdown para o usuário
const removerBlocoOculto = (content: string): string => {
  return content.replace(/<!--EXCEL_QUERY:[\s\S]*?-->/g, '').trim();
};

// ─────────────────────────────────────────────────────────────
// Componente de tabela com exportação inteligente
// ─────────────────────────────────────────────────────────────
const TabelaComExportacao = ({
  children,
  excelQuery,
}: {
  children: React.ReactNode;
  excelQuery: string | null;
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [exportando, setExportando] = useState(false);

  const exportarParaExcel = async () => {
    // Se não há query completa disponível, exporta a tabela visual como fallback
    if (!excelQuery) {
      if (!tableRef.current) return;
      const workbook = XLSX.utils.table_to_book(tableRef.current, {
        sheet: "Consulta Agente Nexus",
      });
      XLSX.writeFile(workbook, "Relatorio_Agente_Nexus.xlsx");
      return;
    }

    // Busca os dados completos via API usando a query guardada
    setExportando(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: excelQuery }),
      });

      if (!response.ok) throw new Error("Falha ao buscar dados para exportação");

      const dados: Record<string, unknown>[] = await response.json();

      if (!dados || dados.length === 0) {
        alert("Nenhum dado encontrado para exportação.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Consulta Agente Nexus");
      XLSX.writeFile(workbook, "Relatorio_Agente_Nexus.xlsx");
    } catch (err) {
      console.error("Erro na exportação:", err);
      alert("Erro ao gerar o arquivo Excel. Tente novamente.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="my-4 border border-white/10 rounded-lg overflow-hidden bg-white">
      <div className="flex justify-end bg-white p-2 border-b border-white/10">
        <button
          onClick={exportarParaExcel}
          disabled={exportando}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Baixar como Excel completo"
        >
          {exportando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {exportando ? "Gerando..." : "Exportar EXCEL"}
        </button>
      </div>

      <div className="overflow-x-auto p-1 bg-white">
        <table ref={tableRef} className="min-w-full divide-y divide-gray-200/20 text-xs bg-white">
          {children}
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Componente principal do ChatBot
// ─────────────────────────────────────────────────────────────
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Assistente Nexus disponível. Informe sua solicitação.",
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input };
    setInput('');
    setIsTyping(true);

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3.5:35b-a3b-q4_K_M',
          messages: [...updatedMessages],
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("Sem corpo de resposta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      setIsTyping(false);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: newMessages[lastIndex].content + chunkText,
            };
            return newMessages;
          });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Geração abortada pelo usuário.");
        return;
      }
      console.error("Erro:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: "Houve um erro técnico na comunicação.",
        };
        return newMessages;
      });
    } finally {
      setAbortController(null);
      setIsTyping(false);
    }
  };

  const handleStop = () => {
    if (abortController) abortController.abort();
  };

  // Renderiza o markdown de uma mensagem, injetando a excelQuery no componente de tabela
  const renderMensagem = (content: string) => {
    const excelQuery = extrairExcelQuery(content);
    const conteudoLimpo = removerBlocoOculto(content);

    return (
      <div className="prose prose-sm max-w-none break-words text-black leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            // Injeta a excelQuery capturada no componente de tabela
            table: ({ children }) => (
              <TabelaComExportacao excelQuery={excelQuery}>
                {children}
              </TabelaComExportacao>
            ),
            thead: ({ children }) => <thead className="bg-white">{children}</thead>,
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 whitespace-nowrap border-b border-gray-100">
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
            ),
            pre: ({ children, ...props }: any) => (
              <pre {...props} className="bg-gray-200 p-3 rounded-md my-2 overflow-x-auto font-mono text-xs text-slate-800">
                {children}
              </pre>
            ),
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              return !match ? (
                <code {...props} className="bg-gray-200 px-1 py-0.5 rounded font-mono text-xs text-red-600">
                  {children}
                </code>
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
          }}
        >
          {conteudoLimpo}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-[500px] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          
          {/* Cabeçalho */}
            <div className="bg-[#0086FF] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/images/assistente-icon.png" alt="Ícone Assistente" className="h-7 w-auto object-contain" />
                <span className="font-bold">Assistente Direx</span>
              </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          {/* Corpo */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, i) => {
              if (msg.role !== 'user' && msg.content.trim() === '') return null;

              return (
                <div key={i} className={`p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-[#0073DE] ml-auto text-white' : 'bg-[#F4F6F8] shadow-sm text-black'}`}>
                  {msg.role === 'user' ? (
                    <p className="leading-relaxed">{msg.content}</p>
                  ) : (
                    renderMensagem(msg.content)
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl w-16 mr-auto rounded-tl-none flex gap-1 justify-center items-center shadow-sm">
                <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full"></span>
                <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full [animation-delay:0.2s]"></span>
                <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
              placeholder="Digite uma mensagem"
              className="text-[#838383] flex-1 text-sm outline-none border rounded-full px-3 py-1 focus:border-[#0086FF]"
            />
            <div className="flex items-center justify-end w-[64px]">
              {abortController && isTyping && (
                <button
                  onClick={handleStop}
                  className="w-8 h-8 flex items-center justify-center text-[#0086FF] hover:text-blue-400 transition-colors outline-none"
                  title="Parar geração"
                >
                  <Square size={18} />
                </button>
              )}
              <button
                onClick={sendMessage}
                disabled={isTyping}
                className={`w-8 h-8 flex items-center justify-center transition-colors outline-none ${
                  isTyping ? 'text-gray-600 cursor-not-allowed' : 'text-[#0086FF] hover:text-blue-400'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#ffffff] p-1 rounded-full shadow-lg text-white border border-gray-300 hover:scale-110 transition-transform active:scale-95"
      >
        <img src="/images/chat-button-icon.png" alt="Abrir Chat" className="h-12 w-auto object-contain" />
      </button>
    </div>
  );
};

export default ChatBot;