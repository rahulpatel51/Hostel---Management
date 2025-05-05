"use client";

import { useState, useEffect, Fragment } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, ClipboardList, User, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  id: string;
  name: string;
  room: string;
  profileImg: string;
};

type DisciplinaryAction = {
  id: string;
  student: Student;
  violation: string;
  description: string;
  actionTaken: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'resolved' | 'appealed';
  dateReported: string;
  dateResolved?: string;
  notes?: string;
};

export default function DisciplinaryActionsPage() {
  const { toast } = useToast();
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<DisciplinaryAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'appealed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockActions: DisciplinaryAction[] = [
          {
            id: 'DA2023001',
            student: {
              id: 'ST2023001',
              name: 'Rahul Sharma',
              room: 'A-101',
              profileImg: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            violation: 'Noise violation after hours',
            description: 'Loud music played after 11 PM, disturbing other residents',
            actionTaken: 'Verbal warning issued',
            severity: 'medium',
            status: 'reviewed',
            dateReported: '2023-05-15T20:30:00Z',
            notes: 'First offense. Student acknowledged the rules.'
          },
          {
            id: 'DA2023002',
            student: {
              id: 'ST2023002',
              name: 'Priya Patel',
              room: 'A-102',
              profileImg: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            violation: 'Property damage',
            description: 'Broken window in common area due to reckless behavior',
            actionTaken: 'Fine imposed - ₹2000',
            severity: 'high',
            status: 'pending',
            dateReported: '2023-05-14T15:45:00Z'
          },
          {
            id: 'DA2023003',
            student: {
              id: 'ST2023003',
              name: 'Amit Kumar',
              room: 'B-201',
              profileImg: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            violation: 'Repeated late return',
            description: '3 violations of curfew in the past month',
            actionTaken: 'Counseling session scheduled',
            severity: 'low',
            status: 'resolved',
            dateReported: '2023-05-10T22:15:00Z',
            dateResolved: '2023-05-12T11:00:00Z'
          },
          {
            id: 'DA2023004',
            student: {
              id: 'ST2023004',
              name: 'Neha Singh',
              room: 'B-202',
              profileImg: 'https://randomuser.me/api/portraits/women/2.jpg'
            },
            violation: 'Unauthorized guests',
            description: 'Non-resident found in room after visiting hours',
            actionTaken: 'Written warning',
            severity: 'medium',
            status: 'appealed',
            dateReported: '2023-05-08T19:20:00Z',
            notes: 'Student claims it was a misunderstanding'
          },
          {
            id: 'DA2023005',
            student: {
              id: 'ST2023005',
              name: 'Vikram Reddy',
              room: 'C-301',
              profileImg: 'https://randomuser.me/api/portraits/men/3.jpg'
            },
            violation: 'Alcohol violation',
            description: 'Alcohol found in room during inspection',
            actionTaken: 'Parent notification and probation',
            severity: 'high',
            status: 'reviewed',
            dateReported: '2023-05-05T10:30:00Z'
          }
        ];

        setActions(mockActions);
        setFilteredActions(mockActions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load disciplinary actions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    let filtered = actions;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(action => action.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(action => action.severity === severityFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(action => 
        action.violation.toLowerCase().includes(term) || 
        action.description.toLowerCase().includes(term) ||
        action.student.name.toLowerCase().includes(term) ||
        action.student.room.toLowerCase().includes(term)
      );
    }
    
    setFilteredActions(filtered);
  }, [searchTerm, statusFilter, severityFilter, actions]);

  const updateStatus = (id: string, newStatus: DisciplinaryAction['status']) => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setActions(prev => prev.map(action => 
          action.id === id ? { 
            ...action, 
            status: newStatus,
            dateResolved: newStatus === 'resolved' ? new Date().toISOString() : undefined
          } : action
        ));
        toast({
          title: "Status Updated",
          description: `Action status changed to ${newStatus}`,
          className: "bg-green-500 text-white border-0"
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const addNote = (id: string) => {
    if (!newNote.trim()) return;
    
    setIsLoading(true);
    try {
      setTimeout(() => {
        setActions(prev => prev.map(action => 
          action.id === id ? { 
            ...action, 
            notes: action.notes ? `${action.notes}\n${new Date().toLocaleString()}: ${newNote}` : `${new Date().toLocaleString()}: ${newNote}`
          } : action
        ));
        toast({
          title: "Note Added",
          description: "Your note has been saved",
          className: "bg-blue-500 text-white border-0"
        });
        setNewNote('');
        setIsAddingNote(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: DisciplinaryAction['severity']) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">Low</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">High</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: DisciplinaryAction['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Reviewed</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Resolved</Badge>;
      case 'appealed':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">Appealed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAction(expandedAction === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Disciplinary Actions</h1>
        <CardDescription className="text-muted-foreground">
          Manage and track student disciplinary cases
        </CardDescription>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search actions..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="appealed">Appealed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setSeverityFilter('all');
          }}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <CardTitle className="text-gray-900 dark:text-white">Disciplinary Cases</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
              <p>No disciplinary actions found matching your criteria</p>
              <Button variant="ghost" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[200px]">Student</TableHead>
                  <TableHead>Violation</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map((action) => (
                  <Fragment key={action.id}>
                    <TableRow 
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 cursor-pointer"
                      onClick={() => toggleExpand(action.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={action.student.profileImg} alt={action.student.name} />
                            <AvatarFallback>{action.student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{action.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.student.room} • {action.student.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{action.violation}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {action.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(action.severity)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(action.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(action.id);
                          }}
                        >
                          {expandedAction === action.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedAction === action.id && (
                      <TableRow 
                        key={`${action.id}-details`}
                        className="bg-gray-50/50 dark:bg-gray-900/10"
                      >
                        <TableCell colSpan={5}>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h3 className="font-medium">Violation Details</h3>
                                <p className="text-sm">{action.description}</p>
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-medium">Action Taken</h3>
                                <p className="text-sm">{action.actionTaken}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h3 className="font-medium">Date Reported</h3>
                                <p className="text-sm">
                                  {new Date(action.dateReported).toLocaleString()}
                                </p>
                              </div>
                              {action.dateResolved && (
                                <div className="space-y-2">
                                  <h3 className="font-medium">Date Resolved</h3>
                                  <p className="text-sm">
                                    {new Date(action.dateResolved).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {action.notes && (
                              <div className="space-y-2">
                                <h3 className="font-medium">Notes</h3>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border">
                                  <p className="text-sm whitespace-pre-line">{action.notes}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <Select 
                                  value={action.status} 
                                  onValueChange={(value) => updateStatus(action.id, value as DisciplinaryAction['status'])}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Update status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="appealed">Appealed</SelectItem>
                                  </SelectContent>
                                </Select>

                                {!isAddingNote ? (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsAddingNote(true)}
                                  >
                                    Add Note
                                  </Button>
                                ) : (
                                  <div className="flex-1 flex flex-col gap-2">
                                    <Textarea
                                      placeholder="Add a note about this case..."
                                      value={newNote}
                                      onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => {
                                          setIsAddingNote(false);
                                          setNewNote('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={() => addNote(action.id)}
                                        disabled={!newNote.trim()}
                                      >
                                        Save Note
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
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
    </div>
  );
}