import React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

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
  description: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'service',
    label: 'Choose Service',
    shortLabel: 'Service',
    description: 'Select the type of session'
  },
  {
    id: 'availability',
    label: 'Pick Date & Time',
    shortLabel: 'Schedule',
    description: 'Choose when to meet'
  },
  {
    id: 'confirmation',
    label: 'Confirm Booking',
    shortLabel: 'Confirm',
    description: 'Review and confirm'
  }
];

/**
 * The booking steps as a numbered rail. A step is a real button only when it
 * can be revisited (completed, or the one you're on) — the same rule as before.
 */
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

  const isConnectorDone = (index: number) =>
    index < currentStepIndex || completedSteps.includes(STEPS[index].id);

  const handleStepClick = (step: StepConfig) => {
    if (onStepClick && (completedSteps.includes(step.id) || step.id === currentStep)) {
      onStepClick(step.id);
    }
  };

  const current = STEPS[currentStepIndex];

  return (
    <nav aria-label="Booking progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable = !!onStepClick && (completedSteps.includes(step.id) || step.id === currentStep);

          return (
            <li
              key={step.id}
              className={cn('flex min-w-0 items-center', index < STEPS.length - 1 ? 'flex-1' : 'shrink-0')}
            >
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={!isClickable}
                aria-current={status === 'current' ? 'step' : undefined}
                className="flex min-h-11 shrink-0 items-center gap-3 rounded-full pr-1 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-[background-color,border-color,color,box-shadow] duration-300',
                    status === 'completed' && 'bg-primary text-primary-foreground',
                    status === 'current' && 'border-2 border-primary bg-white text-primary shadow-[0_0_0_4px_rgb(15_112_93/0.1)]',
                    status === 'upcoming' && 'border border-border bg-white text-muted-foreground'
                  )}
                >
                  {status === 'completed' ? <Check className="size-4" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className="hidden min-w-0 flex-col md:flex">
                  <span
                    className={cn(
                      'text-sm font-medium leading-tight',
                      status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.description}</span>
                </span>
                <span className="sr-only md:hidden">{step.label}</span>
              </button>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 block h-px min-w-4 flex-1 transition-colors duration-500 sm:mx-3',
                    isConnectorDone(index) ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Current step, spelled out where the rail has no room for labels */}
      <p className="mt-3 text-sm text-muted-foreground md:hidden">
        <span className="tabular-nums">Step {currentStepIndex + 1} of {STEPS.length}</span>
        <span aria-hidden="true"> · </span>
        <span className="font-medium text-foreground">{current?.label}</span>
      </p>
    </nav>
  );
};
