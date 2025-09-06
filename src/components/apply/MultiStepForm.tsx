import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from './ProgressBar';
import { FileUpload } from './FileUpload';
import { toast } from '@/hooks/use-toast';
import { User, GraduationCap, FileText, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  location: z.string().min(2, 'Please enter your location'),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
});

const professionalInfoSchema = z.object({
  dentalSchool: z.string().min(2, 'Please enter your dental school'),
  graduationYear: z.string().min(4, 'Please enter graduation year'),
  specialty: z.string().min(2, 'Please select your specialty'),
  licenseNumber: z.string().min(2, 'Please enter your license number'),
  licenseState: z.string().min(2, 'Please enter your license state'),
  experience: z.string().min(1, 'Please select your experience level'),
  currentRole: z.string().min(2, 'Please describe your current role'),
  bio: z.string().min(100, 'Bio must be at least 100 characters'),
});

const availabilitySchema = z.object({
  hoursPerWeek: z.string().min(1, 'Please select your availability'),
  timeZone: z.string().min(1, 'Please select your time zone'),
  preferredDays: z.array(z.string()).min(1, 'Please select at least one day'),
  sessionTypes: z.array(z.string()).min(1, 'Please select at least one session type'),
  hourlyRate: z.string().min(1, 'Please enter your hourly rate'),
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
});

interface MultiStepFormProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Professional', icon: GraduationCap },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Complete', icon: CheckCircle },
];

const specialties = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Endodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Oral Pathology'
];

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const sessionTypes = [
  'One-on-One Mentoring',
  'Group Sessions',
  'Resume Review',
  'Mock Interviews',
  'Board Preparation',
  'Career Guidance'
];

const specializations = [
  'NBDE Preparation',
  'Residency Applications',
  'International Students',
  'Career Transitions',
  'Practice Management',
  'Clinical Skills',
  'Research Guidance'
];

