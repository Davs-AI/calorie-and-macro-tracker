"use client";
import { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";
// Keep whatever other imports you already have at the top of your file!

export default function Page() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding
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
      {/* Show onboarding modal if user hasn't set up yet */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Your existing dashboard/app code goes right here */}
      <div className={showOnboarding ? "filter blur-sm pointer-events-none" : ""}>
        {/* Paste your existing dashboard UI code or components here */}
      </div>
    </main>
  );
}