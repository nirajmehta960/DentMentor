import { useState, useEffect, useCallback } from 'react';
import { FormPersistenceOptions, OnboardingStepData } from '@/types/auth';

export const useFormPersistence = <T extends Record<string, any>>(
  initialData: T,
  options: FormPersistenceOptions
) => {
  const { key, excludeFields = [], autoSave = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      // Silently handle error
    }
  }, [key]);

  // Auto-save data when it changes (if enabled)
  useEffect(() => {
    if (autoSave && hasChanges) {
      saveData();
    }
  }, [data, autoSave, hasChanges]);

  const saveData = useCallback(() => {
    try {
      const dataToSave = { ...data };
      
      // Remove excluded fields
      excludeFields.forEach(field => {
        delete dataToSave[field];
      });

      sessionStorage.setItem(key, JSON.stringify(dataToSave));
      setHasChanges(false);
    } catch (error) {
      // Silently handle error
    }
  }, [data, excludeFields, key]);

  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({
      ...prev,
      ...updates
    }));
    setHasChanges(true);
  }, []);

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  }, []);

  const clearData = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setData(initialData);
      setHasChanges(false);
    } catch (error) {
      // Silently handle error
    }
  }, [key, initialData]);

  const resetData = useCallback(() => {
    setData(initialData);
    setHasChanges(true);
  }, [initialData]);

  return {
    data,
    updateData,
    updateField,
    saveData,
    clearData,
    resetData,
    hasChanges,
  };
};

// Specialized hook for onboarding step data
export const useOnboardingStepPersistence = (
  stepNumber: number,
  userType: 'mentor' | 'mentee',
  initialData: OnboardingStepData = {}
) => {
  const key = `dentmentor-onboarding-${userType}-step-${stepNumber}`;
  
  return useFormPersistence(initialData, {
    key,
    excludeFields: ['password', 'confirmPassword'],
    autoSave: true,
  });
};

// Hook for signup form persistence
export const useSignUpFormPersistence = (initialData: any = {}) => {
  return useFormPersistence(initialData, {
    key: 'dentmentor-signup-data',
    excludeFields: ['password', 'confirmPassword'],
    autoSave: true,
  });
};