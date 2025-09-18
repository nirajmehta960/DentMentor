import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditModeFromUrl = searchParams.get('edit') === '1' || searchParams.get('edit') === 'true';
  
  // Compute edit mode based on current state
  const isEditMode = onboardingComplete || isEditModeFromUrl;
  
  // Use ref to track current step to prevent re-initialization
  const currentStepRef = useRef(isEditMode ? 1 : currentOnboardingStep);
  const [currentStep, setCurrentStep] = useState(currentStepRef.current);
  
  // Track if we're in edit mode to prevent unwanted resets
  const editModeRef = useRef(isEditMode);
  
  // Update edit mode ref when it changes
  useEffect(() => {
    editModeRef.current = isEditMode;
  }, [isEditMode]);
  
  // Only reset to step 1 if we're entering edit mode for the first time
  useEffect(() => {
    if (isEditMode && !editModeRef.current) {
      currentStepRef.current = 1;
      setCurrentStep(1);
    }
  }, [isEditMode]);
  
  // Update ref when step changes
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form persistence for each step
  const step1Data = useOnboardingStepPersistence(1, 'mentor', mentorProfile || {});
  const step2Data = useOnboardingStepPersistence(2, 'mentor', mentorProfile || {});
  const step3Data = useOnboardingStepPersistence(3, 'mentor', mentorProfile || {});
  const step4Data = useOnboardingStepPersistence(4, 'mentor', mentorProfile || {});
  const step5Data = useOnboardingStepPersistence(5, 'mentor', mentorProfile || {});


  // Redirect to dashboard if onboarding is already complete (unless in edit mode)
  useEffect(() => {
    if (onboardingComplete && !isEditMode) {
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingComplete, isEditMode, navigate]);

  const handleNext = async (stepData: any) => {
    const nextStep = currentStep + 1;
    
    // Save step data with persistence
    const stepPersistence = [step1Data, step2Data, step3Data, step4Data, step5Data][currentStep - 1];
    stepPersistence.updateData(stepData);
    stepPersistence.saveData();

    // Convert years_experience to number if it exists
    if (stepData.years_experience) {
      stepData.years_experience = parseInt(stepData.years_experience, 10);
    }

        // Update mentor profile in database
        // In edit mode, don't update onboarding_step and don't update context
        const updateData = isEditMode ? stepData : { ...stepData, onboarding_step: nextStep };
        const success = await updateMentorProfile(updateData, !isEditMode);
    
    if (success) {
      if (nextStep > 5) {
        // Complete onboarding or finish editing
        if (!isEditMode) {
          const completionSuccess = await updateMentorProfile({ onboarding_completed: true }, true);
          if (completionSuccess) {
            // Clear all step persistence data
            step1Data.clearData();
            step2Data.clearData();
            step3Data.clearData();
            step4Data.clearData();
            step5Data.clearData();
            
            toast({
              title: "Onboarding Complete!",
              description: "Welcome to DentMentor! Your profile is now live.",
            });
            // Force redirect to dashboard
            window.location.href = '/dashboard';
          }
        } else {
          // Edit mode completion
          step1Data.clearData();
          step2Data.clearData();
          step3Data.clearData();
          step4Data.clearData();
          step5Data.clearData();
          
          toast({
            title: "Profile Updated!",
            description: "Your profile has been successfully updated.",
          });
          navigate('/dashboard');
        }
        } else {
          currentStepRef.current = nextStep;
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
        // Force redirect to dashboard
        window.location.href = '/dashboard';
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