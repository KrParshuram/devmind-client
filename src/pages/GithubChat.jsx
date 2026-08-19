import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios"; // use your existing api instance

export default function GithubChat() {

  // IMPORTANT:
  // conversationId != repoId
  const { conversationId, repoId } = useParams();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);


  // =====================================================
  // FETCH CONVERSATION MESSAGES
  // =====================================================

  const fetchMessages = async (id) => {

    if (!id) return;

    try {

      setLoadingMessages(true);

      const response = await api.get(
        `/api/user/conversations/${id}/messages`
      );

      const serverMessages =
        response.data.messages || [];

      const formattedMessages =
        serverMessages.map((message) => ({
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


  // =====================================================
  // LOAD MESSAGES
  // =====================================================

  useEffect(() => {

    if (conversationId) {
      fetchMessages(conversationId);
    }

  }, [conversationId]);


  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  // =====================================================
  // SEND MESSAGE - SSE
  // =====================================================

  const sendMessage = async () => {

    if (!question.trim() || loading || !repoId) {
      return;
    }

    const currentQuestion = question.trim();

    setQuestion("");
    setLoading(true);


    // ---------------------------------------------------
    // Add user message immediately
    // ---------------------------------------------------

    const temporaryUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: currentQuestion,
      status: "completed",
      sources: [],
    };

    setMessages((prev) => [
      ...prev,
      temporaryUserMessage,
    ]);


    // ---------------------------------------------------
    // Temporary assistant message
    // ---------------------------------------------------

    const assistantId =
      `temp-assistant-${Date.now()}`;

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
        localStorage.getItem("token");


      // =================================================
      // SSE REQUEST
      // =================================================

      const response = await fetch(
        `http://localhost:3000/api/github/repos/${repoId}/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            question: currentQuestion,

            // IMPORTANT:
            // send conversationId so backend can
            // store the message in this conversation
            conversationId,
          }),
        }
      );


      if (!response.ok) {

        let errorMessage =
          "Failed to chat with repository";

        try {
          const error = await response.json();
          errorMessage =
            error.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
      }


      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this response"
        );
      }


      // =================================================
      // READ SSE STREAM
      // =================================================

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";


      while (true) {

        const {
          value,
          done,
        } = await reader.read();

        if (done) break;


        buffer += decoder.decode(
          value,
          { stream: true }
        );


        // SSE events are separated by \n\n
        const events =
          buffer.split("\n\n");

        // Keep incomplete event
        buffer = events.pop() || "";


        for (const event of events) {

          if (!event.startsWith("data:")) {
            continue;
          }


          const dataString =
            event
              .split("\n")
              .find((line) =>
                line.startsWith("data:")
              )
              ?.replace(/^data:\s*/, "");


          if (!dataString) {
            continue;
          }


          let data;

          try {
            data = JSON.parse(dataString);
          } catch (error) {
            console.error(
              "Invalid SSE data:",
              dataString
            );
            continue;
          }


          // =================================================
          // TOKEN
          // =================================================

          if (data.type === "token") {

            setMessages((prev) =>
              prev.map((message) => {

                if (
                  message.id !== assistantId
                ) {
                  return message;
                }

                return {
                  ...message,
                  content:
                    message.content +
                    data.content,
                };

              })
            );

          }


          // =================================================
          // DONE
          // =================================================

          if (data.type === "done") {

            setMessages((prev) =>
              prev.map((message) => {

                if (
                  message.id !== assistantId
                ) {
                  return message;
                }

                return {
                  ...message,
                  id:
                    data.messageId ||
                    message.id,
                  status: "completed",
                  sources:
                    data.sources || [],
                };

              })
            );

          }


          // =================================================
          // ERROR
          // =================================================

          if (data.type === "error") {

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
                    data.message ||
                    "Failed to generate response.",
                };

              })
            );

          }

        }

      }


      // ---------------------------------------------------
      // Refresh from MongoDB
      // ---------------------------------------------------
      //
      // This makes MongoDB the final source of truth.
      //

      if (conversationId) {
        await fetchMessages(conversationId);
      }


    } catch (error) {

      console.error(
        "Github chat error:",
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
              "Failed to generate response.",
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


  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      sendMessage();
    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="h-full flex flex-col bg-slate-950">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800">

        <h1 className="text-white font-semibold">
          GitHub Repository Chat
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Ask questions about your repository
        </p>

      </div>


      {/* ================================================= */}
      {/* MESSAGES */}
      {/* ================================================= */}

      <div className="flex-1 overflow-y-auto">

        <div className="max-w-4xl mx-auto px-4 py-8">


          {loadingMessages ? (

            <div className="flex justify-center py-10">

              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

            </div>

          ) : messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">

              <div className="text-5xl mb-4">
                💻
              </div>

              <h2 className="text-xl font-semibold text-white">
                Chat with your repository
              </h2>

              <p className="text-sm text-slate-500 mt-2 max-w-md">
                Ask about the architecture, files,
                functions, bugs, or implementation
                details in your GitHub repository.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {messages.map((message) => (

                <MessageBubble
                  key={message.id}
                  message={message}
                />

              ))}

              <div ref={messagesEndRef} />

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* INPUT */}
      {/* ================================================= */}

      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950">

        <div className="max-w-4xl mx-auto px-4 py-4">

          <div className="flex items-end gap-3">

            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              placeholder="Ask about your repository..."
              className="flex-1 resize-none rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 disabled:opacity-50"
            />


            <button
              onClick={sendMessage}
              disabled={
                loading ||
                !question.trim()
              }
              className="h-11 w-11 flex-shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >

              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                "↑"
              )}

            </button>

          </div>

          <p className="text-[11px] text-slate-600 mt-2 text-center">
            AI responses are generated from your indexed repository.
          </p>

        </div>

      </div>

    </div>
  );
}