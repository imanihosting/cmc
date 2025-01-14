'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ThumbsUp, MessageCircle, Flag, BarChart2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: string;
  parent: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  response?: string;
  reported: boolean;
}

export default function ReviewsPage() {
  const { isLoaded, user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
      fetchStats();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/childminder/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/childminder/reviews/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleResponse = async (reviewId: string, response: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const handleReport = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews & Ratings</h1>
          <Button>
            <BarChart2 className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Reviews</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="positive">Positive</TabsTrigger>
                  <TabsTrigger value="negative">Needs Attention</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <ScrollArea className="h-[600px]">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{review.parent}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{review.comment}</p>
                        
                        {review.response ? (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Your Response:</p>
                            <p className="text-sm text-blue-600 dark:text-blue-300">{review.response}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2 mb-3">
                            <Button size="sm" variant="outline" onClick={() => handleResponse(review.id, '')}>
                              Respond
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{review.helpful}</span>
                            </button>
                            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                              <MessageCircle className="w-4 h-4" />
                              Reply
                            </button>
                          </div>
                          {!review.reported && (
                            <button
                              className="flex items-center gap-1 text-gray-500 hover:text-red-600"
                              onClick={() => handleReport(review.id)}
                            >
                              <Flag className="w-4 h-4" />
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rating Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(stats.averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Based on {stats.totalReviews} reviews
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.ratingDistribution)
                  .reverse()
                  .map(([rating, count]) => (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {rating} stars
                      </div>
                      <Progress
                        value={(count / stats.totalReviews) * 100}
                        className="h-2"
                      />
                      <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reviews.filter(r => r.rating >= 4).length}
                    </p>
                    <p className="text-sm text-gray-500">Positive Reviews</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reviews.filter(r => !r.response).length}
                    </p>
                    <p className="text-sm text-gray-500">Needs Response</p>
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