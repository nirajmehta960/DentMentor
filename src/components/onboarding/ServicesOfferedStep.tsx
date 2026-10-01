import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HAIRLINE } from "@/components/site";
import {
  FormSection,
  RequiredMark,
  StepActions,
  StepHeader,
} from "./onboarding-ui";

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
    <div>
      <StepHeader
        icon={BriefcaseBusiness}
        title="Services"
        description="Define the services you offer. You set the price and length of each one."
      />

      <div className="flex flex-col gap-8">
        {/* Service Templates */}
        <FormSection
          title="Start from a template"
          description="Add a common session type, then edit it to set your price."
        >
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceTemplates.map((template, index) => (
              <li
                key={index}
                className="flex flex-col gap-4 rounded-xl border bg-white p-5"
                style={{ borderColor: HAIRLINE }}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[0.9375rem] font-semibold leading-snug text-band-fg">
                      {template.title}
                    </h3>
                    <span className="stat shrink-0 text-band-signal">
                      {template.duration} min
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-band-muted">
                    {template.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTemplateService(template)}
                  className="mt-auto h-11 self-start"
                  aria-label={`Add ${template.title}`}
                >
                  <Plus aria-hidden="true" />
                  Add
                </Button>
              </li>
            ))}
          </ul>

          {/* Create Custom Service Button */}
          {!isCreating && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="h-11 self-start"
            >
              <Plus aria-hidden="true" />
              Create custom service
            </Button>
          )}
        </FormSection>

        {/* Service Creation/Edit Form */}
        {isCreating && (
          <section
            aria-labelledby="service-editor-title"
            className="flex flex-col gap-5 rounded-xl border bg-band-ground p-5 sm:p-6"
            style={{ borderColor: HAIRLINE }}
          >
            <h2
              id="service-editor-title"
              className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg"
            >
              {editingId ? "Edit service" : "Create new service"}
            </h2>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Service title
                <RequiredMark />
              </Label>
              <Input
                id="title"
                placeholder="e.g., Personal Statement Review"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="price">
                  Price (USD)
                  <RequiredMark />
                </Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-band-muted"
                  >
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    placeholder="50"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="pl-8 tabular-nums"
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="duration">
                  Duration (min)
                  <RequiredMark />
                </Label>
                <Input
                  id="duration"
                  type="number"
                  inputMode="numeric"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">
                Description
                <RequiredMark />
              </Label>
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
                className="resize-none"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11"
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
              <Button
                type="button"
                className="h-11"
                onClick={
                  editingId
                    ? () => handleUpdateService(editingId)
                    : handleCreateService
                }
              >
                {editingId ? "Update service" : "Create service"}
              </Button>
            </div>
          </section>
        )}

        {/* Current Services */}
        {services.length > 0 && (
          <FormSection title="Your services">
            <ul className="flex flex-col gap-3">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-start justify-between gap-4 rounded-xl border bg-white p-5 shadow-soft"
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="text-[0.9375rem] font-semibold leading-snug text-band-fg">
                      {service.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-band-muted">
                      {service.price > 0 ? (
                        <span
                          className="font-semibold text-band-fg"
                          data-numeric=""
                        >
                          ${service.price}
                        </span>
                      ) : (
                        <span>
                          <span className="font-semibold text-band-fg" data-numeric="">
                            ${service.price}
                          </span>{" "}
                          · edit to set a price
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1" data-numeric="">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {service.duration} min
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-band-muted">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditService(service)}
                      aria-label={`Edit ${service.title}`}
                      className="size-11"
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service.id)}
                      aria-label={`Remove ${service.title}`}
                      className="size-11 text-red-700 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </FormSection>
        )}
      </div>

      <StepActions onBack={onPrevious}>
        <Button type="submit" onClick={handleSubmit} size="lg">
          Continue
          <ArrowRight aria-hidden="true" />
        </Button>
      </StepActions>
    </div>
  );
};
