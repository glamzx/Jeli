"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, ArrowRight, CheckCircle2, Sparkles, Building2, Globe, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "INFLUENCER" | "BRAND" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [step, setStep] = useState<"SELECT_ROLE" | "FORM">("SELECT_ROLE");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Influencer specific
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("Tech");
  
  // Brand specific
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [budget, setBudget] = useState("$5k–$20k");

  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, staggerChildren: 0.12 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.03, translateY: -4, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.98 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role: selectedRole,
          handle,
          niche,
          companyName,
          websiteUrl,
          budget
        })
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err = await res.json();
        alert(err.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12">
      
      {/* Header logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] tracking-tight text-white">
          Jeli.
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {step === "SELECT_ROLE" ? (
          <motion.div 
            key="role-selection"
            className="max-w-4xl w-full text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-3">
              <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                Onboarding Portal
              </motion.div>
              <motion.h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                Welcome to Jeli
              </motion.h1>
              <motion.p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto">
                Select your account type to personalize your AI-powered management workflow.
              </motion.p>
            </div>

            {/* Role Selection Glassmorphism Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-8">
              
              {/* Creator Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("INFLUENCER")}
                className={`cursor-pointer relative p-8 rounded-2xl border transition-all duration-300 ${
                  selectedRole === "INFLUENCER"
                    ? "border-[#0064FF] bg-blue-950/30 shadow-[0_0_35px_rgba(0,100,255,0.35)]"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                {selectedRole === "INFLUENCER" && (
                  <CheckCircle2 className="absolute top-4 right-4 text-[#0064FF] w-6 h-6" />
                )}
                <div className="p-3 bg-[#0064FF]/10 w-fit rounded-xl text-[#0064FF] mb-6">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Creator / Influencer</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Automate brand inquiries, generate dynamic media kits, track performance analytics, and negotiate sponsorships with your AI Manager.
                </p>
                <span className="text-[#0064FF] font-semibold text-sm flex items-center gap-2">
                  Continue as Creator <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

              {/* Brand Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("BRAND")}
                className={`cursor-pointer relative p-8 rounded-2xl border transition-all duration-300 ${
                  selectedRole === "BRAND"
                    ? "border-blue-500 bg-blue-950/30 shadow-[0_0_35px_rgba(59,130,246,0.35)]"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                {selectedRole === "BRAND" && (
                  <CheckCircle2 className="absolute top-4 right-4 text-blue-400 w-6 h-6" />
                )}
                <div className="p-3 bg-blue-500/10 w-fit rounded-xl text-blue-400 mb-6">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Business / Brand</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Discover vetted creators, manage influencer campaigns, analyze ROI metrics, and streamline deals with automated escrow workflows.
                </p>
                <span className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                  Continue as Brand <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

            </div>

            {/* Action Proceed Button */}
            <motion.button
              disabled={!selectedRole}
              onClick={() => selectedRole && setStep("FORM")}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto ${
                selectedRole
                  ? "bg-[#0064FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 cursor-pointer transform hover:-translate-y-0.5"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Proceed to Account Creation <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="registration-form"
            className="max-w-xl w-full bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <button 
                onClick={() => setStep("SELECT_ROLE")} 
                className="text-sm text-slate-400 hover:text-white mb-3 inline-block"
              >
                ← Back to role selection
              </button>
              <h2 className="text-2xl font-bold">
                {selectedRole === "INFLUENCER" ? "Creator Registration" : "Brand / Business Registration"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Set up your account details to access the Jeli AI network.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              {/* Conditional Influencer Form Fields */}
              {selectedRole === "INFLUENCER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      TikTok / Social Handle
                    </label>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@yourhandle"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Primary Content Category
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="Tech">Tech & AI</option>
                      <option value="Fitness">Fitness & Health</option>
                      <option value="Business">Business & Finance</option>
                      <option value="Beauty">Beauty & Skincare</option>
                      <option value="Entertainment">Entertainment & Comedy</option>
                    </select>
                  </div>
                </>
              )}

              {/* Conditional Brand Form Fields */}
              {selectedRole === "BRAND" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Monthly Influencer Marketing Budget
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="<$5k">&lt;$5,000 / mo</option>
                      <option value="$5k–$20k">$5,000 – $20,000 / mo</option>
                      <option value="$20k–$100k+">$20,000 – $100,000+ / mo</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-xl font-bold bg-[#0064FF] hover:bg-blue-600 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Creating Jeli Account..." : "Create Account & Enter Platform"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
