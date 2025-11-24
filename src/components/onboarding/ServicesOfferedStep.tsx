import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

interface ServicesOfferedStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const serviceTemplates: Omit<Service, "id">[] = [
  {
    title: "SOP Review & Feedback",
    description:
      "Comprehensive review of Statement of Purpose with detailed feedback and suggestions for improvement.",
    price: 0, // No predefined price
    duration: 60,
  },
  {
    title: "Mock Interview Session",
    description:
      "Practice dental school interview with real-time feedback on answers, body language, and communication skills.",
    price: 0, // No predefined price
    duration: 45,
  },
  {
    title: "CV/Resume Review",
    description:
      "Professional review and enhancement of your CV/resume for dental school applications.",
    price: 0, // No predefined price
    duration: 45,
  },
  {
    title: "Application Strategy Consultation",
    description:
      "Personalized guidance on school selection, application timeline, and strategic planning.",
    price: 0, // No predefined price
    duration: 60,
  },
];

export const ServicesOfferedStep = ({
  data,
  onNext,
  onPrevious,
}: ServicesOfferedStepProps) => {
  // Use lazy initializer to only initialize services once from data
  // This prevents services from being reset when the data prop changes
  const [services, setServices] = useState<Service[]>(
    () => data?.services || []
  );
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
  });

  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTemplateService = (template: Omit<Service, "id">) => {
    const newService: Service = {
      id: generateId(),
      ...template,
    };
    setServices((prev) => [...prev, newService]);
    toast({
      title: "Service added!",
      description: `${template.title} has been added to your services.`,
    });
  };

  const handleCreateService = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a service title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a service description.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Price required",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast({
        title: "Duration required",
        description: "Please enter a valid duration.",
        variant: "destructive",
      });
      return;
    }

    const newService: Service = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
    };

    setServices((prev) => [...prev, newService]);
    setFormData({ title: "", description: "", price: "", duration: "" });
    setIsCreating(false);

    toast({
      title: "Service created!",
      description: `${newService.title} has been added to your services.`,
    });
  };

  const handleUpdateService = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a service title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a service description.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Price required",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast({
        title: "Duration required",
        description: "Please enter a valid duration.",
        variant: "destructive",
      });
      return;
    }

    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              title: formData.title,
              description: formData.description,
              price: parseFloat(formData.price),
              duration: parseInt(formData.duration),
            }
          : s
      )
    );

    setFormData({ title: "", description: "", price: "", duration: "" });
    setEditingId(null);

    toast({
      title: "Service updated!",
      description: `${formData.title} has been updated.`,
    });
  };

  const handleDeleteService = (id: string) => {
    const service = services.find((s) => s.id === id);
    setServices((prev) => prev.filter((s) => s.id !== id));

    if (service) {
      toast({
        title: "Service removed",
        description: `${service.title} has been removed from your services.`,
      });
    }
  };

  const handleEditService = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setEditingId(service.id);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (services.length === 0) {
      toast({
        title: "At least one service required",
        description: "Please add at least one service to continue.",
        variant: "destructive",
      });
      return;
    }

    onNext({ services });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Services Offered</h2>
        <p className="text-muted-foreground">
          Define the services you offer to help students on their dental journey
        </p>
      </div>

      {/* Popular Service Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Popular Service Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTemplates.map((template, index) => (
            <Card
              key={index}
              className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm">{template.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Duration: {template.duration} min</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTemplateService(template)}
                      className="h-7 px-3 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Custom Service Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Service
        </Button>
      </div>

      {/* Service Creation/Edit Form */}
      {isCreating && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Service" : "Create New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Personal Statement Review"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="50"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this service includes and how it helps students..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={
                  editingId
                    ? () => handleUpdateService(editingId)
                    : handleCreateService
                }
                className="flex-1"
              >
                {editingId ? "Update Service" : "Create Service"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({
                    title: "",
                    description: "",
                    price: "",
                    duration: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Services */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Your Services ({services.length})
          </h3>
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{service.title}</h4>
                        <Badge variant="secondary">${service.price}</Badge>
                        <Badge variant="outline">{service.duration} min</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
