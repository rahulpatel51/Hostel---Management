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

type MenuItem = {
  id: string;
  day: string;
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

export default function MessMenuPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockMenuItems: MenuItem[] = daysOfWeek.map((day, index) => ({
          id: `MENU${index + 1}`,
          day,
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
        }));

        setMenuItems(mockMenuItems);
        setFilteredItems(mockMenuItems);
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

  useEffect(() => {
    if (dayFilter === 'all') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.day === dayFilter));
    }
  }, [dayFilter, menuItems]);

  const toggleExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const handleAddNew = () => {
    setCurrentItem({
      id: '',
      day: '',
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      rating: 0,
      reviews: []
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
          className: "bg-green-500 text-white border-0"
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        if (isEditing && currentItem) {
          setMenuItems(prev => prev.map(item => 
            item.id === currentItem.id ? currentItem : item
          ));
          toast({
            title: "Updated",
            description: "Menu item updated successfully",
            className: "bg-blue-500 text-white border-0"
          });
        } else if (currentItem) {
          const newItem = {
            ...currentItem,
            id: `MENU${menuItems.length + 1}`,
            rating: 0,
            reviews: []
          };
          setMenuItems(prev => [...prev, newItem]);
          toast({
            title: "Added",
            description: "New menu item added",
            className: "bg-green-500 text-white border-0"
          });
        }
        setIsDialogOpen(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-4 w-4 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm ml-1">{rating.toFixed(1)}</span>
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
          <Select value={dayFilter} onValueChange={setDayFilter}>
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
                {filteredItems.length} days
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
                  <Fragment key={item.id}>
                    <TableRow 
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-900/10 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
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
                              handleDelete(item.id);
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
                              toggleExpand(item.id);
                            }}
                            className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          >
                            {expandedDay === item.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedDay === item.id && (
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
                                  {item.reviews.map((review, index) => (
                                    <div key={index} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.avatar} alt={review.studentName} />
                                            <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">{review.studentName}</p>
                                            <p className="text-xs text-muted-foreground">{review.date}</p>
                                          </div>
                                        </div>
                                        {renderStars(review.rating)}
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

      {/* Add/Edit Dialog */}
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
                onValueChange={(value) => currentItem && setCurrentItem({...currentItem, day: value})}
                className="col-span-3"
              >
                <SelectTrigger>
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
                onChange={(e) => currentItem && setCurrentItem({...currentItem, breakfast: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Poha, Tea, Fruits"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lunch" className="text-right">
                Lunch
              </label>
              <Textarea
                id="lunch"
                value={currentItem?.lunch || ''}
                onChange={(e) => currentItem && setCurrentItem({...currentItem, lunch: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Dal, Rice, Roti, Sabzi"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="snacks" className="text-right">
                Snacks
              </label>
              <Textarea
                id="snacks"
                value={currentItem?.snacks || ''}
                onChange={(e) => currentItem && setCurrentItem({...currentItem, snacks: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Samosa, Tea"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dinner" className="text-right">
                Dinner
              </label>
              <Textarea
                id="dinner"
                value={currentItem?.dinner || ''}
                onChange={(e) => currentItem && setCurrentItem({...currentItem, dinner: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Chicken Curry, Rice, Roti"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              onClick={handleSubmit}
              disabled={!currentItem?.day || !currentItem.breakfast || !currentItem.lunch || !currentItem.snacks || !currentItem.dinner}
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