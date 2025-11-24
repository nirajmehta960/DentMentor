import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStepPersistence } from "@/hooks/useFormPersistence";
import { MenteeOnboardingLayout } from "@/components/mentee-onboarding/MenteeOnboardingLayout";
import { PersonalInformationStep } from "@/components/mentee-onboarding/PersonalInformationStep";
import { ExamsTimelineStep } from "@/components/mentee-onboarding/ExamsTimelineStep";
import { GoalsPreferencesStep } from "@/components/mentee-onboarding/GoalsPreferencesStep";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MenteeOnboarding = () => {
  const {
    user,
    userType,
    menteeProfile,
    updateMenteeProfile,
    currentOnboardingStep,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading,
    refreshProfile,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(currentOnboardingStep);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load profile if not loaded yet (for new OAuth users who skipped profile load)
  // Use a ref to prevent infinite loops - only attempt once
  const hasAttemptedProfileLoad = useRef(false);
  useEffect(() => {
    if (
      user &&
      userType === "mentee" &&
      !menteeProfile &&
      !isProfileLoading &&
      !hasAttemptedProfileLoad.current
    ) {
      hasAttemptedProfileLoad.current = true;
      refreshProfile();
    }
  }, [user, userType, menteeProfile, isProfileLoading, refreshProfile]);

  // Form persistence for each step
  const step1Data = useOnboardingStepPersistence(
    1,
    "mentee",
    menteeProfile || {}
  );
  const step2Data = useOnboardingStepPersistence(
    2,
    "mentee",
    menteeProfile || {}
  );
  const step3Data = useOnboardingStepPersistence(
    3,
    "mentee",
    menteeProfile || {}
  );

  // Redirect to mentors page if onboarding is already complete
  useEffect(() => {
    if (onboardingComplete) {
      navigate("/mentors", { replace: true });
    }
  }, [onboardingComplete, navigate]);

  const handleNext = async (stepData: any) => {
    const nextStep = currentStep + 1;

    // Save step data with persistence
    const stepPersistence = [step1Data, step2Data, step3Data][currentStep - 1];
    stepPersistence.updateData(stepData);
    stepPersistence.saveData();

    // Update mentee profile in database
    // Clean up the data: convert empty strings to null/undefined for optional fields
    const cleanedStepData = { ...stepData };

    // Convert empty string to null for optional numeric fields
    if (
      cleanedStepData.english_score === "" ||
      cleanedStepData.english_score === null
    ) {
      cleanedStepData.english_score = null;
    }

    // Ensure english_score is a number if provided
    if (
      cleanedStepData.english_score !== null &&
      cleanedStepData.english_score !== undefined
    ) {
      cleanedStepData.english_score = Number(cleanedStepData.english_score);
    }

    const result = await updateMenteeProfile({
      ...cleanedStepData,
      onboarding_step: nextStep,
    });

    if (result.success) {
      if (nextStep > 3) {
        // Complete onboarding
        const completionResult = await updateMenteeProfile({
          onboarding_completed: true,
        });
        if (completionResult.success) {
          // Clear all step persistence data
          step1Data.clearData();
          step2Data.clearData();
          step3Data.clearData();

          toast({
            title: "Welcome to DentMentor! 🎉",
            description:
              "Your profile is complete. Let's find you the perfect mentor!",
          });
          // Force redirect to mentors page
          window.location.href = "/mentors";
        }
      } else {
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show loading only while auth is loading
  // Don't wait for profile loading - allow user to start onboarding immediately
  // Profile will load in background
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#008B8B] to-[#20B2AA]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const combinedData = {
      ...menteeProfile,
      ...([step1Data, step2Data, step3Data][currentStep - 1]?.data || {}),
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInformationStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <ExamsTimelineStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <GoalsPreferencesStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MenteeOnboardingLayout currentStep={currentStep}>
      {renderStep()}
    </MenteeOnboardingLayout>
  );
};

export default MenteeOnboarding;
