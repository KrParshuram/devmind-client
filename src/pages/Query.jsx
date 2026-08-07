import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

export default function Query() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await api.post("/api/query", {
        question,
      });

      setResponse(res.data.answer || res.data.response || JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log(err.response?.data || err.message);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-indigo-400 uppercase tracking-[0.3em] text-xs mb-2">
            AI KNOWLEDGE BASE
          </p>

          <h1 className="text-4xl font-bold">
            Ask your resources anything.
          </h1>

          <p className="text-slate-400 mt-3 max-w-2xl">
            Your question will be answered only using the documents, URLs,
            notes and code snippets stored inside your knowledge base.
          </p>
        </div>

        {/* Query Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">

          <label className="block text-sm font-medium text-slate-300 mb-3">
            Your Question
          </label>

          <textarea
            ref={inputRef}
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: Explain how BullMQ workers process uploaded PDFs..."
            className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-5 py-4 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-between items-center mt-3 text-sm text-slate-400">
            <span>{question.length} characters</span>
            <span>Ctrl + Enter to submit</span>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-3 font-medium transition"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>

            <button
              onClick={() => {
                setQuestion("");
                setResponse("");
                inputRef.current?.focus();
              }}
              className="rounded-xl border border-slate-700 hover:bg-slate-800 px-6 py-3"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Response */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">

          <div className="flex items-center gap-2 mb-5">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
            <h2 className="text-xl font-semibold">
              AI Response
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-4 py-8">
              <div className="h-7 w-7 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-300">
                Searching your knowledge base...
              </p>
            </div>
          ) : response ? (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 whitespace-pre-wrap leading-8 text-slate-200 max-h-[500px] overflow-y-auto">
              {response}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <div className="text-6xl mb-4">🤖</div>

              <p className="text-lg">
                No response yet
              </p>

              <p className="mt-2 text-sm">
                Ask a question to search your personal knowledge base.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}