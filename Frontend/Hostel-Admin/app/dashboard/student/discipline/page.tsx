"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp, ClipboardList, MessageSquare, PlusCircle, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DisciplinaryAction = {
  id: string;
  violation: string;
  description: string;
  actionTaken: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'resolved' | 'appealed';
  dateReported: string;
  dateResolved?: string;
  notes?: string;
  appeal?: {
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    response?: string;
  };
};

export default function StudentDisciplinaryPage() {
  const { toast } = useToast();
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  
  // Form states
  const [newViolation, setNewViolation] = useState({
    violation: '',
    description: '',
    actionTaken: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const [editViolation, setEditViolation] = useState({
    violation: '',
    description: '',
    actionTaken: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  // Mock student data
  const student = {
    id: 'ST2023001',
    name: 'Rahul Sharma',
    room: 'A-101',
    profileImg: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for the current student
        const mockActions: DisciplinaryAction[] = [
          {
            id: 'DA2023001',
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
            violation: 'Property damage',
            description: 'Broken window in common area due to reckless behavior',
            actionTaken: 'Fine imposed - ₹2000',
            severity: 'high',
            status: 'pending',
            dateReported: '2023-05-14T15:45:00Z'
          },
          {
            id: 'DA2023003',
            violation: 'Repeated late return',
            description: '3 violations of curfew in the past month',
            actionTaken: 'Counseling session scheduled',
            severity: 'low',
            status: 'resolved',
            dateReported: '2023-05-10T22:15:00Z',
            dateResolved: '2023-05-12T11:00:00Z',
            appeal: {
              message: 'I had valid reasons for being late due to academic commitments',
              status: 'rejected',
              response: 'Appeal rejected as curfew rules apply to all students regardless of academic commitments'
            }
          }
        ];

        setActions(mockActions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your disciplinary records",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const submitAppeal = async () => {
    if (!appealMessage.trim() || !currentActionId) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActions(prev => prev.map(action => 
        action.id === currentActionId ? { 
          ...action, 
          status: 'appealed',
          appeal: {
            message: appealMessage,
            status: 'pending'
          }
        } : action
      ));
      
      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been submitted for review",
        className: "bg-green-500 text-white border-0"
      });
      
      setAppealMessage('');
      setIsDialogOpen(false);
      setCurrentActionId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit appeal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNewViolation = async () => {
    if (!newViolation.violation || !newViolation.description || !newViolation.actionTaken) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newAction: DisciplinaryAction = {
        id: `DA${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        ...newViolation,
        status: 'pending',
        dateReported: new Date().toISOString()
      };

      setActions(prev => [newAction, ...prev]);
      toast({
        title: "Violation Added",
        description: "New disciplinary action has been recorded",
        className: "bg-green-500 text-white border-0"
      });
      
      // Reset form
      setNewViolation({
        violation: '',
        description: '',
        actionTaken: '',
        severity: 'medium',
        notes: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new violation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editViolationAction = async () => {
    if (!currentActionId || !editViolation.violation || !editViolation.description || !editViolation.actionTaken) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setActions(prev => prev.map(action => 
        action.id === currentActionId ? { 
          ...action,
          violation: editViolation.violation,
          description: editViolation.description,
          actionTaken: editViolation.actionTaken,
          severity: editViolation.severity,
          notes: editViolation.notes
        } : action
      ));
      
      toast({
        title: "Violation Updated",
        description: "Disciplinary action has been updated",
        className: "bg-green-500 text-white border-0"
      });
      
      setIsEditDialogOpen(false);
      setCurrentActionId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update violation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (action: DisciplinaryAction) => {
    setCurrentActionId(action.id);
    setEditViolation({
      violation: action.violation,
      description: action.description,
      actionTaken: action.actionTaken,
      severity: action.severity,
      notes: action.notes || ''
    });
    setIsEditDialogOpen(true);
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
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Under Review</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Resolved</Badge>;
      case 'appealed':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">Appeal Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAppealStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedAction(expandedAction === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Disciplinary Record</h1>
            <CardDescription className="text-muted-foreground">
              View your disciplinary actions and submit appeals
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Violation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Violation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="violation" className="text-sm font-medium">
                    Violation Type <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="violation"
                    placeholder="Enter violation type"
                    value={newViolation.violation}
                    onChange={(e) => setNewViolation({...newViolation, violation: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe the violation in detail"
                    rows={3}
                    value={newViolation.description}
                    onChange={(e) => setNewViolation({...newViolation, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="actionTaken" className="text-sm font-medium">
                    Action Taken <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="actionTaken"
                    placeholder="Enter the action taken"
                    value={newViolation.actionTaken}
                    onChange={(e) => setNewViolation({...newViolation, actionTaken: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="severity" className="text-sm font-medium">
                    Severity
                  </label>
                  <Select 
                    value={newViolation.severity} 
                    onValueChange={(value) => setNewViolation({...newViolation, severity: value as 'low' | 'medium' | 'high'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    rows={2}
                    value={newViolation.notes}
                    onChange={(e) => setNewViolation({...newViolation, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addNewViolation}
                    disabled={isLoading || !newViolation.violation || !newViolation.description || !newViolation.actionTaken}
                  >
                    {isLoading ? "Adding..." : "Add Violation"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <CardTitle className="text-gray-900 dark:text-white">Your Disciplinary Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
              <p>You have no disciplinary actions on record</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead>Violation</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <>
                    <TableRow 
                      key={action.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 cursor-pointer"
                      onClick={() => toggleExpand(action.id)}
                    >
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
                        <div className="flex items-center justify-end gap-2">
                          {formatDate(action.dateReported)}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(action);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedAction === action.id && (
                      <TableRow 
                        key={`${action.id}-details`}
                        className="bg-gray-50/50 dark:bg-gray-900/10"
                      >
                        <TableCell colSpan={4}>
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
                                  {formatDate(action.dateReported)}
                                </p>
                              </div>
                              {action.dateResolved && (
                                <div className="space-y-2">
                                  <h3 className="font-medium">Date Resolved</h3>
                                  <p className="text-sm">
                                    {formatDate(action.dateResolved)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {action.notes && (
                              <div className="space-y-2">
                                <h3 className="font-medium">Warden's Notes</h3>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border">
                                  <p className="text-sm whitespace-pre-line">{action.notes}</p>
                                </div>
                              </div>
                            )}

                            {action.appeal ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h3 className="font-medium">Your Appeal</h3>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm whitespace-pre-line">{action.appeal.message}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Status:</span>
                                    {getAppealStatusBadge(action.appeal.status)}
                                  </div>
                                </div>
                                
                                {action.appeal.response && (
                                  <div className="space-y-2">
                                    <h3 className="font-medium">Warden's Response</h3>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border">
                                      <p className="text-sm whitespace-pre-line">{action.appeal.response}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : action.status !== 'resolved' && action.status !== 'appealed' ? (
                              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline"
                                    onClick={() => setCurrentActionId(action.id)}
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Submit Appeal
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Submit Appeal for: {action.violation}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">
                                        Explain why you believe this action should be reconsidered
                                      </p>
                                      <Textarea
                                        placeholder="Provide details for your appeal..."
                                        rows={5}
                                        value={appealMessage}
                                        onChange={(e) => setAppealMessage(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => {
                                          setIsDialogOpen(false);
                                          setAppealMessage('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={submitAppeal}
                                        disabled={!appealMessage.trim()}
                                      >
                                        {isLoading ? "Submitting..." : "Submit Appeal"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Violation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Violation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-violation" className="text-sm font-medium">
                Violation Type <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-violation"
                placeholder="Enter violation type"
                value={editViolation.violation}
                onChange={(e) => setEditViolation({...editViolation, violation: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="edit-description"
                placeholder="Describe the violation in detail"
                rows={3}
                value={editViolation.description}
                onChange={(e) => setEditViolation({...editViolation, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-actionTaken" className="text-sm font-medium">
                Action Taken <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-actionTaken"
                placeholder="Enter the action taken"
                value={editViolation.actionTaken}
                onChange={(e) => setEditViolation({...editViolation, actionTaken: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-severity" className="text-sm font-medium">
                Severity
              </label>
              <Select 
                value={editViolation.severity} 
                onValueChange={(value) => setEditViolation({...editViolation, severity: value as 'low' | 'medium' | 'high'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Additional Notes
              </label>
              <Textarea
                id="edit-notes"
                placeholder="Any additional notes..."
                rows={2}
                value={editViolation.notes}
                onChange={(e) => setEditViolation({...editViolation, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={editViolationAction}
                disabled={isLoading || !editViolation.violation || !editViolation.description || !editViolation.actionTaken}
              >
                {isLoading ? "Updating..." : "Update Violation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}