export const MultiStepForm = ({ onComplete }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
  
  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData
  });

  const professionalForm = useForm<z.infer<typeof professionalInfoSchema>>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: formData
  });

  const availabilityForm = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      preferredDays: [],
      sessionTypes: [],
      specializations: [],
      ...formData
    }
  });

  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await personalForm.trigger();
        if (isValid) {
          const data = personalForm.getValues();
          setFormData(prev => ({ ...prev, ...data }));
        }
        break;
      case 2:
        isValid = await professionalForm.trigger();
        if (isValid) {
          const data = professionalForm.getValues();
          setFormData(prev => ({ ...prev, ...data }));
        }
        break;
      case 3:
        // Check if required files are uploaded
        const requiredFiles = ['cv', 'license', 'diploma'];
        const hasAllFiles = requiredFiles.every(key => uploadedFiles[key]?.length > 0);
        if (!hasAllFiles) {
          toast({
            title: "Missing Documents",
            description: "Please upload all required documents to continue.",
            variant: "destructive"
          });
          return;
        }
        isValid = true;
        break;
    }
    
    if (isValid && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      ...availabilityForm.getValues(),
      documents: uploadedFiles
    };
    
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you within 48 hours.",
    });
    
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...personalForm.register('firstName')}
                    className={personalForm.formState.errors.firstName ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...personalForm.register('lastName')}
                    className={personalForm.formState.errors.lastName ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...personalForm.register('email')}
                    className={personalForm.formState.errors.email ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...personalForm.register('phone')}
                    className={personalForm.formState.errors.phone ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location (City, State) *</Label>
                  <Input
                    id="location"
                    {...personalForm.register('location')}
                    className={personalForm.formState.errors.location ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.location && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.location.message}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/yourname"
                    {...personalForm.register('linkedinUrl')}
                    className={personalForm.formState.errors.linkedinUrl ? 'border-destructive' : ''}
                  />
                  {personalForm.formState.errors.linkedinUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {personalForm.formState.errors.linkedinUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Professional Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dentalSchool">Dental School *</Label>
                  <Input
                    id="dentalSchool"
                    {...professionalForm.register('dentalSchool')}
                    className={professionalForm.formState.errors.dentalSchool ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.dentalSchool && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.dentalSchool.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    {...professionalForm.register('graduationYear')}
                    className={professionalForm.formState.errors.graduationYear ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.graduationYear && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.graduationYear.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Select onValueChange={(value) => professionalForm.setValue('specialty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {professionalForm.formState.errors.specialty && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.specialty.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select onValueChange={(value) => professionalForm.setValue('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-7">4-7 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                      <SelectItem value="13+">13+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {professionalForm.formState.errors.experience && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.experience.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    {...professionalForm.register('licenseNumber')}
                    className={professionalForm.formState.errors.licenseNumber ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.licenseNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.licenseNumber.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="licenseState">License State *</Label>
                  <Input
                    id="licenseState"
                    {...professionalForm.register('licenseState')}
                    className={professionalForm.formState.errors.licenseState ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.licenseState && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.licenseState.message}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="currentRole">Current Role/Position *</Label>
                  <Input
                    id="currentRole"
                    {...professionalForm.register('currentRole')}
                    className={professionalForm.formState.errors.currentRole ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.currentRole && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.currentRole.message}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell us about your experience, expertise, and what makes you a great mentor..."
                    {...professionalForm.register('bio')}
                    className={professionalForm.formState.errors.bio ? 'border-destructive' : ''}
                  />
                  {professionalForm.formState.errors.bio && (
                    <p className="text-sm text-destructive mt-1">
                      {professionalForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Required Documents</h3>
              <div className="space-y-6">
                <FileUpload
                  title="CV/Resume"
                  description="Upload your current CV or resume"
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                  required
                  onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, cv: files }))}
                />
                
                <FileUpload
                  title="Dental License"
                  description="Upload a copy of your current dental license"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  required
                  onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, license: files }))}
                />
                
                <FileUpload
                  title="Diploma/Certificate"
                  description="Upload your dental school diploma or certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  required
                  onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, diploma: files }))}
                />
                
                <FileUpload
                  title="Additional Certifications (Optional)"
                  description="Any additional relevant certifications"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, additional: files }))}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Availability & Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Hours per Week *</Label>
                  <Select onValueChange={(value) => availabilityForm.setValue('hoursPerWeek', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10 hours</SelectItem>
                      <SelectItem value="10-15">10-15 hours</SelectItem>
                      <SelectItem value="15-20">15-20 hours</SelectItem>
                      <SelectItem value="20+">20+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Time Zone *</Label>
                  <Select onValueChange={(value) => availabilityForm.setValue('timeZone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern (EST)</SelectItem>
                      <SelectItem value="CST">Central (CST)</SelectItem>
                      <SelectItem value="MST">Mountain (MST)</SelectItem>
                      <SelectItem value="PST">Pacific (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Hourly Rate (USD) *</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    {...availabilityForm.register('hourlyRate')}
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div>
                  <Label className="text-base font-medium">Preferred Days *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          onCheckedChange={(checked) => {
                            const current = availabilityForm.getValues('preferredDays') || [];
                            if (checked) {
                              availabilityForm.setValue('preferredDays', [...current, day]);
                            } else {
                              availabilityForm.setValue('preferredDays', current.filter(d => d !== day));
                            }
                          }}
                        />
                        <Label htmlFor={day} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Session Types *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {sessionTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          onCheckedChange={(checked) => {
                            const current = availabilityForm.getValues('sessionTypes') || [];
                            if (checked) {
                              availabilityForm.setValue('sessionTypes', [...current, type]);
                            } else {
                              availabilityForm.setValue('sessionTypes', current.filter(t => t !== type));
                            }
                          }}
                        />
                        <Label htmlFor={type} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Specializations *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {specializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          onCheckedChange={(checked) => {
                            const current = availabilityForm.getValues('specializations') || [];
                            if (checked) {
                              availabilityForm.setValue('specializations', [...current, spec]);
                            } else {
                              availabilityForm.setValue('specializations', current.filter(s => s !== spec));
                            }
                          }}
                        />
                        <Label htmlFor={spec} className="text-sm">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <ProgressBar currentStep={currentStep} totalSteps={4} steps={steps} />
      
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>
      
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
};