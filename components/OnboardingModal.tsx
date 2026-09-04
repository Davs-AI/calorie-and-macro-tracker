"use client";
import { useState } from "react";

interface OnboardingProps {
  onComplete: (data: { age: string; weight: string; goalWeight: string; goal: string }) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ age: "", weight: "", goalWeight: "", goal: "maintain" });

  const handleNext = () => setStep(step + 1);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-2">Welcome to Davs AI</h2>
        <p className="text-neutral-400 text-sm mb-6">Let's set up your profile to calculate your targets.</p>

        {step === 1 && (
          <div>
            <label className="block text-sm mb-2">How old are you?</label>
            <input 
              type="number" 
              value={formData.age} 
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white mb-4"
              placeholder="e.g. 14"
            />
            <button onClick={handleNext} className="w-full bg-emerald-500 text-black font-semibold p-3 rounded-lg">Next</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-sm mb-2">What is your current weight (lbs)?</label>
            <input 
              type="number" 
              value={formData.weight} 
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white mb-4"
              placeholder="e.g. 150"
            />
            <button onClick={handleNext} className="w-full bg-emerald-500 text-black font-semibold p-3 rounded-lg">Next</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block text-sm mb-2">What is your goal weight (lbs)?</label>
            <input 
              type="number" 
              value={formData.goalWeight} 
              onChange={(e) => setFormData({...formData, goalWeight: e.target.value})}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white mb-4"
              placeholder="e.g. 160"
            />
            <button onClick={() => onComplete(formData)} className="w-full bg-emerald-500 text-black font-semibold p-3 rounded-lg">Finish Setup</button>
          </div>
        )}
      </div>
    </div>
  );
}