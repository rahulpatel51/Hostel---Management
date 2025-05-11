"use client";

import { useState, useEffect, Fragment } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Edit, Star, ChevronDown, ChevronUp, Utensils } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from 'axios';

// API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const MENU_API_URL = `${API_BASE_URL}/menu`;

interface Review {
  _id: string;
  userId: string;
  userName: string;
  avatar: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface MenuItem {
  _id: string;
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  averageRating: number;
  reviews: Review[];
  createdAt?: string;
  updatedAt?: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = typeof daysOfWeek[number];

const getInitials = (name?: string) => {
  if (!name?.trim()) return 'AN';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

export default function MessMenuPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<DayOfWeek | 'all'>('all');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{ success: boolean; data: MenuItem[] }>(MENU_API_URL, {
        params: { day: dayFilter === 'all' ? undefined : dayFilter }
      });
      setMenuItems(data.data);
      setFilteredItems(data.data);
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

  useEffect(() => {
    fetchMenuData();
  }, [dayFilter]);

  const toggleExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const handleAddNew = () => {
    setCurrentItem({
      day: '',
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: ''
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`${MENU_API_URL}/${id}`);
      await fetchMenuData();
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
      console.error("Error deleting menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentItem?.day || !currentItem.breakfast || !currentItem.lunch || !currentItem.snacks || !currentItem.dinner) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentItem._id) {
        await axios.put(`${MENU_API_URL}/${currentItem._id}`, currentItem);
        toast({
          title: "Success",
          description: "Menu item updated successfully",
          className: "bg-blue-500 text-white"
        });
      } else {
        await axios.post(MENU_API_URL, currentItem);
        toast({
          title: "Success",
          description: "New menu item added",
          className: "bg-green-500 text-white"
        });
      }
      setIsDialogOpen(false);
      await fetchMenuData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save changes";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error("Error saving menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Utensils className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Mess Menu Management</h1>
        </div>
        <CardDescription className="text-muted-foreground">
          View and manage weekly mess menu with all meal types
        </CardDescription>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Select 
            value={dayFilter} 
            onValueChange={(value: DayOfWeek | 'all') => setDayFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {daysOfWeek.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleAddNew} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Menu
        </Button>
      </div>

      <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-orange-800 dark:text-orange-200">Weekly Mess Menu</CardTitle>
              <Badge variant="secondary" className="px-2 py-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'day' : 'days'}
              </Badge>
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              Current Week: {new Date().toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
              <Utensils className="h-10 w-10 text-orange-300" />
              <p>No menu items found for selected day</p>
              <Button 
                variant="outline" 
                onClick={() => setDayFilter('all')}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Show all days
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-orange-50 dark:bg-orange-900/20">
                <TableRow>
                  <TableHead className="w-[150px] text-orange-800 dark:text-orange-200">Day</TableHead>
                  <TableHead className="text-orange-800 dark:text-orange-200">
                    <div className="flex flex-col items-center">
                      <span>🍳</span>
                      <span>Breakfast</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-orange-800 dark:text-orange-200">
                    <div className="flex flex-col items-center">
                      <span>🍲</span>
                      <span>Lunch</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-orange-800 dark:text-orange-200">
                    <div className="flex flex-col items-center">
                      <span>☕</span>
                      <span>Snacks</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-orange-800 dark:text-orange-200">
                    <div className="flex flex-col items-center">
                      <span>🍛</span>
                      <span>Dinner</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-orange-800 dark:text-orange-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <Fragment key={item._id}>
                    <TableRow 
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-900/10 cursor-pointer"
                      onClick={() => toggleExpand(item._id)}
                    >
                      <TableCell className="font-medium">{item.day}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center text-center">
                          <p className="line-clamp-2">{item.breakfast}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center text-center">
                          <p className="line-clamp-2">{item.lunch}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center text-center">
                          <p className="line-clamp-2">{item.snacks}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center text-center">
                          <p className="line-clamp-2">{item.dinner}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item._id);
                            }}
                            className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          >
                            {expandedDay === item._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedDay === item._id && (
                      <TableRow className="bg-orange-50/30 dark:bg-orange-900/10">
                        <TableCell colSpan={6}>
                          <div className="p-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-medium flex items-center gap-2 text-orange-600">
                                  <span>🍳</span> Breakfast
                                </h3>
                                <p className="text-sm whitespace-pre-line">{item.breakfast}</p>
                              </div>
                              <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-medium flex items-center gap-2 text-orange-600">
                                  <span>🍲</span> Lunch
                                </h3>
                                <p className="text-sm whitespace-pre-line">{item.lunch}</p>
                              </div>
                              <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-medium flex items-center gap-2 text-orange-600">
                                  <span>☕</span> Snacks
                                </h3>
                                <p className="text-sm whitespace-pre-line">{item.snacks}</p>
                              </div>
                              <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-medium flex items-center gap-2 text-orange-600">
                                  <span>🍛</span> Dinner
                                </h3>
                                <p className="text-sm whitespace-pre-line">{item.dinner}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="font-medium text-orange-800 dark:text-orange-200">
                                Student Feedback
                              </h3>
                              {item.reviews.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                  {item.reviews.map((review) => (
                                    <div key={review._id} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.avatar} alt={review.userName || 'Student'} />
                                            <AvatarFallback>
                                              {getInitials(review.userName)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">{review.userName || 'Anonymous'}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {formatDate(review.createdAt)}
                                            </p>
                                          </div>
                                        </div>
                                        {renderRating(review.rating)}
                                      </div>
                                      <p className="mt-2 text-sm">{review.comment}</p>
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
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-orange-600">
              {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the menu details for this day' : 'Create a new menu item for the mess'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="day" className="text-right">
                Day
              </label>
              <Select 
                value={currentItem?.day || ''}
                onValueChange={(value) => setCurrentItem(prev => ({ ...prev!, day: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="breakfast" className="text-right">
                Breakfast
              </label>
              <Textarea
                id="breakfast"
                value={currentItem?.breakfast || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev!, breakfast: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Poha, Tea, Fruits"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lunch" className="text-right">
                Lunch
              </label>
              <Textarea
                id="lunch"
                value={currentItem?.lunch || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev!, lunch: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Dal, Rice, Roti, Sabzi"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="snacks" className="text-right">
                Snacks
              </label>
              <Textarea
                id="snacks"
                value={currentItem?.snacks || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev!, snacks: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Samosa, Tea"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dinner" className="text-right">
                Dinner
              </label>
              <Textarea
                id="dinner"
                value={currentItem?.dinner || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev!, dinner: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Chicken Curry, Rice, Roti"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !currentItem?.day || !currentItem.breakfast || 
                        !currentItem.lunch || !currentItem.snacks || !currentItem.dinner}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}