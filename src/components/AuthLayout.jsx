export default function AuthLayout({ children }) {
return ( <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">


  {/* Header */}
  <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
    
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
        🧠
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight">
          DevMind
        </h1>
      </div>
    </div>

    <div className="hidden md:block text-sm text-slate-500">
      AI-Powered Second Brain for Developers
    </div>

  </header>


  {/* Landing Section */}
  <section className="relative overflow-hidden">

    {/* Background Glow */}
    <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

    <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI Knowledge Management for Developers
        </div>

        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Your knowledge.
          <span className="block text-indigo-400">
            Your second brain.
          </span>
        </h2>

        <p className="mt-6 text-base md:text-lg text-slate-400 leading-8 max-w-2xl mx-auto">
          Store your documentation, code, PDFs, URLs and notes in one
          intelligent knowledge base. Ask questions and get answers
          grounded in your own resources.
        </p>

      </div>


      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
          <div className="text-2xl mb-3">📚</div>

          <h3 className="font-semibold text-white">
            Store Knowledge
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-6">
            Save PDFs, URLs, notes and code snippets in your personal
            developer knowledge base.
          </p>
        </div>


        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
          <div className="text-2xl mb-3">🔎</div>

          <h3 className="font-semibold text-white">
            Search with AI
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-6">
            Ask natural-language questions and retrieve the most relevant
            information from your saved resources.
          </p>
        </div>


        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
          <div className="text-2xl mb-3">🤖</div>

          <h3 className="font-semibold text-white">
            RAG-Powered Answers
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-6">
            Get contextual answers generated from your own knowledge
            instead of relying only on generic AI responses.
          </p>
        </div>

      </div>

    </div>
  </section>


  {/* Authentication Area */}
  <section className="relative border-t border-white/5">

    <div className="max-w-6xl mx-auto px-6 py-12">

      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Get Started
        </p>

        <h3 className="text-2xl font-semibold mt-2">
          Start building your second brain
        </h3>
      </div>

      {children}

    </div>

  </section>


  {/* Footer */}
  <footer className="border-t border-slate-800 py-6 text-center">
    <p className="text-xs text-slate-600">
      DevMind · AI-powered knowledge management for developers
    </p>
  </footer>

</div>


);
}
