import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  Sparkles, 
  CheckCircle, 
  PlusCircle, 
  ArrowUpRight, 
  ShoppingBag, 
  Coffee, 
  Car, 
  Film, 
  Utensils,
  Plus
} from "lucide-react";
import { Transaction } from "../types";

interface RoundupSimulatorPageProps {
  poolBalance: number;
  recentTransactions: Transaction[];
  onSimulateRoundup: (merchant: string, amount: number, roundup: number) => void;
  triggerConfetti: () => void;
}

const PRESET_MERCHANTS = [
  { name: "Coffee Taproom", amount: 184.20, category: "Food", icon: Coffee, color: "bg-gold-500/10 text-gold-500" },
  { name: "Metro Commute", amount: 42.60, category: "Transport", icon: Car, color: "bg-gold-500/10 text-gold-500" },
  { name: "Decathlon Sports", amount: 1895.00, category: "Shopping", icon: ShoppingBag, color: "bg-gold-500/10 text-gold-500" },
  { name: "Swiggy Delivery", amount: 412.50, category: "Food", icon: Utensils, color: "bg-gold-500/10 text-gold-500" },
  { name: "Netflix Premium", amount: 649.00, category: "Entertainment", icon: Film, color: "bg-gold-500/10 text-gold-500" }
];

export const RoundupSimulatorPage: React.FC<RoundupSimulatorPageProps> = ({
  poolBalance,
  recentTransactions,
  onSimulateRoundup,
  triggerConfetti
}) => {
  const [customMerchant, setCustomMerchant] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [activeSimulation, setActiveSimulation] = useState<any>(null);
  const [flyingCoins, setFlyingCoins] = useState<number[]>([]);

  const handleSimulate = (name: string, amtStr: string) => {
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0 || !name.trim()) return;

    // Calculate roundup to the nearest multiple of 10
    let roundup = 0;
    const remainder = amt % 10;
    if (remainder === 0) {
      roundup = 10; // always add a mini spare change backup
    } else {
      roundup = 10 - remainder;
    }

    // Prepare active simulation state
    const simId = Date.now();
    setActiveSimulation({
      id: simId,
      merchant: name,
      amount: amt,
      roundup: roundup
    });

    // Spawn flying coins animation
    const coinArray = Array.from({ length: 8 }).map((_, i) => i);
    setFlyingCoins(coinArray);

    // Call parent handler to update pool balance and transactions lists
    setTimeout(() => {
      onSimulateRoundup(name, amt, roundup);
      if (roundup >= 8) {
        triggerConfetti();
      }
    }, 1200);

    // Reset simulator inputs
    setCustomMerchant("");
    setCustomAmount("");

    // Clear simulation overlay
    setTimeout(() => {
      setActiveSimulation(null);
      setFlyingCoins([]);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* Floating Coins Animation Layer */}
      <AnimatePresence>
        {activeSimulation && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {flyingCoins.map((coinIndex) => {
              return (
                <motion.div
                  key={coinIndex}
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0,
                    opacity: 1,
                    rotate: 0
                  }}
                  animate={{
                    x: ["50%", `${20 + Math.random() * 20}%`, "0%"],
                    y: ["50%", `${20 + Math.random() * 10}%`, "-80vh"],
                    scale: [0.5, 1.2, 0.5],
                    opacity: [1, 1, 0.8, 0],
                    rotate: 360 + coinIndex * 45
                  }}
                  transition={{
                    duration: 1.2,
                    delay: coinIndex * 0.1,
                    ease: "easeInOut"
                  }}
                  className="absolute w-6 h-6 rounded-full bg-gold-500 border border-gold-300 flex items-center justify-center shadow-lg shadow-gold-500/20 text-[10px] font-bold text-matte-black font-mono"
                >
                  ₹
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Spare Change Roundup Simulator</h2>
        <p className="text-xs text-slate-500 mt-1">
          Simulate standard retail swipes. Watch how small roundups add up to robust social protection!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Preset Swipes & Custom Swiper */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick preset swipes */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-200">Quick Swipe Presets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any standard swipe to simulate its roundup auto-investment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_MERCHANTS.map((m, idx) => {
                const calculatedRoundup = (10 - (m.amount % 10)) === 10 ? 10 : (10 - (m.amount % 10));
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSimulate(m.name, m.amount.toString())}
                    className="p-4 rounded-2xl bg-matte-black hover:bg-gold-500/5 border border-gold-500/5 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${m.color} border border-gold-500/10`}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{m.name}</p>
                        <p className="text-xs text-slate-500 font-mono">₹{m.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-gold-500 block">
                        +₹{calculatedRoundup.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Roundup</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom Swipe Creator */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-200">Swipe Custom Card</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter a custom merchant and transaction cost to calculate roundups</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">Merchant Name</label>
                <input
                  type="text"
                  placeholder="e.g. My local grocery store"
                  value={customMerchant}
                  onChange={(e) => setCustomMerchant(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-matte-black border border-gold-500/15 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-slate-100 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">Transaction Cost (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 254.50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-matte-black border border-gold-500/15 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm pl-8 text-slate-100 placeholder:text-slate-600"
                  />
                  <span className="absolute left-4 top-3 text-sm text-gold-500 font-bold font-mono">₹</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={!customMerchant.trim() || !customAmount}
                onClick={() => handleSimulate(customMerchant, customAmount)}
                className="px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-matte-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-500/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Swipe & Roundup
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Pool Balance Animation Display & Live Roundups Feed */}
        <div className="space-y-6">
          
          {/* Real-time Pool Balance card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-matte-charcoal via-matte-black to-matte-charcoal text-white border border-gold-500/15 relative overflow-hidden shadow-xl text-center">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl" />

            <Coins className="w-8 h-8 text-gold-500 mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">LIVE GULLAK BALANCE</p>
            
            {/* Real-time Counter Animation */}
            <h4 className="text-3xl font-bold tracking-tight mt-1 font-heading text-gold-gradient">
              ₹{poolBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h4>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-mono tracking-wider uppercase rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Milestone target is ₹30,000
            </div>
          </div>

          {/* Active Transaction simulation feedback dialog */}
          <AnimatePresence>
            {activeSimulation && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className="p-5 rounded-3xl bg-matte-black border border-gold-500/20 shadow-lg text-center space-y-2 relative"
              >
                <CheckCircle className="w-6 h-6 text-gold-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Rounded Up Successfully!</h4>
                <p className="text-xs text-slate-400">
                  Swiped <span className="font-bold text-slate-200">{activeSimulation.merchant}</span> for ₹{activeSimulation.amount.toFixed(2)}
                </p>
                <div className="inline-block px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-mono font-bold rounded-lg mt-2">
                  +₹{activeSimulation.roundup.toFixed(2)} entering shared digital pool
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Live Feed of Roundups */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400">Live Pool Feed</h3>
            
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    <span className="font-medium text-slate-300">{tx.merchant}</span>
                  </div>
                  <span className="font-mono text-gold-500 font-bold">+₹{tx.roundup.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
