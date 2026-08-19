
import { useState, useEffect } from "react";
import api from "../api/axios.js";

export default function ChatSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch conversations
  const fetchConversation = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/user/conversations");

      console.log("Conversations:", response.data.conversations);

      setConversationHistory(response.data.conversations || []);

    } catch (err) {
      console.error(
        "Error loading conversations:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Load conversations when sidebar mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter conversations
  const filteredConversation = conversationHistory.filter(
    (conversation) =>
      conversation.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="w-72 h-full flex flex-col bg-slate-950 border-r border-slate-800 text-white">

      {/* Header */}
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-bold">
          DevMind
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Your conversations
        </p>
      </div>


      {/* Search */}
      <div className="p-3">

        <label className="block text-sm text-slate-400 mb-2">
          Search your history
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search here..."
          className="p-2.5 w-full rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-indigo-500 text-sm"
        />

      </div>


      {/* New Chat */}
      <div className="px-3">

        <button
          onClick={onNewChat}
          className="p-2.5 w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
        >
          + New Chat
        </button>

      </div>


      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 mt-4">

        {loading ? (

          <div className="flex justify-center py-8">

            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

          </div>

        ) : filteredConversation.length === 0 ? (

          <div className="text-center px-4 py-10">

            <div className="text-3xl mb-3">
              💬
            </div>

            <p className="text-sm text-slate-500">
              No conversations yet
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Start a new chat to get started.
            </p>

          </div>

        ) : (

          <div className="space-y-1">

            {filteredConversation.map((conversation) => {

              const isActive =
                conversation._id === activeConversationId;

              return (

                <button
                  key={conversation._id}
                  onClick={() => {
                    onSelectConversation(conversation._id);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <span className="text-sm">
                      💬
                    </span>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium truncate">
                        {conversation.title || "New Conversation"}
                      </p>

                      <p className="text-xs text-slate-600 mt-1">
                        {conversation.mode || "rag"}
                      </p>

                    </div>

                  </div>

                </button>

              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

