import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowRight, Camera } from 'lucide-react';
import { ProfileImageCropper } from '@/components/dashboard/ProfileImageCropper';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalProfileStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 
  'Brazil', 'Canada', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 
  'Ghana', 'Greece', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Italy', 'Japan', 'Jordan', 
  'Kenya', 'Mexico', 'Nepal', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 
  'Russia', 'Saudi Arabia', 'South Korea', 'Spain', 'Sweden', 'Turkey', 
  'United Kingdom', 'United States', 'Venezuela', 'Vietnam'
];

export const ProfessionalProfileStep = ({ data, onNext, onPrevious }: ProfessionalProfileStepProps) => {
  const [formData, setFormData] = useState({
    profile_photo_url: data?.profile_photo_url || '',
    professional_headline: data?.professional_headline || '',
    professional_bio: data?.professional_bio || '',
    country_of_origin: data?.country_of_origin || '',
    years_experience: data?.years_experience || '',
    linkedin_url: data?.linkedin_url || '',
    email: data?.email || ''
  });

  const [photoPreview, setPhotoPreview] = useState(data?.profile_photo_url || '');
  const [showImageCropper, setShowImageCropper] = useState(false);
  const { toast } = useToast();

  const handleImageSaved = async (croppedImage: string) => {
    try {
      // Just update the form data with the cropped image URL
      // The actual database update will happen when the form is submitted
      setFormData(prev => ({ ...prev, profile_photo_url: croppedImage }));
      setPhotoPreview(croppedImage);

      toast({
        title: "Photo updated successfully!",
        description: "Your profile photo has been updated.",
      });

      setShowImageCropper(false);
    } catch (error: any) {
      toast({
        title: "Error updating photo",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.professional_headline.trim()) {
      toast({
        title: "Professional headline required",
        description: "Please add your professional headline.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.professional_bio.trim()) {
      toast({
        title: "Professional bio required", 
        description: "Please add your professional bio.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.country_of_origin) {
      toast({
        title: "Country of origin required",
        description: "Please select your country of origin.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    onNext(formData);
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Professional Profile</h2>
        <p className="text-muted-foreground">
          Tell students about your professional background and expertise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <Card className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-4 group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={photoPreview} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setShowImageCropper(true)}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageCropper(true)}
                className="mb-2"
              >
                <Camera className="w-4 h-4 mr-2" />
                {photoPreview ? 'Change Photo' : 'Upload & Crop Photo'}
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG up to 5MB. Click to upload and crop your photo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        {/* Professional Headline */}
        <div className="space-y-2">
          <Label htmlFor="headline">Professional Headline *</Label>
          <Input
            id="headline"
            placeholder="e.g., DDS @ NYU | International Student Success Mentor"
            value={formData.professional_headline}
            onChange={(e) => setFormData(prev => ({ ...prev, professional_headline: e.target.value }))}
            maxLength={100}
          />
          <p className="text-sm text-muted-foreground">
            {formData.professional_headline.length}/100 characters
          </p>
        </div>

        {/* Professional Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio *</Label>
          <Textarea
            id="bio"
            placeholder="Share your dental journey, achievements, and what motivates you to mentor students..."
            value={formData.professional_bio}
            onChange={(e) => setFormData(prev => ({ ...prev, professional_bio: e.target.value }))}
            rows={5}
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground">
            {formData.professional_bio.length}/500 characters
          </p>
        </div>

        {/* Country of Origin */}
        <div className="space-y-2">
          <Label htmlFor="country">Country of Origin *</Label>
          <Select
            value={formData.country_of_origin}
            onValueChange={(value) => setFormData(prev => ({ ...prev, country_of_origin: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your country of origin" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Mentoring Experience</Label>
          <Input
            id="experience"
            type="number"
            placeholder="0"
            min="0"
            max="50"
            value={formData.years_experience}
            onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
          />
        </div>

        {/* LinkedIn URL */}
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile URL (Optional)</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            value={formData.linkedin_url}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6">
          <Button type="submit" className="px-8">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>

      {/* Profile Image Cropper */}
      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />
    </div>
  );
};
