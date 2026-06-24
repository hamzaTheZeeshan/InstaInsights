import { useChatContext } from '../context/ChatContext';

export default function DashboardPage() {
  const { messages, participants } = useChatContext();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-400">Participants: {participants.join(', ')}</p>
      <p className="text-gray-400">Total messages: {messages.length}</p>
    </div>
  );
}