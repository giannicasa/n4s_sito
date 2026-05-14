import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getSessionId = () => {
  if (typeof window === "undefined") return "ssr";
  let sid = localStorage.getItem("n4s_chat_sid");
  if (!sid) {
    sid = `n4s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("n4s_chat_sid", sid);
  }
  return sid;
};

const initialBubble = {
  role: "assistant",
  content:
    "Ciao, sono N4S — l'assistente AI di not4sale. Dimmi il tuo obiettivo (più lead, più brand, più ricavi) e ti dico da dove partiremmo."
};

export const AIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialBubble]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const sessionId = getSessionId();

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { session_id: sessionId, message: text });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Mi sono perso un secondo. Riprova tra poco, o scrivici da /contatti."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Chiudi assistente AI" : "Apri assistente AI"}
        data-testid="ai-chat-toggle"
        className="fixed bottom-6 right-6 z-[9700] w-14 h-14 rounded-full bg-violet-500 text-white grid place-items-center violet-glow-soft animate-pulse-violet hover:scale-105 transition-transform"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.2, 0.6, 0.2, 1] }}
            className="fixed bottom-24 right-4 md:right-6 z-[9600] w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] glass-strong border border-violet-500/30 rounded-sm overflow-hidden flex flex-col"
            data-testid="ai-chat-widget"
            role="dialog"
            aria-label="Assistente AI not4sale"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <div className="leading-tight">
                <div className="font-display font-bold tracking-wide text-white">N4S · AI</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                  Claude Sonnet 4.5
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`chat-message-${m.role}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-neutral-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-1 items-center text-violet-400 text-xs font-mono uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3 flex items-end gap-2 bg-black/60">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Scrivi al nostro AI..."
                aria-label="Messaggio per l'assistente"
                data-testid="ai-chat-input"
                className="flex-1 resize-none bg-transparent border-b border-white/10 focus:border-violet-500 outline-none text-sm text-white placeholder-neutral-600 py-2 px-1 max-h-28"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Invia messaggio"
                data-testid="ai-chat-send"
                className="w-10 h-10 grid place-items-center bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white hover:bg-violet-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
