"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  AlertCircle,
  RefreshCcw,
  Check,
  RotateCcw,
  MessageSquare,
  MessageCircle,
  Mail,
} from "lucide-react";

function IntakeFormInner() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7;

  // Form State
  const [projectType, setProjectType] = useState<string>("");
  const [customProjectType, setCustomProjectType] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [currentSituation, setCurrentSituation] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Pre-populate from query parameters
  useEffect(() => {
    const solutionParam = searchParams.get("solution");
    const situationParam = searchParams.get("situation");
    const objectiveParam = searchParams.get("objective");
    const usersParam = searchParams.get("users");
    const frictionParam = searchParams.get("friction");

    if (solutionParam === "ai-agent") {
      setProjectType("AI Agent");
      setGoal("Create an AI assistant");
    } else if (solutionParam === "automation") {
      setProjectType("Automation & Workflows");
      setGoal("Automate operations");
    } else if (solutionParam === "web-app") {
      setProjectType("Web Application");
      setGoal("Build a new product");
    } else if (solutionParam === "integration" || solutionParam === "software") {
      setProjectType("App & System Integration");
      setGoal("Modernize existing software");
    }

    if (situationParam === "idea") {
      setCurrentSituation("Idea only");
    } else if (situationParam === "existing") {
      setCurrentSituation("Existing application");
      if (!projectType) setProjectType("App & System Integration");
    }

    if (objectiveParam) {
      if (objectiveParam === "Build something new") setProjectType("Web Application");
      else if (objectiveParam === "Automate something") setProjectType("Automation & Workflows");
      else if (objectiveParam === "Add AI") setProjectType("AI Agent");
      else if (objectiveParam === "Improve an existing system") setProjectType("App & System Integration");
      else if (objectiveParam === "Create a digital product") setProjectType("SaaS Platform");

      const note = `Objective: ${objectiveParam}. ${usersParam ? `Target Users: ${usersParam}. ` : ""}${frictionParam ? `Primary Friction: ${frictionParam}.` : ""}`;
      setDescription((prev) => (prev ? prev : note));
    }
  }, [searchParams]);

  // Step 1 Options
  const projectTypes = [
    { label: "App & System Integration", desc: "Connect existing web/mobile apps, APIs, CRMs, and payment gateways" },
    { label: "Web Application", desc: "Modern full-stack web platforms, customer portals, and dashboards" },
    { label: "Mobile Application", desc: "Native iOS & Android mobile apps engineered for speed and scale" },
    { label: "AI Agent", desc: "Autonomous reasoning, voice call agents, sales qualification, or support bots" },
    { label: "Automation & Workflows", desc: "End-to-end lead conversion, CRM sync, and operational pipelines" },
    { label: "AI System & Engineering", desc: "LLMs, RAG knowledge bases, computer vision, or predictive models" },
    { label: "SaaS Platform", desc: "Multi-tenant software-as-a-service with seat billing and user roles" },
    { label: "Enterprise Platform", desc: "Multi-branch, staff, order dispatch, and financial governance systems" },
    { label: "Custom Software & APIs", desc: "Bespoke backend microservices, databases, or internal team tools" },
    { label: "Other", desc: "A unique or cross-disciplinary technical requirement" },
  ];

  // Step 2 Options
  const goals = [
    { label: "Connect & automate existing systems", desc: "Bridge disjointed apps, sync CRMs, and eliminate manual re-entry" },
    { label: "Build a new digital product", desc: "Translate an ambitious concept into a working production software product" },
    { label: "Deploy an AI agent / assistant", desc: "Empower staff or customers with 24/7 autonomous intelligence and voice" },
    { label: "Generate & convert leads", desc: "Automate multi-channel inbound lead capture, qualification, and follow-up" },
    { label: "Streamline team operations", desc: "Replace spreadsheets and manual paper tickets with automated workflows" },
    { label: "Modernize legacy software", desc: "Refactor outdated codebases, speed up APIs, and upgrade databases" },
    { label: "Analyze & extract intelligence", desc: "Transform complex operational data into actionable dashboards" },
    { label: "Other", desc: "Another specific commercial or operational outcome" },
  ];

  // Step 3 Suggestion Chips
  const promptSuggestions = [
    "Connect our existing mobile app and CRM with automated real-time webhooks",
    "Build a modern Next.js web application with user accounts and Stripe billing",
    "Deploy an autonomous AI agent to answer customer inquiries via WhatsApp & voice",
    "Automate our lead intake pipeline so leads are qualified and replied to in under 90s",
    "Create a multi-role administrative portal with granular branch access controls",
  ];

  // Step 4 Options
  const situations = [
    { label: "Idea only", desc: "Starting fresh from a concept or business opportunity" },
    { label: "Existing application", desc: "Running web or mobile software that requires expansion or rewriting" },
    { label: "Existing website", desc: "Have an online presence needing intelligence, automation, or overhaul" },
    { label: "Existing software / legacy tool", desc: "Legacy desktop tool or internal software needing modernization" },
    { label: "Existing workflow on spreadsheets", desc: "Manual business process currently running on Excel or Google Sheets" },
    { label: "Existing APIs & databases", desc: "Have proprietary databases or APIs needing modern frontends or AI" },
  ];

  // Step 5 Options
  const timelines = [
    { label: "ASAP (< 30 days)", desc: "Urgent launch or rapid sprint to meet an immediate deadline" },
    { label: "1–3 months", desc: "Standard production release window with iterative milestones" },
    { label: "3–6 months", desc: "Comprehensive enterprise build, integration, and rollout" },
    { label: "Flexible", desc: "Discovery and design first; open to scoping recommendations" },
  ];

  // Step 6 Options
  const budgetRanges = [
    { label: "$5,000 – $10,000", desc: "Targeted integration, standalone AI agent, or focused MVP" },
    { label: "$10,000 – $25,000", desc: "Production web/mobile application or advanced automation engine" },
    { label: "$25,000 – $50,000", desc: "Complete multi-role platform, SaaS MVP, or multi-branch system" },
    { label: "$50,000+", desc: "Enterprise infrastructure, high-throughput ecosystem, or dedicated studio" },
    { label: "Undisclosed / Flexible", desc: "Open to scoping based on architectural recommendations" },
  ];

  // Auto-advance handlers (Smooth, instant 240ms transition on option click)
  const handleSelectProjectType = (val: string) => {
    setProjectType(val);
    setErrorMessage("");
    if (val !== "Other") {
      setTimeout(() => {
        setCurrentStep(2);
      }, 240);
    }
  };

  const handleSelectGoal = (val: string) => {
    setGoal(val);
    setErrorMessage("");
    if (val !== "Other") {
      setTimeout(() => {
        setCurrentStep(3);
      }, 240);
    }
  };

  const handleSelectSituation = (val: string) => {
    setCurrentSituation(val);
    setErrorMessage("");
    setTimeout(() => {
      setCurrentStep(5);
    }, 240);
  };

  const handleSelectTimeline = (val: string) => {
    setTimeline(val);
    setErrorMessage("");
    setTimeout(() => {
      setCurrentStep(6);
    }, 240);
  };

  const handleSelectBudget = (val: string) => {
    setBudgetRange(val);
    setErrorMessage("");
    setTimeout(() => {
      setCurrentStep(7);
    }, 240);
  };

  // Manual Next Button Navigation
  const handleNext = () => {
    setErrorMessage("");
    if (currentStep === 1) {
      if (!projectType) {
        setErrorMessage("Please select what you want to build.");
        return;
      }
      if (projectType === "Other" && !customProjectType.trim()) {
        setErrorMessage("Please specify what you want to build.");
        return;
      }
    } else if (currentStep === 2) {
      if (!goal) {
        setErrorMessage("Please select your primary goal.");
        return;
      }
      if (goal === "Other" && !customGoal.trim()) {
        setErrorMessage("Please specify your primary goal.");
        return;
      }
    } else if (currentStep === 3) {
      // If empty, supply clean default so user is never blocked
      if (!description.trim()) {
        setDescription(
          `Project Scope: ${projectType || "Software Solution"}. Primary Goal: ${goal || "System Modernization"}. Detailed specifications to be refined during architectural discovery.`
        );
      }
    } else if (currentStep === 4) {
      if (!currentSituation) {
        setErrorMessage("Please select your current situation.");
        return;
      }
    } else if (currentStep === 5) {
      if (!timeline) {
        setErrorMessage("Please select your expected timeline.");
        return;
      }
    } else if (currentStep === 6) {
      if (!budgetRange) {
        setErrorMessage("Please select a budget range.");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generateWhatsAppIntakeUrl = () => {
    const pType =
      projectType === "Other"
        ? (customProjectType.trim() ? `Other: ${customProjectType.trim()}` : "Custom Software")
        : (projectType || "App & System Integration");
    const pGoal =
      goal === "Other"
        ? (customGoal.trim() ? `Other: ${customGoal.trim()}` : "System Engineering")
        : (goal || "Build something new / System Modernization");

    const text = `Hello IMPACT Enterprise! I am submitting a project inquiry:\n\n• Client Name: ${name || "Client"}\n• Work Email: ${email || "Not specified"}\n• Phone: ${phone || "Not specified"}\n• Company: ${company || "Not specified"}\n• Project Category: ${pType}\n• Primary Objective: ${pGoal}\n• Expected Timeline: ${timeline || "Flexible"}\n• Budget Range: ${budgetRange || "Flexible"}\n• Project Scope: ${description || "To be reviewed during technical discovery"}`;

    return `https://wa.me/923147893907?text=${encodeURIComponent(text)}`;
  };

  const generateGmailIntakeUrl = () => {
    const pType =
      projectType === "Other"
        ? (customProjectType.trim() ? `Other: ${customProjectType.trim()}` : "Custom Software")
        : (projectType || "App & System Integration");

    const subject = `Project Inquiry: ${pType} - ${name || "New Client"}`;
    const bodyText = `Hello IMPACT Engineering Team,\n\nI would like to submit my project inquiry for architectural review:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nCompany: ${company || "N/A"}\nProject Category: ${pType}\nGoal: ${goal || "System Modernization"}\nTimeline: ${timeline || "Flexible"}\nBudget: ${budgetRange || "Flexible"}\n\nProject Scope:\n${description || "To be discussed during discovery call"}`;

    return `mailto:impactenterprise527@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail) {
      setErrorMessage("Please provide at least your Name and Work Email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@company.com).");
      return;
    }

    setIsSubmitting(true);

    const resolvedProjectType =
      projectType === "Other"
        ? (customProjectType.trim() ? `Other: ${customProjectType.trim()}` : "Custom Software Solution")
        : (projectType || "App & System Integration");

    const resolvedGoal =
      goal === "Other"
        ? (customGoal.trim() ? `Other: ${customGoal.trim()}` : "System Engineering")
        : (goal || "Build something new / Modernize existing systems");

    const resolvedDescription =
      description.trim() ||
      `Scoping inquiry for ${resolvedProjectType}. Objective: ${resolvedGoal}. Full specifications to be refined during discovery.`;

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectType: resolvedProjectType,
          customProjectType,
          goal: resolvedGoal,
          customGoal,
          description: resolvedDescription,
          currentSituation: currentSituation || "Idea only",
          timeline: timeline || "Flexible",
          budgetRange: budgetRange || "Flexible",
          name: cleanName,
          company: company.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          country: country.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissionId(data.submissionId);
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || "Submission could not be completed automatically. Please transmit directly via WhatsApp below.");
      }
    } catch (err: any) {
      console.warn("Intake submission network/client error:", err);
      setErrorMessage("Unable to connect to intake server. Please click below to send your project specifications directly via WhatsApp or Email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepNames = [
    "Project Type",
    "Primary Goal",
    "Idea Scope",
    "Starting Point",
    "Timeline",
    "Budget",
    "Contact Info",
  ];

  return (
    <div className="py-12 sm:py-20 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IMPACT Project Intake Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-tight">
            START A PROJECT
          </h1>
          <p className="mt-2 text-base text-brand-muted max-w-xl mx-auto">
            Tell us about your idea or system requirements. We will engineer the intelligence, automation, and software to make it real.
          </p>
        </div>

        {/* SUBMISSION CONFIRMATION VIEW */}
        {isSubmitted ? (
          <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-14 shadow-card text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-mono font-bold text-brand-charcoal uppercase tracking-wider">
              Project Reference ID: {submissionId}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight mt-4">
              Your project inquiry has been received.
            </h2>

            <p className="text-base font-semibold text-brand-accent mt-2">
              Our engineering team is analyzing your specifications.
            </p>

            <p className="text-sm text-brand-muted max-w-lg mx-auto mt-4 leading-relaxed">
              Thank you for choosing IMPACT Enterprise. An executive team member will review your scope and follow up with a technical roadmap and next steps.
            </p>

            {/* Direct Escalation Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/923147893907?text=Hi%20IMPACT%20Enterprise,%20I%20just%20submitted%20project%20inquiry%20${encodeURIComponent(submissionId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Notify Leadership on WhatsApp</span>
              </a>
              <a
                href={`mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20Ref:%20${encodeURIComponent(submissionId)}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-surfaceAlt text-brand-dark font-bold text-xs transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Send Additional Specs via Email</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-center gap-4">
              <Link
                href="/projects"
                className="px-6 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-black text-white text-xs font-bold transition-all"
              >
                Explore Case Studies
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-dark text-xs font-semibold hover:bg-brand-surface transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* INTAKE FORM WIZARD CONTAINER */
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-10 shadow-card">
            {/* Interactive Step Navigator at Top */}
            <div className="mb-8 pb-6 border-b border-brand-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-subtle mb-3">
                <span className="text-brand-dark font-black">
                  Step 0{currentStep} of 0{totalSteps}: {stepNames[currentStep - 1]}
                </span>
                <span className="text-brand-accent font-mono">
                  {Math.round((currentStep / totalSteps) * 100)}% Completed
                </span>
              </div>

              {/* Clickable Step Pills */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {stepNames.map((sName, idx) => {
                  const sNum = idx + 1;
                  const isActive = currentStep === sNum;
                  const isPast = currentStep > sNum;
                  return (
                    <button
                      key={sName}
                      type="button"
                      onClick={() => setCurrentStep(sNum)}
                      className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? "bg-brand-accent text-white shadow-xs font-bold scale-105"
                          : isPast
                          ? "bg-brand-accentSoft text-brand-accent hover:bg-brand-accent hover:text-white"
                          : "bg-brand-surface text-brand-subtle hover:text-brand-dark"
                      }`}
                      title={`Jump to Step ${sNum}: ${sName}`}
                    >
                      <span className="text-[9px] font-mono tracking-tighter">0{sNum}</span>
                      <span className="text-[10px] font-bold truncate w-full hidden md:inline">
                        {sName.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Banner with Instant 1-Click Fallback Options */}
            {errorMessage && (
              <div className="mb-6 p-5 rounded-2xl bg-red-50/90 border border-red-200 text-red-900 text-xs font-semibold animate-in fade-in space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-red-800">Submission Notice</div>
                    <div className="mt-0.5 text-red-700 leading-relaxed">{errorMessage}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-200/70 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                    Instant 1-Click Backup:
                  </span>
                  <a
                    href={generateWhatsAppIntakeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Send via WhatsApp</span>
                  </a>
                  <a
                    href={generateGmailIntakeUrl()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EA4335] hover:bg-[#D93025] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                  </a>
                </div>
              </div>
            )}

            {/* STEP 1: WHAT DO YOU WANT TO BUILD? */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 1 of 7 • Category
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHAT DO YOU WANT TO BUILD?
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Click any option below to select and auto-advance to Step 2.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {projectTypes.map((item) => {
                    const isSelected = projectType === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleSelectProjectType(item.label)}
                        className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between group ${
                          isSelected
                            ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                            : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                              {item.label}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-brand-accent font-black" />
                            )}
                          </div>
                          <p className="text-[11px] text-brand-muted leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {projectType === "Other" && (
                  <div className="mt-3 p-4 rounded-2xl bg-brand-surface border border-brand-border">
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Please specify your custom project requirement:
                    </label>
                    <input
                      type="text"
                      value={customProjectType}
                      onChange={(e) => setCustomProjectType(e.target.value)}
                      placeholder="e.g. AI-driven logistics tracker, custom hardware API bridge..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: WHAT IS THE MAIN GOAL? */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 2 of 7 • Primary Objective
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHAT IS THE MAIN GOAL?
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Click the primary commercial outcome to auto-advance to Step 3.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goals.map((item) => {
                    const isSelected = goal === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleSelectGoal(item.label)}
                        className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between group ${
                          isSelected
                            ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                            : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                            {item.label}
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-accent font-black flex-shrink-0 mt-0.5 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {goal === "Other" && (
                  <div className="mt-3 p-4 rounded-2xl bg-brand-surface border border-brand-border">
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Please specify your main goal:
                    </label>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g. Integrate POS orders with delivery routing..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DESCRIBE YOUR IDEA */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 3 of 7 • Scope & Requirements
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    DESCRIBE YOUR PROJECT VISION
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    You do not need to use technical jargon. Type freely or click a prompt suggestion below.
                  </p>
                </div>

                {/* Prompt suggestion chips */}
                <div>
                  <span className="text-[11px] font-bold text-brand-subtle uppercase tracking-wider block mb-2">
                    Quick Suggestions (Click to fill):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDescription(prompt)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-accentSoft border border-brand-border hover:border-brand-accent text-brand-charcoal text-left transition-all"
                      >
                        + {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what you want to build. What problem are you solving? What systems or users need to connect? (Optional: You can also leave this blank and discuss on our call)."
                    className="w-full p-4 rounded-2xl border border-brand-border bg-white text-brand-dark text-sm leading-relaxed focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-y"
                  />
                  <div className="mt-2 text-xs text-brand-muted flex items-center justify-between">
                    <span>Be as detailed or brief as you like.</span>
                    <span className="font-mono">{description.length} characters</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Step 4 (Current Situation)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CURRENT SITUATION */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 4 of 7 • Current Starting Point
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHAT IS YOUR STARTING POINT?
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Click your current technical setup to auto-advance to Step 5.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {situations.map((item) => {
                    const isSelected = currentSituation === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleSelectSituation(item.label)}
                        className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between group ${
                          isSelected
                            ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                            : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                            {item.label}
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-accent font-black flex-shrink-0 mt-0.5 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: EXPECTED TIMELINE */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 5 of 7 • Delivery Window
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    EXPECTED TIMELINE
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Click your preferred delivery window to auto-advance to Step 6.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timelines.map((item) => {
                    const isSelected = timeline === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleSelectTimeline(item.label)}
                        className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between group ${
                          isSelected
                            ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                            : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                            {item.label}
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-accent font-black flex-shrink-0 mt-0.5 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: BUDGET RANGE */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 6 of 7 • Commercial Scope
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    BUDGET RANGE
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Select a tier to calculate the right system architecture without over-engineering.
                  </p>
                </div>

                <div className="space-y-3">
                  {budgetRanges.map((item) => {
                    const isSelected = budgetRange === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleSelectBudget(item.label)}
                        className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                          isSelected
                            ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                            : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                            {item.label}
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-accent font-black flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: CONTACT INFORMATION & FINAL SUBMIT */}
            {currentStep === 7 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Step 7 of 7 • Final Step
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHERE SHOULD WE SEND YOUR ARCHITECTURAL OUTLINE?
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    Please provide your contact details so our leadership team can send your project evaluation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Morgan Systems or New Venture"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000 or +92 300 0000000"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Country / Region
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States, United Kingdom, UAE, Pakistan..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Live Summary of All Answers */}
                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-dark uppercase tracking-wider">
                      Your Project Summary:
                    </span>
                    <span className="text-brand-teal font-semibold">Ready for Review</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-brand-charcoal">
                    <div className="p-2.5 rounded-lg bg-white border border-brand-border/70">
                      <span className="text-brand-subtle block text-[10px]">BUILD:</span>
                      <strong className="font-bold truncate block">{projectType || "Not specified"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-brand-border/70">
                      <span className="text-brand-subtle block text-[10px]">GOAL:</span>
                      <strong className="font-bold truncate block">{goal || "Not specified"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-brand-border/70">
                      <span className="text-brand-subtle block text-[10px]">TIMELINE:</span>
                      <strong className="font-bold truncate block">{timeline || "Not specified"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-brand-border/70">
                      <span className="text-brand-subtle block text-[10px]">BUDGET:</span>
                      <strong className="font-bold truncate block">{budgetRange || "Not specified"}</strong>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-brand-accent hover:bg-brand-accentHover text-white font-black text-base shadow-md hover:shadow-cardHover transition-all flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider uppercase"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        <span>Transmitting Your Project Data...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>SUBMIT PROJECT TO IMPACT ENGINEERING</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Persistent Step Navigation Controls (Available for steps 1-6) */}
            {currentStep < 7 && (
              <div className="mt-8 pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-surface transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>

                <div className="text-xs text-brand-muted text-center">
                  💡 Click any option above to auto-advance, or press Continue
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartAProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm font-semibold text-brand-muted">
          Loading IMPACT project intake...
        </div>
      }
    >
      <IntakeFormInner />
    </Suspense>
  );
}
