"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Star, Utensils, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MenuItem = {
  id: string;
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  rating: number;
  reviews: {
    studentId: string;
    studentName: string;
    avatar: string;
    comment: string;
    rating: number;
    date: string;
  }[];
};

export default function StudentMessMenuPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<MenuItem | null>(null);
  const [studentRating, setStudentRating] = useState(0);
  const [studentComment, setStudentComment] = useState('');

  // Get current day name
  const currentDate = new Date();
  const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Mock student data
  const currentStudent = {
    id: 'STU12345',
    name: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate dates for the current week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const currentDayIndex = today.getDay();
        
        const mockMenuItems: MenuItem[] = daysOfWeek.map((day, index) => {
          // Calculate date for each day of the week
          const date = new Date(today);
          date.setDate(today.getDate() + (index - currentDayIndex));
          
          return {
            id: `MENU${index + 1}`,
            day,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            breakfast: `${index % 2 === 0 ? 'Poha' : 'Sandwich'}, ${index % 3 === 0 ? 'Tea' : 'Juice'}, Fruits`,
            lunch: `${index % 2 === 0 ? 'Dal' : 'Rajma'}, Rice, Roti, ${index % 3 === 0 ? 'Vegetables' : 'Curd'}, Salad`,
            snacks: `${index % 2 === 0 ? 'Samosa' : 'Pakora'} with ${index % 3 === 0 ? 'Tea' : 'Coffee'}`,
            dinner: `${index % 2 === 0 ? 'Chicken Curry' : 'Paneer'}, Rice, Roti, ${index % 3 === 0 ? 'Soup' : 'Raita'}`,
            rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
            reviews: [
              {
                studentId: `STU${index}01`,
                studentName: ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anjali', 'Suresh'][index],
                avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 1}.jpg`,
                comment: ['Great food!', 'Could be better', 'Loved the dinner', 'Snacks were cold', 'Excellent taste'][index % 5],
                rating: Math.floor(3 + Math.random() * 3),
                date: new Date(Date.now() - (index * 86400000)).toLocaleDateString()
              }
            ]
          };
        });

        setMenuItems(mockMenuItems);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load mess menu",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [toast]);

  const toggleExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const openFeedbackDialog = (item: MenuItem) => {
    setCurrentDay(item);
    const existingReview = item.reviews.find(review => review.studentId === currentStudent.id);
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

  const submitFeedback = () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        if (!currentDay) return;
        
        const updatedItems = menuItems.map(item => {
          if (item.id === currentDay.id) {
            const filteredReviews = item.reviews.filter(review => review.studentId !== currentStudent.id);
            const newReview = {
              studentId: currentStudent.id,
              studentName: currentStudent.name,
              avatar: currentStudent.avatar,
              comment: studentComment,
              rating: studentRating,
              date: new Date().toLocaleDateString()
            };
            
            const allRatings = [...filteredReviews, newReview].map(r => r.rating);
            const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
            
            return {
              ...item,
              rating: parseFloat(avgRating.toFixed(1)),
              reviews: [...filteredReviews, newReview]
            };
          }
          return item;
        });
        
        setMenuItems(updatedItems);
        
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted",
          className: "bg-green-500 text-white border-0"
        });
        
        setIsFeedbackOpen(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(rating) 
                ? 'fill-blue-500 text-blue-500' 
                : 'text-gray-300'
            } ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            onClick={() => interactive && handleRatingChange(star)}
          />
        ))}
        <span className="text-sm ml-1 font-medium">{rating.toFixed(1)}</span>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card 
              key={item.id}
              className={`transition-all duration-200 overflow-hidden ${
                item.day === currentDayName 
                  ? 'border-2 border-blue-500 dark:border-blue-400 shadow-lg' 
                  : 'border border-gray-200 dark:border-gray-700'
              } ${
                expandedDay === item.id ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/70'
              }`}
            >
              <CardHeader 
                className={`pb-3 cursor-pointer ${expandedDay === item.id ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {item.day}
                      {item.day === currentDayName && (
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
                    <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                    <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {expandedDay === item.id ? (
                  <div className="p-6 pt-0 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { icon: '🍳', title: 'Breakfast', content: item.breakfast },
                        { icon: '🍲', title: 'Lunch', content: item.lunch },
                        { icon: '☕', title: 'Snacks', content: item.snacks },
                        { icon: '🍛', title: 'Dinner', content: item.dinner }
                      ].map((meal, idx) => (
                        <div key={idx} className="space-y-2">
                          <h3 className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-lg">{meal.icon}</span> {meal.title}
                          </h3>
                          <p className="text-sm whitespace-pre-line text-gray-600 dark:text-gray-400 pl-7">
                            {meal.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Student Feedback
                        </h3>
                        <Button 
                          size="sm" 
                          onClick={() => openFeedbackDialog(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {item.reviews.some(r => r.studentId === currentStudent.id) 
                            ? 'Edit Feedback' 
                            : 'Add Feedback'}
                        </Button>
                      </div>
                      {item.reviews.length > 0 ? (
                        <div className="space-y-3">
                          {item.reviews.map((review, index) => (
                            <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={review.avatar} alt={review.studentName} />
                                    <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{review.studentName}</p>
                                    <p className="text-xs text-muted-foreground">{review.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= review.rating 
                                          ? 'fill-blue-500 text-blue-500' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 pl-11">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No reviews yet</p>
                          <p className="text-xs mt-1">Be the first to review!</p>
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
                        onClick={() => toggleExpand(item.id)}
                      >
                        View full menu
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">
              {currentDay?.day} Meal Feedback
            </DialogTitle>
            <DialogDescription>
              Share your experience about the meals
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