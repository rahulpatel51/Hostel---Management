"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Star, Utensils, MessageSquare, ChevronDown, ChevronUp, AlertCircle, ChefHat } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Review {
  _id: string;
  userId: string | { _id: string };
  userName: string;
  profilePicture: string;
  avatar: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface MenuItem {
  _id: string;
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  averageRating: number;
  reviews: Review[];
}

export default function StudentMessMenuPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [studentRating, setStudentRating] = useState(0);
  const [studentComment, setStudentComment] = useState('');

  // Current day and date
  const currentDate = new Date();
  const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Mock current student data
  const currentStudent = {
    id: 'STU12345',
    name: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  // Meal types configuration
  const mealTypes = [
    { icon: '🍳', title: 'Breakfast', key: 'breakfast' },
    { icon: '🍲', title: 'Lunch', key: 'lunch' },
    { icon: '☕', title: 'Snacks', key: 'snacks' },
    { icon: '🍛', title: 'Dinner', key: 'dinner' }
  ];

  // Fetch menu data from backend
  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu data');
        }
        const data = await response.json();
        const processedData = data.data.map((item: MenuItem) => ({
          ...item,
          reviews: item.reviews?.map(review => ({
            ...review,
            userId: typeof review.userId === 'object' && review.userId !== null ? review.userId._id : review.userId
          })) || []
        }));
        setMenuItems(processedData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load mess menu",
          variant: "destructive"
        });
        console.error("Error fetching menu data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [toast]);

  const toggleExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const openFeedbackDialog = (menuItem: MenuItem) => {
    setCurrentMenuItem(menuItem);
    const existingReview = menuItem.reviews.find(review => 
      review.userId.toString() === currentStudent.id.toString()
    );
    if (existingReview) {
      setStudentRating(existingReview.rating);
      setStudentComment(existingReview.comment);
    } else {
      setStudentRating(0);
      setStudentComment('');
    }
    setIsFeedbackOpen(true);
  };

  const handleRatingChange = (rating: number) => {
    setStudentRating(rating);
  };

  const submitFeedback = async () => {
    if (!currentMenuItem) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      
      const response = await fetch(`${API_BASE_URL}/menu/${currentMenuItem._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: studentComment,
          rating: studentRating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      const updatedData = await response.json();
      
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item._id === currentMenuItem._id 
            ? {
                ...item,
                reviews: updatedData.data.reviews,
                averageRating: updatedData.data.averageRating
              }
            : item
        )
      );

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted",
        className: "bg-green-500 text-white border-0"
      });
      
      setIsFeedbackOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive"
      });
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={`star-${star}`}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            onClick={() => interactive && handleRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Utensils className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Weekly Mess Menu</h1>
            <CardDescription className="text-muted-foreground">
              {formattedDate} • View meals and provide your feedback
            </CardDescription>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : menuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const isToday = item.day === currentDayName;
            const hasSubmittedFeedback = item.reviews.some(
              review => review.userId.toString() === currentStudent.id.toString()
            );
            
            return (
              <Card 
                key={`menu-${item._id}`}
                className={`transition-all duration-200 overflow-hidden ${
                  isToday
                    ? 'border-2 border-blue-500 dark:border-blue-400 shadow-lg' 
                    : 'border border-gray-200 dark:border-gray-700'
                } ${
                  expandedDay === item._id ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/70'
                }`}
              >
                <CardHeader 
                  className={`pb-3 cursor-pointer ${expandedDay === item._id ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                  onClick={() => toggleExpand(item._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.day}
                        {isToday && (
                          <Badge className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Today
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {item.date}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {expandedDay === item._id ? (
                    <div className="p-6 pt-0 space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {mealTypes.map((meal) => (
                          <div key={`${item._id}-${meal.key}`} className="space-y-2">
                            <h3 className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <span className="text-lg">{meal.icon}</span> {meal.title}
                            </h3>
                            <p className="text-sm whitespace-pre-line text-gray-600 dark:text-gray-400 pl-7">
                              {item[meal.key as keyof MenuItem]}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Student Feedback
                          </h3>
                          {isToday && !hasSubmittedFeedback && (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openFeedbackDialog(item);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Feedback
                            </Button>
                          )}
                        </div>
                        
                        {item.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {item.reviews.map((review) => (
                              <div key={`review-${review._id}`} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={review.avatar} alt={review.userName} />
                                    <AvatarFallback>{(review.userName || 'U').charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <p className="font-medium text-gray-900 dark:text-white">{review.userName || 'Unknown'}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(review.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                    {review.comment && (
                                      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                                        {review.comment}
                                      </p>
                                    )}
                                    <div className="mt-3">
                                      {renderStars(review.rating)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>No reviews yet</p>
                            {isToday && !hasSubmittedFeedback && (
                              <p className="text-xs mt-1">Be the first to review!</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 dark:text-gray-400">🍳</span>
                          <p className="line-clamp-2 text-gray-700 dark:text-gray-300">{item.breakfast}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 dark:text-gray-400">🍲</span>
                          <p className="line-clamp-2 text-gray-700 dark:text-gray-300">{item.lunch}</p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item._id);
                          }}
                        >
                          View full menu
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Menu Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            The weekly mess menu hasn't been published yet. Please check back later or contact the mess committee.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ChefHat className="h-4 w-4" />
            <span>Mess committee is working on it</span>
          </div>
        </div>
      )}

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">
              {currentMenuItem?.day} Meal Feedback
            </DialogTitle>
            <DialogDescription>
              Share your experience about today's meals
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                How would you rate today's meals?
              </label>
              <div className="flex items-center gap-4">
                {renderStars(studentRating, true)}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {studentRating > 0 ? `${studentRating} star${studentRating !== 1 ? 's' : ''}` : 'Not rated yet'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your comments
              </label>
              <Textarea
                id="comment"
                value={studentComment}
                onChange={(e) => setStudentComment(e.target.value)}
                placeholder="What did you like or dislike about the meals? Any suggestions?"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsFeedbackOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitFeedback}
              disabled={studentRating === 0 || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}