export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-5 md:px-8">

        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            🧠
          </div>

          <h1 className="text-xl font-bold">
            DevMind
          </h1>

        </div>

        <p className="hidden md:block text-sm text-slate-500">
          Your AI-powered developer second brain
        </p>

      </header>


      {/* ============================= */}
      {/* MAIN */}
      {/* ============================= */}

      <main className="min-h-[calc(100vh-4rem)] flex items-center">

        <div className="w-full max-w-6xl mx-auto px-5 md:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">


            {/* ============================= */}
            {/* LEFT - LANDING */}
            {/* ============================= */}

            <section className="hidden lg:block">

              <div className="max-w-xl">

                {/* Badge */}

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-5">

                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                  Built for Developers

                </div>


                {/* Hero */}

                <h2 className="text-5xl font-bold tracking-tight leading-tight">

                  Your knowledge.

                  <span className="block text-indigo-400">
                    Your second brain.
                  </span>

                </h2>


                <p className="mt-5 text-base text-slate-400 leading-7 max-w-lg">

                  Store your resources, understand your codebase,
                  and ask questions about everything you build —
                  all from one intelligent workspace.

                </p>


                {/* ============================= */}
                {/* GitHub Feature */}
                {/* ============================= */}

                <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-5">

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                      <span>⌘</span>
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <h3 className="font-semibold text-white">
                          Chat with your GitHub repository
                        </h3>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                          AI
                        </span>

                      </div>

                      <p className="text-sm text-slate-400 mt-2 leading-6">
                        Connect a GitHub repository, let DevMind index
                        the codebase, and ask questions about the
                        architecture, authentication, APIs, files,
                        and implementation.
                      </p>

                    </div>

                  </div>


                  {/* Example question */}

                  <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 px-4 py-3">

                    <p className="text-xs text-slate-600 mb-1">
                      Ask your codebase
                    </p>

                    <p className="text-sm text-slate-300">
                      "How does authentication work in this repository?"
                    </p>

                  </div>

                </div>


                {/* ============================= */}
                {/* Other Features */}
                {/* ============================= */}

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <Feature
                    icon="📚"
                    title="Personal Knowledge"
                    description="PDFs, URLs, notes and code."
                  />

                  <Feature
                    icon="🔎"
                    title="AI Search"
                    description="Find answers from your resources."
                  />

                </div>

              </div>

            </section>


            {/* ============================= */}
            {/* RIGHT - AUTH */}
            {/* ============================= */}

            <section className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">


              {/* Mobile Landing */}

              <div className="lg:hidden text-center mb-6">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
                  AI for Developers
                </div>

                <h2 className="text-3xl font-bold">
                  Your second brain.
                </h2>

                <p className="text-sm text-slate-400 mt-2">
                  Store knowledge and chat with your GitHub codebases.
                </p>

              </div>


              {/* Auth */}

              <div className="text-center mb-5">

                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Get Started
                </p>

              </div>

              {children}

            </section>

          </div>

        </div>

      </main>


      {/* ============================= */}
      {/* FOOTER */}
      {/* ============================= */}

      <footer className="hidden md:block border-t border-slate-800 py-4 text-center">

        <p className="text-xs text-slate-600">
          DevMind · Your AI-powered developer second brain
        </p>

      </footer>

    </div>
  );
}


/* ============================= */
/* Feature Component */
/* ============================= */

function Feature({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">

      <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
        {icon}
      </div>

      <div>

        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}