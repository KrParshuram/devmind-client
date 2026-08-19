import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import NewConversationModal from "../components/NewConversationModal.jsx";

export default function Chat() {
  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();

  // =========================================
  // State
  // =========================================

  const [conversationId, setConversationId] = useState(
    urlConversationId || null
  );

  const [conversation, setConversation] = useState(null);

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showNewConversation, setShowNewConversation] = useState(false);

  const [repoName, setRepoName] = useState("");
  const [collectionName, setCollectionName] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // =========================================
  // Sync URL conversation ID
  // =========================================

  useEffect(() => {
    setConversationId(urlConversationId || null);
  }, [urlConversationId]);

  // =========================================
  // Load conversation
  // =========================================

  useEffect(() => {
    if (!urlConversationId) {
      setConversation(null);
      setMessages([]);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    loadConversation(urlConversationId);
  }, [urlConversationId]);

  // =========================================
  // Load conversation + messages
  // =========================================

  const loadConversation = async (id) => {
    try {
      setLoadingMessages(true);

      // -------------------------------------
      // Get all conversations
      // -------------------------------------

      const conversationResponse = await api.get(
        "/api/user/conversations"
      );

      const conversations =
        conversationResponse.data.conversations || [];

      const currentConversation = conversations.find(
        (item) => String(item._id) === String(id)
      );

      if (!currentConversation) {
        console.error("Conversation not found");

        setConversation(null);
        setMessages([]);

        return;
      }

      setConversation(currentConversation);

      // -------------------------------------
      // Get messages
      // -------------------------------------

      const messageResponse = await api.get(
        `/api/user/conversations/${id}/messages`
      );

      const serverMessages =
        messageResponse.data.messages || [];

      const formattedMessages = serverMessages.map(
        (message) => ({
          id: message._id,
          role: message.role,
          content: message.content,
          status: message.status || "completed",
          sources: message.sources || [],
        })
      );

      setMessages(formattedMessages);

      // -------------------------------------
      // Get display information
      // -------------------------------------

      await loadConversationSource(currentConversation);

    } catch (error) {
      console.error(
        "Error loading conversation:",
        error.response?.data || error.message
      );

      setConversation(null);
      setMessages([]);
    } finally {
      setLoadingMessages(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // =========================================
  // Load repository / collection name
  // =========================================

  const loadConversationSource = async (currentConversation) => {
    const type =
      currentConversation?.knowledgeScope?.type;

    // -------------------------------------
    // Repository
    // -------------------------------------

    if (type === "repository") {
      setCollectionName("");

      const repoId = currentConversation.repoId;

      if (!repoId) {
        setRepoName("Repository");
        return;
      }

      try {
        const response = await api.get(
          "/api/github/repos"
        );

        const repos = response.data.Repos || [];

        const repo = repos.find(
          (item) =>
            String(item._id) === String(repoId)
        );

        if (repo) {
          setRepoName(
            `${repo.owner}/${repo.name}`
          );
        } else {
          setRepoName("Repository");
        }
      } catch (error) {
        console.error(
          "Failed to load repository:",
          error
        );

        setRepoName("Repository");
      }

      return;
    }

    // -------------------------------------
    // Collection
    // -------------------------------------

    if (type === "collection") {
      setRepoName("");

      const collectionId =
        currentConversation.knowledgeScope
          ?.collectionId;

      if (!collectionId) {
        setCollectionName("Collection");
        return;
      }

      try {
        const response = await api.get(
          "/api/collections"
        );

        const collections =
          response.data.collections || [];

        const collection = collections.find(
          (item) =>
            String(item._id) ===
            String(collectionId)
        );

        setCollectionName(
          collection?.name ||
            collection?.title ||
            "Collection"
        );
      } catch (error) {
        console.error(
          "Failed to load collection:",
          error
        );

        setCollectionName("Collection");
      }

      return;
    }

    // -------------------------------------
    // Other conversations
    // -------------------------------------

    setRepoName("");
    setCollectionName("");
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
  // Conversation type
  // =========================================

  const conversationType =
    conversation?.knowledgeScope?.type || "all";

  const isRepositoryChat =
    conversationType === "repository";

  const isCollectionChat =
    conversationType === "collection";

  // =========================================
  // Send message
  // =========================================

  const handleSubmit = async () => {
    if (
      !question.trim() ||
      loading ||
      loadingMessages ||
      !conversationId
    ) {
      return;
    }

    const currentQuestion = question.trim();

    setQuestion("");
    setLoading(true);

    // -------------------------------------
    // Temporary user message
    // -------------------------------------

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

    // -------------------------------------
    // Temporary assistant message
    // -------------------------------------

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

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      // ===================================
      // Decide endpoint
      // ===================================

      let endpoint;

      if (isRepositoryChat) {
        const repoId = conversation?.repoId;

        if (!repoId) {
          throw new Error(
            "Repository ID is missing from conversation"
          );
        }

        endpoint =
          `http://localhost:3000/api/github/repos/${repoId}/chat`;
      } else {
        endpoint =
          `http://localhost:3000/api/user/conversations/${conversationId}/messages`;
      }

      // ===================================
      // SSE request
      // ===================================

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          question: currentQuestion,

          // Repository endpoint needs this.
          // Normal endpoint can simply ignore it.
          conversationId,
        }),
      });

      if (!response.ok) {
        let message =
          `Request failed with status ${response.status}`;

        try {
          const errorData =
            await response.json();

          message =
            errorData.message ||
            errorData.error ||
            message;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error(
          "Streaming is not supported"
        );
      }

      // ===================================
      // Read SSE
      // ===================================

      const reader =
        response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data:")) {
            continue;
          }

          const data =
            event.replace(
              /^data:\s*/,
              ""
            );

          try {
            const parsed =
              JSON.parse(data);

            // =================================
            // Repository conversation created
            // =================================

            if (
              parsed.type ===
              "conversation"
            ) {
              if (
                parsed.conversationId &&
                !conversationId
              ) {
                navigate(
                  `/chat/${parsed.conversationId}`,
                  { replace: true }
                );
              }
            }

            // =================================
            // Token
            // =================================

            if (
              parsed.type === "token"
            ) {
              setMessages((prev) =>
                prev.map((message) => {
                  if (
                    message.id !==
                    assistantId
                  ) {
                    return message;
                  }

                  return {
                    ...message,

                    content:
                      message.content +
                      parsed.content,

                    status: "streaming",
                  };
                })
              );
            }

            // =================================
            // Done
            // =================================

            if (
              parsed.type === "done"
            ) {
              setMessages((prev) =>
                prev.map((message) => {
                  if (
                    message.id !==
                    assistantId
                  ) {
                    return message;
                  }

                  return {
                    ...message,

                    status:
                      "completed",

                    sources:
                      parsed.sources ||
                      [],

                    serverMessageId:
                      parsed.messageId,
                  };
                })
              );
            }

            // =================================
            // Error
            // =================================

            if (
              parsed.type === "error"
            ) {
              setMessages((prev) =>
                prev.map((message) => {
                  if (
                    message.id !==
                    assistantId
                  ) {
                    return message;
                  }

                  return {
                    ...message,

                    status: "failed",

                    content:
                      parsed.message ||
                      "Failed to generate response.",
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
        "Chat streaming error:",
        error
      );

      setMessages((prev) =>
        prev.map((message) => {
          if (
            message.id !== assistantId
          ) {
            return message;
          }

          return {
            ...message,

            status: "failed",

            content:
              error.message ||
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
  // New chat
  // =========================================

  const handleNewChat = () => {
    if (loading) return;

    setMessages([]);
    setConversation(null);
    setConversationId(null);
    setQuestion("");

    navigate("/chat");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // =========================================
  // Header information
  // =========================================

  const getChatInfo = () => {
    if (isRepositoryChat) {
      return {
        icon: "📦",
        type: "Repository Chat",
        name: repoName || "Repository",
      };
    }

    if (isCollectionChat) {
      return {
        icon: "📁",
        type: "RAG Chat",
        name: collectionName || "Collection",
      };
    }

    if (conversationType === "none") {
      return {
        icon: "💬",
        type: "General Chat",
        name: "No Resources",
      };
    }

    return {
      icon: "🧠",
      type: "RAG Chat",
      name: "All Resources",
    };
  };

  const chatInfo = getChatInfo();

  // =========================================
  // Render
  // =========================================

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col">

      {/* =====================================
          Header
      ====================================== */}

      <div className="h-16 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-6">

        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center">
            {chatInfo.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">

              <h1 className="font-semibold text-sm">
                {chatInfo.type}
              </h1>

            </div>

            <p className="text-xs text-slate-400 truncate max-w-[400px]">
              {chatInfo.name}
            </p>
          </div>

        </div>

        <button
          onClick={() =>
            setShowNewConversation(true)
          }
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

              <div className="text-5xl mb-5">
                {chatInfo.icon}
              </div>

              <h2 className="text-2xl font-bold">
                {chatInfo.type}
              </h2>

              <p className="text-indigo-400 mt-2 font-medium">
                {chatInfo.name}
              </p>

              <p className="text-slate-500 mt-3 max-w-lg">
                {isRepositoryChat
                  ? "Ask questions about the code and architecture of this repository."
                  : isCollectionChat
                  ? "Ask questions about the resources in this collection."
                  : conversationType === "none"
                  ? "Have a normal conversation with DevMind."
                  : "Ask questions about your saved knowledge."}
              </p>

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

                    {/* Message */}

                    <div
                      className={
                        message.role === "user"
                          ? "bg-indigo-600 rounded-2xl px-5 py-3 whitespace-pre-wrap leading-7"
                          : "text-slate-200 whitespace-pre-wrap leading-7"
                      }
                    >

                      {message.content}

                      {message.status ===
                        "streaming" && (
                        <span className="inline-block ml-1 animate-pulse">
                          ▌
                        </span>
                      )}

                    </div>

                    {/* Sources */}

                    {message.role ===
                      "assistant" &&
                      message.status ===
                        "completed" &&
                      message.sources?.length >
                        0 && (

                        <div className="mt-4">

                          <p className="text-xs text-slate-500 mb-2">
                            Sources
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {message.sources.map(
                              (
                                source,
                                index
                              ) => (

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

              <div
                ref={messagesEndRef}
              />

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
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder={
                isRepositoryChat
                  ? "Ask about this repository..."
                  : "Ask DevMind..."
              }
              rows={1}
              disabled={
                loading ||
                loadingMessages ||
                !conversationId
              }
              className="flex-1 resize-none rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                loadingMessages ||
                !question.trim() ||
                !conversationId
              }
              className="rounded-xl bg-indigo-600 px-5 py-4 font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading
                ? "..."
                : "Send"}
            </button>

          </div>

          <p className="text-xs text-slate-600 mt-2 text-center">
            Enter to send · Shift + Enter for a new line
          </p>

        </div>

      </div>

      {/* =====================================
          New Conversation Modal
      ====================================== */}

      {showNewConversation && (
        <NewConversationModal
          onClose={() => {
            setShowNewConversation(false);
          }}
        />
      )}

    </div>
  );
}