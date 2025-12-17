import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  User,
  GraduationCap,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ProfileImageCropper } from "@/components/dashboard/ProfileImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DashboardNavigation() {
  const { user, profile, mentorProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showImageCropper, setShowImageCropper] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect immediately to sign in page
      window.location.replace("/auth?tab=signin");
    } catch (error) {
      // Even on error, redirect to sign in page
      window.location.replace("/auth?tab=signin");
    }
  };

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : "M";

  const handleImageSaved = useCallback(
    async (croppedImage: string) => {
      try {
        if (!user?.id) return;
        // Update mentor profile photo
        const { error: mpError } = await supabase
          .from("mentor_profiles")
          .update({ profile_photo_url: croppedImage })
          .eq("user_id", user.id);
        if (mpError) throw mpError;

        // Update general profile avatar
        const { error: pError } = await supabase
          .from("profiles")
          .update({ avatar_url: croppedImage })
          .eq("user_id", user.id);
        if (pError) throw pError;

        toast({
          title: "Profile picture updated",
          description: "Your photo has been saved.",
        });
        setShowImageCropper(false);
      } catch (e) {
        // Silently handle error
        toast({
          title: "Error updating photo",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
    [user?.id, toast]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary/80">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-primary">
              DentMentor
            </span>
          </Link>

          {/* Right side - Navigation and User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Quick Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs sm:text-sm"
              >
                <Link to="/mentors">Browse Mentors</Link>
              </Button>
            </nav>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full text-[8px] sm:text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                    <AvatarImage src={mentorProfile?.profile_photo_url} />
                    <AvatarFallback className="font-semibold text-xs sm:text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 sm:w-64"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-none">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-[10px] sm:text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link to="/onboarding?edit=1" className="cursor-pointer">
                    <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowImageCropper(true)}
                  className="text-xs sm:text-sm"
                >
                  <Camera className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Change Picture
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm">
                  <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm">
                  <HelpCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Sign Out with Confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 text-xs sm:text-sm"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">
                        Are you sure you want to sign out?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        You will be redirected to the login page and will need
                        to sign in again to access your dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="text-xs sm:text-sm w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSignOut}
                        className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm w-full sm:w-auto"
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
