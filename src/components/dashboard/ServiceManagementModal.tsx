import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import { useMentorServices } from '@/hooks/useMentorServices';
import { useToast } from '@/hooks/use-toast';

interface ServiceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceForm {
  title: string;
  description: string;
  duration30: number;
  duration60: number;
  duration120: number;
}

export function ServiceManagementModal({ isOpen, onClose }: ServiceManagementModalProps) {
  const { services, isLoading, createService, updateService, deleteService } = useMentorServices();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceForm>({
    title: '',
    description: '',
    duration30: 0,
    duration60: 0,
    duration120: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create services for each duration that has a price
      const servicesToCreate = [];
      
      if (formData.duration30 > 0) {
        servicesToCreate.push({
          service_title: formData.title,
          service_description: formData.description,
          duration_minutes: 30,
          price: formData.duration30, // Store as dollars, not cents
        });
      }
      
      if (formData.duration60 > 0) {
        servicesToCreate.push({
          service_title: formData.title,
          service_description: formData.description,
          duration_minutes: 60,
          price: formData.duration60, // Store as dollars, not cents
        });
      }
      
      if (formData.duration120 > 0) {
        servicesToCreate.push({
          service_title: formData.title,
          service_description: formData.description,
          duration_minutes: 120,
          price: formData.duration120, // Store as dollars, not cents
        });
      }

      for (const service of servicesToCreate) {
        if (editingId) {
          await updateService(editingId, service);
        } else {
          await createService(service);
        }
      }

      toast({
        title: "Success",
        description: isEditing ? "Service updated successfully" : "Services created successfully"
      });

      setIsEditing(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        duration30: 0,
        duration60: 0,
        duration120: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save services. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: any) => {
    setIsEditing(true);
    setEditingId(service.id);
    setFormData({
      title: service.service_title,
      description: service.service_description || '',
      duration30: service.duration_minutes === 30 ? service.price : 0,
      duration60: service.duration_minutes === 60 ? service.price : 0,
      duration120: service.duration_minutes === 120 ? service.price : 0,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Services & Pricing</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {isEditing ? 'Edit Service' : 'Add New Service'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Service Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Dental School Application Review"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what you'll provide in this service..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Pricing by Duration</Label>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="w-16 text-sm">30 min</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.duration30 || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration30: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="w-16 text-sm">1 hour</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.duration60 || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration60: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="w-16 text-sm">2 hours</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.duration120 || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration120: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      {isEditing ? 'Update Service' : 'Create Service'}
                    </Button>
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditingId(null);
                          setFormData({
                            title: '',
                            description: '',
                            duration30: 0,
                            duration60: 0,
                            duration120: 0,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Existing Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Your Services</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : services?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No services created yet</p>
                <p className="text-sm">Create your first service to start accepting bookings</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {services?.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.service_title}</h4>
                          {service.service_description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.service_description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {service.duration_minutes}min
                            </Badge>
                            <Badge variant="outline">
                              ${service.price.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
