import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock, PencilLine, ClipboardList } from 'lucide-react';
import { useMentorServices } from '@/hooks/useMentorServices';
import { useToast } from '@/hooks/use-toast';
import { IconTile, MetaLabel, StatusPill } from './dashboard-ui';

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

/* Portals to <body>, outside the AppShell: app theme tokens only. */

/** One duration's price field. */
function PriceRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="flex w-20 shrink-0 items-center gap-2 text-sm text-foreground">
        <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
        {label}
      </label>
      <div className="relative flex-1">
        <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="pl-8 tabular-nums"
        />
      </div>
    </div>
  );
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
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-y-auto rounded-2xl p-5 sm:p-7">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
            Services & pricing
          </DialogTitle>
          <DialogDescription>
            You set your own services, prices and session lengths. Each price you enter becomes a bookable option.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Service Form */}
          <section className="flex flex-col gap-5 rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <IconTile icon={isEditing ? PencilLine : Plus} />
              <h3 className="font-display text-[1rem] font-semibold tracking-[-0.01em] text-foreground">
                {isEditing ? 'Edit service' : 'Add a service'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Service title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Dental School Application Review"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you'll provide in this service..."
                  rows={3}
                />
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-medium text-foreground">Price by session length</legend>
                <PriceRow
                  id="price-30"
                  label="30 min"
                  value={formData.duration30}
                  onChange={(value) => setFormData(prev => ({ ...prev, duration30: value }))}
                />
                <PriceRow
                  id="price-60"
                  label="1 hour"
                  value={formData.duration60}
                  onChange={(value) => setFormData(prev => ({ ...prev, duration60: value }))}
                />
                <PriceRow
                  id="price-120"
                  label="2 hours"
                  value={formData.duration120}
                  onChange={(value) => setFormData(prev => ({ ...prev, duration120: value }))}
                />
              </fieldset>

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
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
                <Button type="submit" className="flex-1">
                  {isEditing ? 'Update service' : 'Create service'}
                </Button>
              </div>
            </form>
          </section>

          {/* Existing Services */}
          <section className="flex flex-col gap-3">
            <MetaLabel>Your services</MetaLabel>

            {isLoading ? (
              <div aria-hidden="true" className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted motion-safe:animate-pulse" />
                ))}
              </div>
            ) : services?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border px-6 py-10 text-center">
                <IconTile icon={ClipboardList} size="lg" />
                <p className="max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
                  No services yet. Create your first one to start accepting bookings.
                </p>
              </div>
            ) : (
              <ul className="max-h-96 divide-y overflow-y-auto rounded-xl border">
                {services?.map((service) => (
                  <li key={service.id} className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[0.9375rem] font-semibold text-foreground">{service.service_title}</h4>
                      {service.service_description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {service.service_description}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <StatusPill tone="muted" className="gap-1 normal-case tabular-nums">
                          <Clock className="size-3" aria-hidden="true" />
                          {service.duration_minutes} min
                        </StatusPill>
                        <StatusPill tone="teal" className="normal-case tabular-nums">
                          ${service.price.toFixed(2)}
                        </StatusPill>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                        aria-label={`Edit ${service.service_title}`}
                        className="size-11"
                      >
                        <Edit className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        aria-label={`Delete ${service.service_title}`}
                        className="size-11 text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
