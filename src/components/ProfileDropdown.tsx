import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ProfileImageCropper } from '@/components/dashboard/ProfileImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileDropdownProps {
  isScrolled?: boolean;
}

export function ProfileDropdown({ isScrolled = false }: ProfileDropdownProps) {
  const { user, profile, menteeProfile, mentorProfile, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const getProfileImage = () => {
    if (userType === 'mentee' && menteeProfile?.profile_photo_url) {
      return menteeProfile.profile_photo_url;
    }
    if (userType === 'mentor' && mentorProfile?.profile_photo_url) {
      return mentorProfile.profile_photo_url;
    }
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return null;
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleImageSaved = useCallback(async (croppedImage: string) => {
    try {
      if (!user?.id) return;

      // Directly update the appropriate profile table based on user type
      if (userType === 'mentee') {
        const { error: updateError } = await supabase
          .from('mentee_profiles')
          .update({ profile_photo_url: croppedImage })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else if (userType === 'mentor') {
        const { error: updateError } = await supabase
          .from('mentor_profiles')
          .update({ profile_photo_url: croppedImage })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Also update the general profile avatar_url
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: croppedImage })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated."
      });
      setShowImageCropper(false);      
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, userType, toast]);

  const handleSignOutClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSignOutDialog(true);
  }, []);

  const handleSignOutConfirm = useCallback(async () => {
    try {
      // Use the AuthContext signOut function
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: "There was an error signing out. Please try again.",
          variant: "destructive"
        });
      }
      // Redirect to landing page after successful sign out
      if (!error) {
        window.location.replace('/');
      }
      
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowSignOutDialog(false);
    }
  }, [signOut, toast]);

  const handleDashboard = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (userType === 'mentee') {
      navigate('/mentors');
    } else {
      navigate('/dashboard');
    }
  }, [userType, navigate]);

  const handleChangePicture = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowImageCropper(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`relative h-10 w-10 rounded-full p-0 transition-colors ${
              isScrolled 
                ? 'hover:bg-muted' 
                : 'hover:bg-white/10'
            }`}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={getProfileImage() || ''} alt="Profile" />
              <AvatarFallback className={isScrolled ? 'bg-muted text-foreground' : 'bg-white/20 text-white'}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.email
                }
              </p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDashboard}>
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleChangePicture}>
            <Camera className="mr-2 h-4 w-4" />
            <span>Change Picture</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOutClick}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutConfirm}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
