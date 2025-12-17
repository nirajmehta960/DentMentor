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
  Clock,
  FileText,
  Sparkles,
  CheckCircle2,
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
    price: 0,
    duration: 60,
  },
  {
    title: "Mock Interview Session",
    description:
      "Practice dental school interview with real-time feedback on answers, body language, and communication skills.",
    price: 0,
    duration: 45,
  },
  {
    title: "CV/Resume Review",
    description:
      "Professional review and enhancement of your CV/resume for dental school applications.",
    price: 0,
    duration: 45,
  },
  {
    title: "Application Strategy Consultation",
    description:
      "Personalized guidance on school selection, application timeline, and strategic planning.",
    price: 0,
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

  // Update services when data prop changes (for edit mode)
  useEffect(() => {
    if (data?.services && data.services.length > 0) {
      setServices(data.services);
    }
  }, [data]);

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

    // Validation - preserve backend logic
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
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Services Offered
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Define the services you offer to help students on their dental journey
        </p>
      </div>

      {/* Popular Service Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Popular Service Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTemplates.map((template, index) => (
            <Card
              key={index}
              className="border-2 border-dashed border-border/50 hover:border-primary/50 hover:shadow-md transition-all bg-gradient-to-br from-background to-muted/20"
            >
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {template.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration} min</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTemplateService(template)}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
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
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Service
        </Button>
      </div>

      {/* Service Creation/Edit Form */}
      {isCreating && (
        <Card className="border-primary/30 bg-primary/5 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {editingId ? "Edit Service" : "Create New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
                  className="h-12 border-border/50 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="50"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="h-12 pl-8 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="h-12 border-border/50 focus:border-primary"
                  />
                </div>
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
                className="resize-none border-border/50 focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={
                  editingId
                    ? () => handleUpdateService(editingId)
                    : handleCreateService
                }
                className="flex-1 bg-primary hover:bg-primary/90"
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
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-foreground">
              Your Services ({services.length})
            </h3>
          </div>
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {service.title}
                        </h4>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                          ${service.price}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {service.duration} min
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditService(service)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteService(service.id)}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
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
      <div className="flex justify-between pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          size="lg"
          className="px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          size="lg"
          className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
