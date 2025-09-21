import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WelcomeBar() {
  const { profile, mentorProfile } = useAuth();
  
  const profileCompletion = React.useMemo(() => {
    if (!mentorProfile) return 0;
    
    const fields = [
      mentorProfile.professional_bio,
      mentorProfile.specializations?.length,
      mentorProfile.hourly_rate,
      mentorProfile.bds_university,
      mentorProfile.us_dental_school,
      mentorProfile.profile_photo_url
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [mentorProfile]);

  const firstName = profile?.first_name || 'Mentor';
  const isVerified = mentorProfile?.is_verified || false;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Welcome back, {firstName}! 👋
            </h1>
            <div className="flex items-center gap-3">
              {isVerified && (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Mentor
                </Badge>
              )}
              <div className="text-sm text-muted-foreground">
                Profile {profileCompletion}% complete
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-16 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span>{profileCompletion}%</span>
            </div>
            
            {profileCompletion < 100 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/onboarding">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Complete Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}