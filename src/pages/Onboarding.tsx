import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStepPersistence } from '@/hooks/useFormPersistence';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ProfessionalProfileStep } from '@/components/onboarding/ProfessionalProfileStep';
import { EducationBackgroundStep } from '@/components/onboarding/EducationBackgroundStep';
import { SpecialtiesLanguagesStep } from '@/components/onboarding/SpecialtiesLanguagesStep';
import { ServicesOfferedStep } from '@/components/onboarding/ServicesOfferedStep';
import { VerificationStep } from '@/components/onboarding/VerificationStep';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const {
    mentorProfile,
    updateMentorProfile,
    currentOnboardingStep,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading
  } = useAuth();
  
  // If user is in edit mode (onboarding complete), start at step 1
  // Otherwise use their current onboarding step
  const [currentStep, setCurrentStep] = useState(onboardingComplete ? 1 : currentOnboardingStep);
  const [isEditMode] = useState(onboardingComplete);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form persistence for each step
  const step1Data = useOnboardingStepPersistence(1, 'mentor', mentorProfile || {});
  const step2Data = useOnboardingStepPersistence(2, 'mentor', mentorProfile || {});
  const step3Data = useOnboardingStepPersistence(3, 'mentor', mentorProfile || {});
  const step4Data = useOnboardingStepPersistence(4, 'mentor', mentorProfile || {});
  const step5Data = useOnboardingStepPersistence(5, 'mentor', mentorProfile || {});

  const handleNext = async (stepData: any) => {
    const nextStep = currentStep + 1;
    
    // Save step data with persistence
    const stepPersistence = [step1Data, step2Data, step3Data, step4Data, step5Data][currentStep - 1];
    stepPersistence.updateData(stepData);
    stepPersistence.saveData();

    // Update mentor profile in database
    // In edit mode, don't update onboarding_step
    const updateData = isEditMode ? stepData : { ...stepData, onboarding_step: nextStep };
    const success = await updateMentorProfile(updateData);
    
    if (success) {
      if (nextStep > 5) {
        // Complete onboarding or finish editing
        if (!isEditMode) {
          await updateMentorProfile({ onboarding_completed: true });
        }
        
        // Clear all step persistence data
        step1Data.clearData();
        step2Data.clearData();
        step3Data.clearData();
        step4Data.clearData();
        step5Data.clearData();
        
        toast({
          title: isEditMode ? "Profile Updated!" : "Onboarding Complete!",
          description: isEditMode 
            ? "Your profile has been successfully updated." 
            : "Welcome to DentMentor! Your profile is now live.",
        });
        navigate('/dashboard');
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

  const handleSkip = async () => {
    // Skip to completion (for step 5 only) - only available in onboarding mode
    if (!isEditMode) {
      const success = await updateMentorProfile({ onboarding_completed: true });
      if (success) {
        // Clear all step persistence data
        step1Data.clearData();
        step2Data.clearData();
        step3Data.clearData();
        step4Data.clearData();
        step5Data.clearData();
        
        toast({
          title: "Onboarding Complete!",
          description: "You can complete verification later from your dashboard.",
        });
        navigate('/dashboard');
      }
    }
  };

  // Show loading while auth or profile data is loading
  if (isLoading || isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const combinedData = {
      ...mentorProfile,
      ...([step1Data, step2Data, step3Data, step4Data, step5Data][currentStep - 1]?.data || {})
    };

    switch (currentStep) {
      case 1:
        return (
          <ProfessionalProfileStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <EducationBackgroundStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <SpecialtiesLanguagesStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ServicesOfferedStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <VerificationStep
            data={combinedData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} isEditMode={isEditMode}>
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;