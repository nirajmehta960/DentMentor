import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, Settings, HelpCircle, LogOut, User, GraduationCap, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileImageCropper } from '@/components/dashboard/ProfileImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function DashboardNavigation() {
  const { user, profile, mentorProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showImageCropper, setShowImageCropper] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to landing page after successful sign out
      window.location.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const initials = profile?.first_name && profile?.last_name 
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : 'M';

  const handleImageSaved = useCallback(async (croppedImage: string) => {
    try {
      if (!user?.id) return;
      // Update mentor profile photo
      const { error: mpError } = await supabase
        .from('mentor_profiles')
        .update({ profile_photo_url: croppedImage })
        .eq('user_id', user.id);
      if (mpError) throw mpError;

      // Update general profile avatar
      const { error: pError } = await supabase
        .from('profiles')
        .update({ avatar_url: croppedImage })
        .eq('user_id', user.id);
      if (pError) throw pError;

      toast({ title: 'Profile picture updated', description: 'Your photo has been saved.' });
      setShowImageCropper(false);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error updating photo', description: 'Please try again.', variant: 'destructive' });
    }
  }, [user?.id, toast]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-primary/80">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">
              DentMentor
            </span>
          </Link>

          {/* Right side - Navigation and User Menu */}
          <div className="flex items-center gap-4">
            {/* Quick Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mentors">Browse Mentors</Link>
              </Button>
            </nav>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mentorProfile?.profile_photo_url} />
                    <AvatarFallback className="font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/onboarding?edit=1" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImageCropper(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Picture
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Sign Out with Confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be redirected to the login page and will need to sign in again to access your dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOut}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />
    </header>
  );
}