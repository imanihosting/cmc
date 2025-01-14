'use client'

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  MapPin, 
  Clock, 
  Languages, 
  Heart,
  GraduationCap,
  Euro,
  Phone,
  Mail,
  Home,
  AlertCircle,
  Calendar,
  Clock3,
  Star,
  CheckCircle2,
  Edit3,
  Save
} from "lucide-react";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
  gardaVetted: boolean;
  tuslaRegistered: boolean;
  availability: any | null;
  experience: string | null;
  hourlyRate: number | null;
  qualifications: string | null;
  serviceArea: string | null;
  latitude: number | null;
  longitude: number | null;
  personalityTraits: any | null;
  matchPreferences: any | null;
  spotlightUntil: string | null;
  lastMinuteAvailability: boolean;
  availabilityRadius: number;
  emergencyBookings: boolean;
  languagesSpoken: string[] | null;
  specializedCare: string[] | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  bio: string | null;
}

export default function ChildminderProfile() {
  const { isLoaded, user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/childminder/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data. Please try again.",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/childminder/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic info
          name: editedProfile.name,
          profilePicture: editedProfile.profilePicture,
          bio: editedProfile.bio,

          // Contact info
          phoneNumber: editedProfile.phoneNumber,
          address: editedProfile.address,
          city: editedProfile.city,
          postcode: editedProfile.postcode,

          // Professional info
          experience: editedProfile.experience,
          qualifications: editedProfile.qualifications,
          hourlyRate: editedProfile.hourlyRate,
          serviceArea: editedProfile.serviceArea,
          latitude: editedProfile.latitude,
          longitude: editedProfile.longitude,

          // JSON fields
          availability: editedProfile.availability,
          personalityTraits: editedProfile.personalityTraits,
          matchPreferences: editedProfile.matchPreferences,
          languagesSpoken: editedProfile.languagesSpoken,
          specializedCare: editedProfile.specializedCare,

          // Boolean fields
          gardaVetted: editedProfile.gardaVetted,
          tuslaRegistered: editedProfile.tuslaRegistered,
          lastMinuteAvailability: editedProfile.lastMinuteAvailability,
          emergencyBookings: editedProfile.emergencyBookings,

          // Number fields
          availabilityRadius: editedProfile.availabilityRadius,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        setEditedProfile(updatedData);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    toast({
      title: "Changes Discarded",
      description: "Your changes have been discarded.",
    });
  };

  if (!isLoaded || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Background Banner */}
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Edit Button */}
            <div className="absolute right-8 top-6">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="bg-white/90 hover:bg-white"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>

            {/* Avatar and Basic Info */}
            <div className="pt-32 pb-5">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-gray-800 shadow-xl border-2 border-white">
                  <AvatarImage src={user?.imageUrl || profile.profilePicture || undefined} />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                    {profile.bio || 'No bio added yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges and Verification */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {profile.gardaVetted && (
                <Badge variant="secondary" className="py-1.5 px-4 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100 rounded-full">
                  <Shield className="w-4 h-4 mr-1.5" /> Garda Vetted
                </Badge>
              )}
              {profile.tuslaRegistered && (
                <Badge variant="secondary" className="py-1.5 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100 rounded-full">
                  <Shield className="w-4 h-4 mr-1.5" /> Tusla Registered
                </Badge>
              )}
              <Badge variant="secondary" className="py-1.5 px-4 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-100 rounded-full">
                <Star className="w-4 h-4 mr-1.5" /> Premium Member
              </Badge>
              <Badge variant="secondary" className="py-1.5 px-4 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-100 rounded-full">
                <Clock3 className="w-4 h-4 mr-1.5" /> {profile.experience ? '5+ Years Experience' : 'New Childminder'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                <Euro className="w-5 h-5 mr-2" /> Hourly Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                €{profile.hourlyRate || '0'}/hr
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <MapPin className="w-5 h-5 mr-2" /> Service Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                {profile.availabilityRadius || 0}km
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <Languages className="w-5 h-5 mr-2" /> Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                {profile.languagesSpoken?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="h-16 w-full bg-transparent">
                <TabsTrigger
                  value="details"
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400",
                    "h-16 px-8"
                  )}
                >
                  Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value="qualifications"
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400",
                    "h-16 px-8"
                  )}
                >
                  Qualifications
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400",
                    "h-16 px-8"
                  )}
                >
                  Services
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="details" className="mt-0">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Contact Information</Label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Phone className="w-5 h-5 text-gray-400" />
                          {isEditing ? (
                            <Input
                              value={editedProfile?.phoneNumber || ''}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile!,
                                phoneNumber: e.target.value
                              })}
                              className="flex-1"
                            />
                          ) : (
                            <span>{profile.phoneNumber || 'No phone number added'}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span>{profile.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Location</Label>
                      <div className="space-y-4">
                        {isEditing ? (
                          <>
                            <Input
                              placeholder="Address"
                              value={editedProfile?.address || ''}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile!,
                                address: e.target.value
                              })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                placeholder="City"
                                value={editedProfile?.city || ''}
                                onChange={(e) => setEditedProfile({
                                  ...editedProfile!,
                                  city: e.target.value
                                })}
                              />
                              <Input
                                placeholder="Postcode"
                                value={editedProfile?.postcode || ''}
                                onChange={(e) => setEditedProfile({
                                  ...editedProfile!,
                                  postcode: e.target.value
                                })}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p>{profile.address || 'No address added'}</p>
                            <p>{profile.city} {profile.postcode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">About Me</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile?.bio || ''}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile!,
                          bio: e.target.value
                        })}
                        className="min-h-[150px]"
                        placeholder="Tell parents about yourself..."
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {profile.bio || 'No bio added yet'}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="qualifications" className="mt-0">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Experience & Qualifications</Label>
                    {isEditing ? (
                      <>
                        <Textarea
                          value={editedProfile?.experience || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile!,
                            experience: e.target.value
                          })}
                          className="min-h-[150px]"
                          placeholder="Describe your experience..."
                        />
                        <Textarea
                          value={editedProfile?.qualifications || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile!,
                            qualifications: e.target.value
                          })}
                          className="min-h-[150px]"
                          placeholder="List your qualifications..."
                        />
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Card className="border-2 border-gray-100 dark:border-gray-700">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <GraduationCap className="w-5 h-5 mr-2" /> Experience
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-300">
                              {profile.experience || 'No experience added yet'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-gray-100 dark:border-gray-700">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 mr-2" /> Qualifications
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-300">
                              {profile.qualifications || 'No qualifications added yet'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-2 border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Service Options</CardTitle>
                        <CardDescription>Configure your availability and service preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Last Minute Bookings</Label>
                            <p className="text-sm text-gray-500">Accept short notice bookings</p>
                          </div>
                          <Switch
                            checked={editedProfile?.lastMinuteAvailability}
                            onCheckedChange={(checked) => setEditedProfile({
                              ...editedProfile!,
                              lastMinuteAvailability: checked
                            })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Emergency Care</Label>
                            <p className="text-sm text-gray-500">Available for emergency situations</p>
                          </div>
                          <Switch
                            checked={editedProfile?.emergencyBookings}
                            onCheckedChange={(checked) => setEditedProfile({
                              ...editedProfile!,
                              emergencyBookings: checked
                            })}
                            disabled={!isEditing}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Specialized Care</CardTitle>
                        <CardDescription>Your specialized childcare services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {profile.specializedCare?.map((care, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="mr-2 mb-2"
                            >
                              {care}
                            </Badge>
                          )) || 'No specialized care services added'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </div>
  );
} 