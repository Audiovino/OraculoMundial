import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { useMundialAuth } from '../contexts/MundialAuthContext';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface LeagueChatProps {
  ligaId: string;
}

export const LeagueChat: React.FC<LeagueChatProps> = ({ ligaId }) => {
  const { user } = useMundialAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data, error } = await mundialSupabase
      .from('liga_messages')
      .select('id, user_id, username, message, created_at')
      .eq('liga_id', ligaId)
      .order('created_at', { ascending: true })
      .limit(80);

    if (!error && data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [ligaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user?.id || sending) return;

    setSending(true);
    const { error } = await mundialSupabase.from('liga_messages').insert([
      {
        liga_id: ligaId,
        user_id: user.id,
        username: user.username || 'usuario',
        message: trimmed.slice(0, 500),
      },
    ]);

    if (!error) {
      setText('');
      await loadMessages();
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-64 rounded-xl border border-white/10 bg-black/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 bg-white/5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Chat de la liga</p>
        <p className="text-[10px] text-slate-500">Solo entretenimiento · Sin publicidad · Sin datos de terceros</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-500" size={20} />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-500 text-xs py-6">Sé el primero en escribir. ¡Buena suerte con los pronósticos!</p>
        ) : (
          messages.map((m) => {
            const mine = m.user_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    mine ? 'bg-blue-600/40 text-white' : 'bg-white/10 text-slate-200'
                  }`}
                >
                  {!mine && (
                    <p className="text-[10px] font-bold text-purple-300 mb-0.5">{m.username}</p>
                  )}
                  <p className="leading-relaxed break-words">{m.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mensaje..."
          maxLength={500}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-40"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default LeagueChat;
