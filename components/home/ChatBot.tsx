"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]); // 1. Mensagem inicial configurada no estado
  const scrollRef = useRef<HTMLDivElement>(null); // Referência para scroll automático

  // Inicializa a mensagem de saudação
  useEffect(() => {
    setMessages([
      { 
        role: 'assistant', 
        content: "Assistente Direx disponível. Informe sua solicitação." 
      }
    ]);
  }, []);

  // Scroll automático para a última mensagem
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

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'qwen3.5:35b-a3b-q4_K_M',
            messages: [...updatedMessages],
            stream: true,
        }),
      });

      if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
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
              content: newMessages[lastIndex].content + chunkText
            };
            return newMessages;
          });
        }
      }

    } catch (error) {
        console.error("Erro:", error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: "Houve um erro técnico na comunicação." };
          return newMessages;
        });
    } finally {
        setIsTyping(false);
    }
  };

  return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        {/* Janela de Chat */}
        {isOpen && (
          // Mantive os seus estilos originais de layout
          <div className="mb-4 w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            
            {/* Cabeçalho Original */}
            <div className="bg-[#0086FF] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/images/assistente-icon.png" alt="Ícone Assistente" className="h-7 w-auto object-contain" />
                <span className="font-bold">Assistente Direx</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            {/* Corpo do Chat */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-[#0073DE] ml-auto text-white' : 'bg-[#F4F6F8] shadow-sm text-black'}`}>
                  
                {msg.role === 'user' ? (
                  <p className="leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none break-words text-black leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>, 
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>, 
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
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
                        pre: ({children, ...props}: any) => (
                          <pre {...props} className="bg-gray-200 p-3 rounded-md my-2 overflow-x-auto font-mono text-xs text-slate-800">
                            {children}
                          </pre>
                        ),
                        code: ({node, className, children, ...props}: any) => {
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
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                </div>
              ))}

              {/* Visualização de "IA pensando" */}
              {isTyping && (
                <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl w-16 mr-auto rounded-tl-none flex gap-1 justify-center items-center shadow-sm">
                  <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full"></span>
                  <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full [animation-delay:0.2s]"></span>
                  <span className="animate-bounce inline-block h-1 w-1 bg-slate-400 rounded-full [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            {/* Input e Botão de Enviar Original */}
            <div className="p-3 border-t flex gap-2 bg-white">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite uma mensagem" 
                className="text-[#838383] flex-1 text-sm outline-none border rounded-full px-3 py-1 focus:border-[#0086FF]"
              />
              <button onClick={sendMessage} className="text-[#0086FF]"><Send size={20} /></button>
            </div>
          </div>
        )}

        {/* Botão Flutuante Original */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#ffffff] p-1 rounded-full shadow-lg text-white border border-gray-300 hover:scale-110 transition-transform active:scale-95"
        >
          <img 
            src="/images/chat-button-icon.png"
            alt="Abrir Chat" 
            className="h-12 w-auto object-contain" 
          />
        </button>
      </div>
    );
  };

export default ChatBot;