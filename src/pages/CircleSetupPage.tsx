import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, ArrowRight, Sparkles } from "lucide-react";

interface CircleSetupPageProps {
  onCreate: (name: string) => Promise<void>;
  onJoin: (inviteCode: string) => Promise<void>;
}

export const CircleSetupPage: React.FC<CircleSetupPageProps> = ({ onCreate, onJoin }) => {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (mode === "create") {
        if (!name.trim()) throw new Error("Give your circle a name.");
        await onCreate(name.trim());
      } else {
        if (!inviteCode.trim()) throw new Error("Enter an invite code.");
        await onJoin(inviteCode.trim());
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-matte-black text-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-xl space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading">Set up your Circle</h1>
            <p className="text-xs text-slate-400 font-mono">You're not in a Gullak Circle yet</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-matte-black rounded-xl border border-gold-500/10">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors ${
              mode === "create" ? "bg-gold-500 text-matte-black" : "text-slate-400"
            }`}
          >
            Create New
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors ${
              mode === "join" ? "bg-gold-500 text-matte-black" : "text-slate-400"
            }`}
          >
            Join Existing
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" ? (
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Circle Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hostel Wing 4B"
                className="mt-1.5 w-full px-4 py-3 bg-matte-black border border-gold-500/15 rounded-xl text-sm focus:outline-none focus:border-gold-500/50"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Invite Code</label>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. A1B2C3"
                className="mt-1.5 w-full px-4 py-3 bg-matte-black border border-gold-500/15 rounded-xl text-sm focus:outline-none focus:border-gold-500/50 uppercase"
              />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-matte-black font-bold rounded-xl transition-all text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "create" ? "Create Circle" : "Join Circle"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
