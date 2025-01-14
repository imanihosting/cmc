'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Parent {
  id: string;
  name: string;
  profilePicture: string | null;
  children: Array<{
    name: string;
    dateOfBirth: string;
  }>;
}

export default function ParentProfile({ params }: { params: { parentId: string } }) {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchParentProfile = async () => {
      try {
        const response = await fetch(`/api/parent/${params.parentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch parent profile');
        }
        const data = await response.json();
        setParent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchParentProfile();
  }, [params.parentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex justify-center">
                <div className="animate-pulse">Loading profile...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !parent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-red-600 dark:text-red-400">
                {error || 'Parent not found'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
                <AvatarImage src={parent.profilePicture || undefined} />
                <AvatarFallback>
                  {parent.name ? parent.name[0].toUpperCase() : 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{parent.name}</CardTitle>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/portal/childminder/messages')}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-semibold mb-2">Children</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parent.children.map((child, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(child.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 