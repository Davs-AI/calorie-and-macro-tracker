"use client";
import { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";

export default function Page() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("davsai_profile");
    if (!savedProfile) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem("davsai_profile", JSON.stringify(data));
    setShowOnboarding(false);
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <div className={`p-6 max-w-4xl mx-auto ${showOnboarding ? "filter blur-sm pointer-events-none" : ""}`}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
              Davs AI
            </h1>
            <p className="text-neutral-400 text-sm">AI calorie & macro tracker</p>
          </div>
        </header>

        {/* Your dashboard content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-neutral-400 text-sm mb-2">Calories Remaining</h3>
            <div className="text-4xl font-bold text-emerald-400">2000</div>
          </div>
        </div>
      </div>
    </main>
  );
}