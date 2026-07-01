import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { Badge, Button, Input } from '../../components/ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Establishment {
  id: string;
  name: string;
  description?: string;
}

export default function BookingChat() {
  const { estId } = useParams<{ estId: string }>();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estId) {
      api.get(`/establishments/${estId}`).then(({ data }) => setEstablishment(data));
    }
  }, [estId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !estId || loading) return;

    const text = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await api.post(`/ai/chat/${estId}`, {
        message: text,
        conversationId: convId,
      });
      setConvId(data.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {establishment?.name ?? 'Agendar horário'}
        </h1>
        {establishment?.description && (
          <p className="text-gray-500 text-sm mt-1">{establishment.description}</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-5xl mb-4">👋</p>
              <p className="text-gray-600 font-medium">Olá! Como posso te ajudar?</p>
              <p className="text-gray-400 text-sm mt-1">
                Diga o que você gostaria de agendar e vou te guiar pelo processo.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Quero agendar um horário', 'Quais serviços vocês oferecem?', 'Tem horário disponível amanhã?'].map(
                  (s) => (
                    <Badge key={s} tone="blue" onClick={() => setInput(s)} className="hover:bg-blue-100">
                      {s}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-2 shrink-0 mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">
                AI
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="p-4 border-t border-gray-200 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
