import React from 'react';
import { Check, Calendar, Clock, CheckCircle } from 'lucide-react';

export type BookingStep = 'service' | 'availability' | 'confirmation';

interface ProgressIndicatorProps {
  currentStep: BookingStep;
  completedSteps: BookingStep[];
  onStepClick?: (step: BookingStep) => void;
  className?: string;
}

interface StepConfig {
  id: BookingStep;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'service',
    label: 'Choose Service',
    shortLabel: 'Service',
    icon: Calendar,
    description: 'Select the type of session'
  },
  {
    id: 'availability',
    label: 'Pick Date & Time',
    shortLabel: 'Schedule',
    icon: Clock,
    description: 'Choose when to meet'
  },
  {
    id: 'confirmation',
    label: 'Confirm Booking',
    shortLabel: 'Confirm',
    icon: CheckCircle,
    description: 'Review and confirm'
  }
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  className = ''
}) => {
  const getStepIndex = (step: BookingStep) => STEPS.findIndex(s => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  const getStepStatus = (step: StepConfig, index: number) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (step.id === currentStep) return 'current';
    if (index < currentStepIndex) return 'completed';
    return 'upcoming';
  };

  const getStepStyles = (status: string, isClickable: boolean) => {
    const baseStyles = "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300";
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-primary border-primary text-white ${isClickable ? 'cursor-pointer hover:bg-primary/90' : ''}`;
      case 'current':
        return `${baseStyles} bg-primary/10 border-primary text-primary ring-4 ring-primary/20`;
      default:
        return `${baseStyles} bg-background border-muted-foreground/30 text-muted-foreground ${isClickable ? 'cursor-pointer hover:border-primary/50 hover:text-primary' : ''}`;
    }
  };

  const getConnectorStyles = (index: number) => {
    const isCompleted = index < currentStepIndex || completedSteps.includes(STEPS[index].id);
    return `flex-1 h-0.5 mx-2 transition-all duration-500 ${
      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
    }`;
  };

  const handleStepClick = (step: StepConfig) => {
    if (onStepClick && (completedSteps.includes(step.id) || step.id === currentStep)) {
      onStepClick(step.id);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Progress Indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step, index);
            const isClickable = onStepClick && (completedSteps.includes(step.id) || step.id === currentStep);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={getStepStyles(status, isClickable)}
                    onClick={() => handleStepClick(step)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleStepClick(step);
                      }
                    }}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium ${
                      status === 'current' ? 'text-primary' : 
                      status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className={getConnectorStyles(index)} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step, index);
            const isClickable = onStepClick && (completedSteps.includes(step.id) || step.id === currentStep);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`${getStepStyles(status, isClickable)} w-8 h-8`}
                    onClick={() => handleStepClick(step)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                  >
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`text-xs font-medium mt-1 ${
                    status === 'current' ? 'text-primary' : 
                    status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.shortLabel}
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className={`${getConnectorStyles(index)} mx-1`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Description */}
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {STEPS.find(s => s.id === currentStep)?.label}
          </div>
          <div className="text-sm text-muted-foreground">
            {STEPS.find(s => s.id === currentStep)?.description}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-muted-foreground/20 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ 
            width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` 
          }}
        />
      </div>

      {/* Step Counter */}
      <div className="text-center mt-2 text-xs text-muted-foreground">
        Step {currentStepIndex + 1} of {STEPS.length}
      </div>
    </div>
  );
};