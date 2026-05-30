import { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ASK_ASSISTANT_MUTATION = gql`
  mutation AskAssistant($message: String!, $history: [MessageInput!]) {
    askAssistant(message: $message, history: $history) {
      text
      draftEvent {
        title
        description
        startDate
        endDate
        location
      }
    }
  }
`;

const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($title: String!, $description: String, $startDate: String!, $endDate: String!, $location: String, $autoFollow: Boolean) {
    createEvent(title: $title, description: $description, startDate: $startDate, endDate: $endDate, location: $location, autoFollow: $autoFollow) {
      id
      title
    }
  }
`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  draftEvent?: {
    title: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    location?: string | null;
  } | null;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Hello! I am your AI Journey Assistant. How can I help you plan your trips or manage your events today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [askAssistant, { loading }] = useMutation(ASK_ASSISTANT_MUTATION);
  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT_MUTATION);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };

    // Format history for the backend (excluding the very first welcome message and any errors)
    const history = messages
      .filter(m => m.id !== '1' && !m.text.includes('Sorry, I encountered an error'))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const { data } = await askAssistant({
        variables: {
          message: userMessage.text,
          history: history.length > 0 ? history : undefined
        }
      });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.askAssistant.text,
        draftEvent: data.askAssistant.draftEvent,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: 'Sorry, I encountered an error while processing your request.' }]);
    }
  };

  const handleConfirmDraft = async (draftEvent: NonNullable<Message['draftEvent']>, messageId: string) => {
    try {
      await createEvent({
        variables: {
          title: draftEvent.title,
          description: draftEvent.description,
          startDate: draftEvent.startDate,
          endDate: draftEvent.endDate,
          location: draftEvent.location,
          autoFollow: true,
        },
        refetchQueries: ['MyEvents', 'JoinedEvents', 'FollowedEvents', 'Events']
      });

      // Update the message to remove the draft since it's confirmed
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, draftEvent: null, text: msg.text + '\n\n**Event Successfully Created!**' }
          : msg
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleCancelDraft = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, draftEvent: null, text: msg.text + '\n\n*(Draft cancelled)*' }
        : msg
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2 shrink-0">
        <Bot className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-semibold">AI Assistant</h2>
          <p className="text-xs text-gray-500">Ask about your events or get help planning your journeys.</p>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className="flex flex-col max-w-[80%] gap-2">
              <div className={`p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                {msg.text}
              </div>

              {msg.draftEvent && (
                <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-2 w-full mt-1">
                  <h3 className="font-semibold text-sm border-b pb-2 mb-2">Draft Event Proposal</h3>
                  <div className="text-sm grid grid-cols-3 gap-y-2">
                    <span className="text-gray-500 font-medium">Title:</span> <span className="col-span-2">{msg.draftEvent.title}</span>
                    <span className="text-gray-500 font-medium">Start:</span> <span className="col-span-2">{new Date(msg.draftEvent.startDate).toLocaleString()}</span>
                    <span className="text-gray-500 font-medium">End:</span> <span className="col-span-2">{new Date(msg.draftEvent.endDate).toLocaleString()}</span>
                    {msg.draftEvent.location && <><span className="text-gray-500 font-medium">Location:</span> <span className="col-span-2">{msg.draftEvent.location}</span></>}
                    {msg.draftEvent.description && <><span className="text-gray-500 font-medium">Desc:</span> <span className="col-span-2">{msg.draftEvent.description}</span></>}
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleCancelDraft(msg.id)} disabled={creating}>Cancel</Button>
                    <Button size="sm" onClick={() => handleConfirmDraft(msg.draftEvent!, msg.id)} disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Confirm & Create
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 flex-row">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-grow"
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}