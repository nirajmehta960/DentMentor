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
import { Settings, HelpCircle, LogOut, User, Camera, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ProfileImageCropper } from "@/components/dashboard/ProfileImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsPopover } from "@/components/dashboard/NotificationsPopover";
import { useToast } from "@/hooks/use-toast";
import { DentMark, SiteCta, Wordmark } from "@/components/site";
import { TEAL_TINT } from "./parts";

/**
 * The dashboard's top bar: the site nav's frosted paper glass, holding the mark,
 * a route back to the mentor directory, notifications and the profile menu.
 *
 * The menu content is portalled outside the site scope, so it takes the
 * (already restyled) shadcn tokens rather than `band-*` utilities.
 */
export function MenteeDashboardNavigation() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [showImageCropper, setShowImageCropper] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.replace("/auth?tab=signin");
    } catch (error) {
      window.location.replace("/auth?tab=signin");
    }
  };

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : "U";

  const handleImageSaved = useCallback(
    async (croppedImage: string) => {
      try {
        if (!user?.id) return;

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
    <header data-band="paper" className="sticky top-0 z-40 w-full text-band-fg">
      {/* The site nav's glass, as its own layer. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 border-b border-band-rule-faint bg-white/[0.72] shadow-[0_1px_24px_rgb(9_67_56/0.06)] backdrop-blur-md"
      />

      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="DentMentor home"
          className="flex min-h-11 items-center gap-2.5 rounded-[0.375rem]"
        >
          <DentMark />
          <Wordmark className="max-[359px]:sr-only" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <SiteCta to="/mentors" variant="secondary" size="sm" className="landing-cta-flat hidden md:inline-flex">
            <Search className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Browse mentors
          </SiteCta>

          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Account menu"
                className="relative size-11 rounded-full p-0 hover:bg-band-fg/[0.04]"
              >
                <Avatar className="size-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="" className="object-cover" />
                  <AvatarFallback className={`${TEAL_TINT} text-[0.8125rem] font-semibold text-band-signal`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate text-sm font-medium leading-none text-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="truncate text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setShowImageCropper(true)} className="min-h-10 gap-2.5">
                <Camera className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Change picture
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="min-h-10 gap-2.5">
                <Link to="/mentee-dashboard" className="cursor-pointer">
                  <User className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="min-h-10 gap-2.5">
                <Settings className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-10 gap-2.5">
                <HelpCircle className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Help & support
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Sign out, behind a confirmation. */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="min-h-10 cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                {/* alert-dialog.tsx wasn't part of the restyle; the radius and teal shadow are set here. */}
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-xl shadow-large sm:max-w-md sm:rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg tracking-[-0.01em]">
                      Are you sure you want to sign out?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to the login page and will need to sign in again to access your
                      dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel className="w-full rounded-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOut}
                      className="w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
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
