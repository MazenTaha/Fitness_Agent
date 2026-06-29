import { ChatBox } from "@/components/fitness-agent/ChatBox";

export default function FitnessAgentPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 px-6 py-8 text-white shadow-soft sm:px-10">
          <div className="absolute inset-0 bg-hero-grid bg-[size:36px_36px] opacity-10" />
          <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-100">
                Multi-Agent Coaching
              </span>
              <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Train smarter, eat better, recover with a plan.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">
                FitCoach AI routes questions to focused agents for workouts,
                nutrition, programming, exercise form, and safer next steps
                when health risks come up.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-3 lg:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Beginner to advanced plans
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Practical calories and macro guidance
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Injury-aware and medically cautious
              </div>
            </div>
          </div>
        </section>

        <ChatBox />
      </div>
    </main>
  );
}
