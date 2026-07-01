import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api';
import { Badge, Button, Input } from '../../components/ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [estId, setEstId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => setEstId(data.id));
  }, []);

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
      const { data } = await api.post(`/ai/assistant/${estId}`, {
        message: text,
        conversationId: convId,
      });
      setConvId(data.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Erro ao processar sua mensagem.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">🤖 Assistente IA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pergunte qualquer coisa sobre o seu estabelecimento.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-4xl mb-4">🤖</p>
            <p className="text-gray-500 text-sm">
              Olá! Pergunte sobre agendamentos, faturamento, funcionários ou qualquer dado do seu
              negócio.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                'Quantos agendamentos tive este mês?',
                'Qual meu serviço mais popular?',
                'Alguma sugestão para aumentar os agendamentos?',
              ].map((s) => (
                <Badge key={s} tone="blue" onClick={() => setInput(s)} className="hover:bg-blue-100">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
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

      <form onSubmit={send} className="p-4 border-t border-gray-200 bg-white flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre o seu negócio..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
