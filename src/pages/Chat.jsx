
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import NewConversationModal from "../components/NewConversationModal.jsx";

export default function Chat() {
  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();

  const [conversationId, setConversationId] = useState(
    urlConversationId || null
  );

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // =========================================
  // Sync conversation ID with URL
  // =========================================

  useEffect(() => {
    setConversationId(urlConversationId || null);
  }, [urlConversationId]);

  // =========================================
  // Load existing conversation messages
  // =========================================

  useEffect(() => {
    if (!urlConversationId) {
      setMessages([]);
      inputRef.current?.focus();
      return;
    }

    fetchMessages(urlConversationId);
  }, [urlConversationId]);

  const fetchMessages = async (id) => {
    try {
      setLoadingMessages(true);

      const response = await api.get(
        `/api/user/conversations/${id}/messages`
      );

      const serverMessages = response.data.messages || [];

      // Convert MongoDB messages into frontend format
      const formattedMessages = serverMessages.map((message) => ({
        id: message._id,
        role: message.role,
        content: message.content,
        status: message.status || "completed",
        sources: message.sources || [],
      }));

      setMessages(formattedMessages);

    } catch (error) {
      console.error(
        "Error loading messages:",
        error.response?.data || error.message
      );

      setMessages([]);

    } finally {
      setLoadingMessages(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // =========================================
  // Auto scroll
  // =========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================================
  // Create conversation
  // =========================================

  const createConversation = async () => {
    try {
      const response = await api.post(
        "/api/user/conversation",
        {
          knowledgeScope: {
            type: "all",
            collectionId: null,
          },
        }
      );

      const conversation = response.data.conversation;

      if (!conversation?._id) {
        throw new Error("Conversation ID was not returned");
      }

      setConversationId(conversation._id);

      // Change URL to the newly created conversation
      navigate(`/chat/${conversation._id}`, {
        replace: true,
      });

      return conversation._id;

    } catch (error) {
      console.error(
        "Error creating conversation:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // =========================================
  // Send message
  // =========================================

  const handleSubmit = async () => {
    if (!question.trim() || loading || loadingMessages) {
      return;
    }

    const currentQuestion = question.trim();

    setQuestion("");
    setLoading(true);

    try {
      // =====================================
      // 1. Get/create conversation
      // =====================================

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        currentConversationId = await createConversation();
      }

      // =====================================
      // 2. Add user message immediately
      // =====================================

      const userMessageId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          content: currentQuestion,
          status: "completed",
          sources: [],
        },
      ]);

      // =====================================
      // 3. Add empty assistant message
      // =====================================

      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          status: "streaming",
          sources: [],
        },
      ]);

      // =====================================
      // 4. Get authentication token
      // =====================================

      const token = localStorage.getItem("authToken");

      // =====================================
      // 5. Start streaming request
      // =====================================

      const response = await fetch(
        `https://devmind-backend-9tu4.onrender.com/api/user/conversations/${currentConversationId}/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            question: currentQuestion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("Streaming is not supported");
      }

      // =====================================
      // 6. Read SSE stream
      // =====================================

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        // SSE events are separated by blank lines
        const events = buffer.split("\n\n");

        // Keep incomplete event
        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data:")) {
            continue;
          }

          const data = event.replace(/^data:\s*/, "");

          try {
            const parsed = JSON.parse(data);

            // =================================
            // TOKEN
            // =================================

            if (parsed.type === "token") {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message.id !== assistantId) {
                    return message;
                  }

                  return {
                    ...message,
                    content:
                      message.content + parsed.content,
                  };
                })
              );
            }

            // =================================
            // DONE
            // =================================

            if (parsed.type === "done") {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message.id !== assistantId) {
                    return message;
                  }

                  return {
                    ...message,
                    status: "completed",
                    sources: parsed.sources || [],
                    serverMessageId: parsed.messageId,
                  };
                })
              );
            }

            // =================================
            // ERROR
            // =================================

            if (parsed.type === "error") {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message.id !== assistantId) {
                    return message;
                  }

                  return {
                    ...message,
                    status: "failed",
                    content:
                      parsed.message ||
                      "Sorry, something went wrong.",
                  };
                })
              );
            }

          } catch (error) {
            console.error(
              "Invalid SSE event:",
              data
            );
          }
        }
      }

    } catch (error) {
      console.error(
        "Streaming error:",
        error
      );

      // Mark assistant message as failed
      setMessages((prev) =>
        prev.map((message) => {
          if (
            message.role !== "assistant" ||
            message.status !== "streaming"
          ) {
            return message;
          }

          return {
            ...message,
            status: "failed",
            content:
              "Sorry, I couldn't generate a response.",
          };
        })
      );

    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // =========================================
  // Keyboard
  // =========================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit();
    }
  };

  // =========================================
  // New Chat
  // =========================================

  const handleNewChat = () => {
    if (loading) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setConversationId(null);

    navigate("/chat");
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // =========================================
  // Render
  // =========================================

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col">

      {/* =====================================
          Header
      ====================================== */}

      <div className="h-16 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-6">

        <div>
          <h1 className="font-semibold text-lg">
            DevMind
          </h1>

          <span className="text-xs text-slate-500">
            AI Knowledge Assistant
          </span>
        </div>

        <button
          onClick={() => setShowNewConversation(true)}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40"
        >
          + New Chat
        </button>

      </div>


      {/* =====================================
          Messages
      ====================================== */}

      <div className="flex-1 overflow-y-auto">

        <div className="max-w-4xl mx-auto px-6 py-8">

          {loadingMessages ? (

            <div className="flex justify-center items-center min-h-[60vh]">

              <div className="flex items-center gap-3 text-slate-400">

                <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

                <span>
                  Loading conversation...
                </span>

              </div>

            </div>

          ) : messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">

              <div className="text-5xl mb-6">
                🧠
              </div>

              <h2 className="text-3xl font-bold">
                Ask DevMind
              </h2>

              <p className="text-slate-400 mt-3 max-w-lg">
                Ask questions about your saved resources,
                documents, URLs, notes and code.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">

                <button
                  onClick={() =>
                    setQuestion(
                      "What information do I have saved in my knowledge base?"
                    )
                  }
                  className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
                >
                  <p className="text-sm font-medium">
                    Explore my knowledge
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Search through your saved resources.
                  </p>
                </button>

                <button
                  onClick={() =>
                    setQuestion(
                      "Summarize the most important information in my resources."
                    )
                  }
                  className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
                >
                  <p className="text-sm font-medium">
                    Summarize my resources
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Get a summary of your knowledge base.
                  </p>
                </button>

              </div>

            </div>

          ) : (

            <div className="space-y-8">

              {messages.map((message) => (

                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[80%]"
                        : "max-w-[85%]"
                    }
                  >

                    {/* Message header */}

                    <div
                      className={
                        message.role === "user"
                          ? "text-right text-xs text-slate-500 mb-2"
                          : "text-xs text-indigo-400 mb-2"
                      }
                    >
                      {message.role === "user"
                        ? "You"
                        : "DevMind"}
                    </div>


                    {/* Message content */}

                    <div
                      className={
                        message.role === "user"
                          ? "bg-indigo-600 rounded-2xl px-5 py-3 whitespace-pre-wrap leading-7"
                          : "text-slate-200 whitespace-pre-wrap leading-7"
                      }
                    >

                      {message.content}

                      {message.status === "streaming" && (
                        <span className="inline-block ml-1 animate-pulse">
                          ▌
                        </span>
                      )}

                    </div>


                    {/* Sources */}

                    {message.role === "assistant" &&
                      message.status === "completed" &&
                      message.sources?.length > 0 && (

                        <div className="mt-4">

                          <p className="text-xs text-slate-500 mb-2">
                            Sources
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {message.sources.map(
                              (source, index) => (

                                <div
                                  key={
                                    source.chunkId ||
                                    source.resourceId ||
                                    index
                                  }
                                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400"
                                >
                                  📄{" "}
                                  {source.title ||
                                    "Resource"}
                                </div>

                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>

                </div>

              ))}

              <div ref={messagesEndRef} />

            </div>

          )}

        </div>

      </div>


      {/* =====================================
          Input
      ====================================== */}

      <div className="flex-shrink-0 border-t border-white/10 bg-slate-950">

        <div className="max-w-4xl mx-auto p-5">

          <div className="flex items-end gap-3">

            <textarea
              ref={inputRef}
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask DevMind..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                loadingMessages ||
                !question.trim()
              }
              className="rounded-xl bg-indigo-600 px-5 py-4 font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? "..." : "Send"}
            </button>

          </div>

          <p className="text-xs text-slate-600 mt-2 text-center">
            Enter to send · Shift + Enter for a new line
          </p>

        </div>

      </div>
      {showNewConversation && (
  <NewConversationModal
    onClose={() => {
      setShowNewConversation(false);
      fetchConversation();
    }}
  />
)}

    </div>
  );
}

