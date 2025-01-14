'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Clock, Bell, Shield, 
  Calendar, User, Settings as SettingsIcon 
} from "lucide-react";

interface Settings {
  hourlyRate: number;
  availableDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  availability: {
    acceptingNewChildren: boolean;
    autoAcceptBookings: boolean;
  };
}

export default function SettingsPage() {
  const { isLoaded, user } = useUser();
  const [settings, setSettings] = useState<Settings>({
    hourlyRate: 0,
    availableDays: [],
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    availability: {
      acceptingNewChildren: true,
      autoAcceptBookings: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/childminder/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/childminder/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate)) {
      updateSettings({ hourlyRate: rate });
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <Button>
            <SettingsIcon className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="rates" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="rates">Rates & Availability</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="rates">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={settings.hourlyRate}
                            onChange={(e) => handleRateChange(e.target.value)}
                            className="pl-10"
                            step="0.50"
                            min="0"
                          />
                        </div>
                        <Button variant="outline" onClick={() => handleRateChange((settings.hourlyRate + 0.5).toString())}>
                          +€0.50
                        </Button>
                        <Button variant="outline" onClick={() => handleRateChange((settings.hourlyRate - 0.5).toString())}>
                          -€0.50
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Availability Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Accepting New Children</Label>
                          <p className="text-sm text-gray-500">Allow new parents to request your services</p>
                        </div>
                        <Switch
                          checked={settings.availability.acceptingNewChildren}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              availability: { ...settings.availability, acceptingNewChildren: checked } 
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-Accept Bookings</Label>
                          <p className="text-sm text-gray-500">Automatically accept booking requests</p>
                        </div>
                        <Switch
                          checked={settings.availability.autoAcceptBookings}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              availability: { ...settings.availability, autoAcceptBookings: checked } 
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule">
                  <div className="space-y-6">
                    <div>
                      <Label>Working Hours</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="startTime" className="text-sm text-gray-500">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={settings.workingHours.start}
                            onChange={(e) => 
                              updateSettings({ 
                                workingHours: { ...settings.workingHours, start: e.target.value } 
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime" className="text-sm text-gray-500">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={settings.workingHours.end}
                            onChange={(e) => 
                              updateSettings({ 
                                workingHours: { ...settings.workingHours, end: e.target.value } 
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Available Days</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <Button
                            key={day}
                            variant={settings.availableDays.includes(day) ? "default" : "outline"}
                            className="w-full"
                            onClick={() => {
                              const newDays = settings.availableDays.includes(day)
                                ? settings.availableDays.filter(d => d !== day)
                                : [...settings.availableDays, day];
                              updateSettings({ availableDays: newDays });
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive booking and message notifications via email</p>
                        </div>
                        <Switch
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              notifications: { ...settings.notifications, email: checked } 
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <Switch
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              notifications: { ...settings.notifications, push: checked } 
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                        </div>
                        <Switch
                          checked={settings.notifications.sms}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              notifications: { ...settings.notifications, sms: checked } 
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Profile Status</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Verified Account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Notifications Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Schedule Updated</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Notification Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 