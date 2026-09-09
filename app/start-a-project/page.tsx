"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Send, AlertCircle, RefreshCcw, HelpCircle, Check } from "lucide-react";

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
      setProjectType("Automation");
      setGoal("Automate operations");
    } else if (solutionParam === "web-app") {
      setProjectType("Web Application");
      setGoal("Build a new product");
    }

    if (situationParam === "idea") {
      setCurrentSituation("Idea only");
    } else if (situationParam === "existing") {
      setCurrentSituation("Existing application");
    }

    if (objectiveParam) {
      if (objectiveParam === "Build something new") setProjectType("Web Application");
      else if (objectiveParam === "Automate something") setProjectType("Automation");
      else if (objectiveParam === "Add AI") setProjectType("AI Agent");
      else if (objectiveParam === "Improve an existing system") setProjectType("Custom Software");
      else if (objectiveParam === "Create a digital product") setProjectType("SaaS Product");

      const note = `Objective: ${objectiveParam}. ${usersParam ? `Target Users: ${usersParam}. ` : ""}${frictionParam ? `Primary Friction: ${frictionParam}.` : ""}`;
      setDescription((prev) => (prev ? prev : note));
    }
  }, [searchParams]);

  // Step 1 Options
  const projectTypes = [
    { label: "AI System", desc: "LLMs, RAG, computer vision, or predictive data models" },
    { label: "AI Agent", desc: "Autonomous reasoning, customer support, sales, or voice agents" },
    { label: "Automation", desc: "Lead, CRM, or business process workflow automation" },
    { label: "Web Application", desc: "Modern full-stack web platforms and interactive apps" },
    { label: "Mobile Application", desc: "iOS & Android mobile apps engineered for scale" },
    { label: "SaaS Product", desc: "Multi-tenant software-as-a-service with user accounts & billing" },
    { label: "Business Platform", desc: "Multi-role operations system (e.g. branch, staff, dispatch)" },
    { label: "Custom Software", desc: "Bespoke internal tools, databases, or API microservices" },
    { label: "Other", desc: "A unique or cross-disciplinary technical requirement" },
  ];

  // Step 2 Options
  const goals = [
    { label: "Generate leads", desc: "Automate inbound capture and qualification" },
    { label: "Automate operations", desc: "Eliminate repetitive manual tasks across your team" },
    { label: "Improve customer service", desc: "Deploy 24/7 intelligent response systems" },
    { label: "Build a new product", desc: "Bring an ambitious digital concept to market" },
    { label: "Replace manual work", desc: "Convert spreadsheets and paper into clean software" },
    { label: "Analyze data", desc: "Extract actionable intelligence from complex files" },
    { label: "Create an AI assistant", desc: "Empower staff or customers with domain AI" },
    { label: "Other", desc: "Another specific commercial or operational outcome" },
  ];

  // Step 4 Options
  const situations = [
    { label: "Idea only", desc: "Starting fresh from a concept or business opportunity" },
    { label: "Existing website", desc: "Have a web presence needing intelligence or overhaul" },
    { label: "Existing application", desc: "Running software that requires expansion or rewriting" },
    { label: "Existing software", desc: "Legacy tool or desktop software to modernize" },
    { label: "Existing workflow", desc: "Manual business process currently run on spreadsheets" },
    { label: "Existing API/data", desc: "Have proprietary databases or APIs needing frontends or agents" },
  ];

  // Step 5 Options
  const timelines = [
    { label: "ASAP", desc: "Urgent launch or rapid sprint within 30 days" },
    { label: "1–3 months", desc: "Standard production release window" },
    { label: "3–6 months", desc: "Comprehensive enterprise build and rollout" },
    { label: "Flexible", desc: "Discovery and design first; timeline is open" },
  ];

  // Step 6 Options
  const budgetRanges = [
    { label: "$5,000 – $10,000", desc: "Focused automation, standalone agent, or lightweight MVP" },
    { label: "$10,000 – $25,000", desc: "Production web/mobile application or advanced multi-agent system" },
    { label: "$25,000 – $50,000", desc: "Complete multi-role platform, SaaS MVP, or multi-branch engine" },
    { label: "$50,000+", desc: "Enterprise infrastructure, high-throughput ecosystem, or ongoing product studio" },
    { label: "Undisclosed / Flexible", desc: "Open to scoping based on architectural recommendations" },
  ];

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
      if (!description.trim()) {
        setErrorMessage("Please provide a brief description of your idea.");
        return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please provide at least your Name and Email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectType: projectType === "Other" ? `Other: ${customProjectType}` : projectType,
          goal: goal === "Other" ? `Other: ${customGoal}` : goal,
          description,
          currentSituation,
          timeline,
          budgetRange,
          name,
          company,
          email,
          phone,
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit project.");
      }

      setSubmissionId(data.submissionId);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <div className="text-xs font-mono font-bold text-brand-subtle">
            IMPACT Client Intake
          </div>
        </div>

        {/* Confirmation Screen on Success */}
        {isSubmitted ? (
          <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-14 shadow-card text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface text-brand-teal border border-brand-border flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-mono font-bold text-brand-charcoal uppercase tracking-wider">
              Reference ID: {submissionId}
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight mt-4">
              Your idea has been received.
            </h1>

            <p className="text-lg font-semibold text-brand-accent mt-2">
              An IMPACT team member will review your requirements.
            </p>

            <p className="text-sm text-brand-muted max-w-lg mx-auto mt-4 leading-relaxed">
              Thank you for trusting IMPACT Technologies with your project vision. Our technical leadership team will analyze your submission and prepare an architectural outline and next steps.
            </p>

            {/* Next Steps Roadmap */}
            <div className="mt-8 p-6 rounded-2xl bg-brand-surface border border-brand-border text-left max-w-xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-3">
                What happens next:
              </div>
              <div className="space-y-3 text-xs text-brand-charcoal">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-brand-dark">Technical Review:</strong> We review the technical feasibility, AI/agent requirements, and system scope within 24–48 business hours.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-brand-dark">Scoping Discovery:</strong> We will reach out to <span className="font-mono font-semibold">{email}</span> to schedule a discovery call or share preliminary notes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-brand-dark">Confidentiality Guarantee:</strong> All proprietary ideas, data models, and business concepts remain strictly confidential.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/projects"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
              >
                Explore Real-World Projects
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-brand-border bg-white text-brand-dark font-semibold text-sm hover:bg-brand-surface transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* Intake Form Card */
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-12 shadow-card">
            {/* Progress Bar & Counter */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span className="text-brand-accent font-mono">
                  {Math.round((currentStep / totalSteps) * 100)}% Completed
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-surface border border-brand-border overflow-hidden">
                <div
                  className="h-full bg-brand-accent transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Steps */}
            <div>
              {/* STEP 1: What do you want to build? */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 1 • Project Category
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      WHAT DO YOU WANT TO BUILD?
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      Select the core category that best represents your system.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {projectTypes.map((item) => {
                      const isSelected = projectType === item.label;
                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setProjectType(item.label)}
                          className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                              : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-brand-dark">
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
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                        Please specify what you want to build:
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

              {/* STEP 2: What is the main goal? */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 2 • Primary Objective
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      WHAT IS THE MAIN GOAL?
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      What is the primary commercial or operational outcome you need to achieve?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goals.map((item) => {
                      const isSelected = goal === item.label;
                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setGoal(item.label)}
                          className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                            isSelected
                              ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                              : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-brand-dark">
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
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                        Please specify your main goal:
                      </label>
                      <input
                        type="text"
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        placeholder="e.g. Comply with new regulatory data audits..."
                        className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Describe your idea */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 3 • Detailed Scope
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      DESCRIBE YOUR IDEA.
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      Tell us what you want to build. You don&apos;t need to use technical language.
                    </p>
                  </div>

                  <div>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us what you want to build. You don't need to use technical language. Explain what the user does, what problem you want solved, or what systems you need connected."
                      className="w-full p-4 rounded-2xl border border-brand-border bg-white text-brand-dark text-sm leading-relaxed focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-y"
                    />
                    <div className="mt-2 text-xs text-brand-muted flex items-center justify-between">
                      <span>Be as detailed or as brief as you wish.</span>
                      <span className="font-mono">{description.length} characters</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Current situation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 4 • Starting Point
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      CURRENT SITUATION
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      Do you already have existing assets, code, or workflows?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {situations.map((item) => {
                      const isSelected = currentSituation === item.label;
                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setCurrentSituation(item.label)}
                          className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                            isSelected
                              ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                              : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-brand-dark">
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

              {/* STEP 5: Timeline */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 5 • Delivery Window
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      EXPECTED TIMELINE
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      When do you ideally need this system operational?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {timelines.map((item) => {
                      const isSelected = timeline === item.label;
                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setTimeline(item.label)}
                          className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                            isSelected
                              ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                              : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-brand-dark">
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

              {/* STEP 6: Budget Range */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 6 • Commercial Scope
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      BUDGET RANGE
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      Select a comfortable tier. This helps us recommend the right technical architecture without over-engineering.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {budgetRanges.map((item) => {
                      const isSelected = budgetRange === item.label;
                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setBudgetRange(item.label)}
                          className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                              : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-brand-dark">
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

              {/* STEP 7: Contact Information */}
              {currentStep === 7 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Step 7 • Final Step
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                      CONTACT INFORMATION
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                      Where should our engineering team send your project analysis?
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
                        Company / Project Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Morgan Dynamics or Stealth Startup"
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
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                        Country / Location
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

                  {/* Summary Review Card */}
                  <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs space-y-2">
                    <div className="font-bold text-brand-dark uppercase tracking-wider">
                      Project Intake Summary:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-brand-charcoal">
                      <div>
                        <span className="text-brand-subtle block">Build:</span>
                        <strong className="font-semibold">{projectType || "N/A"}</strong>
                      </div>
                      <div>
                        <span className="text-brand-subtle block">Goal:</span>
                        <strong className="font-semibold">{goal || "N/A"}</strong>
                      </div>
                      <div>
                        <span className="text-brand-subtle block">Timeline:</span>
                        <strong className="font-semibold">{timeline || "N/A"}</strong>
                      </div>
                      <div>
                        <span className="text-brand-subtle block">Budget:</span>
                        <strong className="font-semibold">{budgetRange || "N/A"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-black text-base shadow-sm hover:shadow-cardHover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCcw className="w-5 h-5 animate-spin" />
                          <span>Submitting Your Requirements...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>SUBMIT PROJECT</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step Navigation Controls (for steps 1-6) */}
            {currentStep < 7 && (
              <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-surface transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
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
