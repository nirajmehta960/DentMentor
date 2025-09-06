import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, User, Settings, DollarSign, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ServiceManagementModal } from './ServiceManagementModal';
import { ProfileImageCropper } from './ProfileImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ProfileManagement() {
  const { profile, mentorProfile, isLoading } = useAuth();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditProfile = () => {
    navigate('/onboarding');
  };

  const handleImageSaved = async (croppedImage: string) => {
    try {
      if (!mentorProfile?.id) return;

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `profile-${mentorProfile.id}-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mentor-photos')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('mentor-photos')
        .getPublicUrl(fileName);

      // Update mentor profile
      const { error: updateError } = await supabase
        .from('mentor_profiles')
        .update({ profile_photo_url: urlData.publicUrl })
        .eq('id', mentorProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated."
      });

    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = profile?.first_name && profile?.last_name 
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : 'M';

  const formatSpecializations = (specializations: string[] | null) => {
    if (!specializations || specializations.length === 0) return 'No specializations listed';
    return specializations.slice(0, 3).join(', ') + (specializations.length > 3 ? '...' : '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Summary */}
        <div className="flex items-start gap-4">
          <div className="relative group">
            <Avatar className="w-20 h-20">
              <AvatarImage src={mentorProfile?.profile_photo_url} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowImageCropper(true)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mentorProfile?.professional_headline || 'Dental Mentor'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={mentorProfile?.is_verified ? 'default' : 'secondary'}>
                {mentorProfile?.is_verified ? 'Verified' : 'Pending Verification'}
              </Badge>
              <Badge variant="outline">
                {mentorProfile?.years_experience || 0} years experience
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              <strong>Specializations:</strong> {formatSpecializations(mentorProfile?.specializations)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(mentorProfile as any)?.total_sessions || 0}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(mentorProfile as any)?.average_rating || 0}
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${mentorProfile?.hourly_rate || 0}
            </div>
            <div className="text-xs text-muted-foreground">Hourly Rate</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleEditProfile} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowServiceModal(true)}
            className="flex-1"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Manage Services
          </Button>
        </div>

        {/* Bio Preview */}
        {mentorProfile?.professional_bio && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bio</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mentorProfile.professional_bio.length > 200 
                ? `${mentorProfile.professional_bio.substring(0, 200)}...` 
                : mentorProfile.professional_bio
              }
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Contact Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Email: {profile?.user_id}</p>
            {profile?.phone && <p>Phone: {profile.phone}</p>}
            {mentorProfile?.linkedin_url && (
              <p>LinkedIn: 
                <a 
                  href={mentorProfile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  View Profile
                </a>
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Service Management Modal */}
      <ServiceManagementModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />

      {/* Profile Image Cropper */}
      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />
    </Card>
  );
}