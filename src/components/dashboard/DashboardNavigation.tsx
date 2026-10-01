import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Settings,
  HelpCircle,
  LogOut,
  User,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ProfileImageCropper } from "@/components/dashboard/ProfileImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsPopover } from "./NotificationsPopover";
import { useToast } from "@/hooks/use-toast";
import { DentMark, Wordmark } from "@/components/site";

/**
 * The dashboard's top bar: the site nav's frosted paper bar, with the mark and
 * wordmark on the left and the mentor's own controls on the right. Sticky inside
 * the AppShell rather than fixed, so the page needs no offset for it.
 */
export function DashboardNavigation() {
  const { user, profile, mentorProfile, signOut } = useAuth();
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

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <header data-band="paper" className="sticky top-0 z-40 w-full text-band-fg">
      {/* The site nav's scrolled glass, always on: work screens have no dark band to sit over. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 border-b border-[rgb(9_67_56/0.06)] bg-white/[0.78] shadow-[0_1px_24px_rgb(9_67_56/0.05)] backdrop-blur-md"
      />
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 rounded-[0.375rem]" aria-label="DentMentor home">
          <DentMark />
          <Wordmark />
          <span
            className="label ml-1 hidden rounded-pill border px-2 py-1 text-band-muted sm:inline-flex"
            style={{ borderColor: "rgb(9 67 56 / 0.12)" }}
          >
            Mentor
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Site" className="hidden md:block">
            <Link
              to="/mentors"
              className="inline-flex h-11 items-center rounded-pill px-3 text-[0.8125rem] text-band-muted transition-colors hover:text-band-fg"
            >
              Browse mentors
            </Link>
          </nav>

          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open account menu"
                className="grid size-11 place-items-center rounded-full transition-colors hover:bg-band-fg/5"
              >
                <Avatar className="size-9 ring-1 ring-[rgb(9_67_56/0.1)]">
                  <AvatarImage src={mentorProfile?.profile_photo_url} className="object-cover" />
                  <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-[0.8125rem] font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="truncate text-sm font-semibold leading-none text-foreground">
                    {fullName || "Your account"}
                  </p>
                  <p className="truncate text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/onboarding?edit=1" className="cursor-pointer">
                  <User className="mr-2 size-4" />
                  Edit profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImageCropper(true)}>
                <Camera className="mr-2 size-4" />
                Change picture
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 size-4" />
                Help & support
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Sign Out with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md sm:rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display tracking-[-0.01em]">
                      Sign out of DentMentor?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll go to the sign-in page and need to sign in again to reach your dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <AlertDialogCancel className="mt-0 w-full rounded-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOut}
                      className="w-full rounded-full bg-red-700 text-white hover:bg-red-800 sm:w-auto"
                    >
                      Sign out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
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
