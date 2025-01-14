'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, Calendar, Clock, Heart, AlertCircle, 
  Phone, Mail, MapPin, FileText 
} from "lucide-react";

interface Child {
  id: string;
  name: string;
  age: number;
  parent: {
    name: string;
    phone: string;
    email: string;
  };
  address: string;
  allergies: string[];
  medications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  schedule: {
    days: string[];
    time: string;
  };
  active: boolean;
}

export default function ChildrenPage() {
  const { isLoaded, user } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/childminder/children');
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleStatusChange = async (childId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        fetchChildren();
      }
    } catch (error) {
      console.error('Error updating child status:', error);
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Children</h1>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Export Records
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Children List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px] pr-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{child.name}</p>
                        <p className="text-sm text-gray-500">Age: {child.age} years</p>
                        <p className="text-sm text-gray-500">Parent: {child.parent.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={child.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {child.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(child.id, !child.active);
                        }}
                      >
                        {child.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Child Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChild ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {selectedChild.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-500">Age</p>
                      <p className="text-gray-900 dark:text-white">{selectedChild.age} years</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Parent Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedChild.parent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedChild.parent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedChild.parent.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedChild.schedule.days.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedChild.schedule.time}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Health Information</h4>
                    <div className="space-y-2">
                      {selectedChild.allergies.length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                          <div>
                            <span className="text-red-500 font-medium">Allergies:</span>
                            <p className="text-gray-900 dark:text-white">
                              {selectedChild.allergies.join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedChild.medications.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-blue-500 mt-1" />
                          <div>
                            <span className="text-blue-500 font-medium">Medications:</span>
                            <p className="text-gray-900 dark:text-white">
                              {selectedChild.medications.join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedChild.emergencyContact.name} ({selectedChild.emergencyContact.relation})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedChild.emergencyContact.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address</h4>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <span className="text-gray-900 dark:text-white">{selectedChild.address}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a child to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 