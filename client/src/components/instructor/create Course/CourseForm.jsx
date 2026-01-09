import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import axios from "axios";
import { useEffect } from "react";

const categories = [
  "Computer Science",
  "Programming",
  "Web Development",
  "Business",
  "Marketing",
  "Data Science",
  "Psychology",
  "Finance",
  "Design",
  "Languages",
  "Health & Fitness",
  "Mathematics",
  "Photography",
  "Music",
  "Other",
];

const courseFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  level: z.string().nonempty({ message: "Please select a level." }),
  category: z.string().nonempty({ message: "Please select a category." }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Price must be a valid number." }),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters." }).optional(),
  thumbnail: z.any().optional().refine((file) => !file || file instanceof File, {
    message: "Please upload a valid image file.",
  }).refine((file) => !file || ["image/png", "image/jpeg", "image/gif"].includes(file.type), {
    message: "Only PNG, JPG, or GIF files are allowed.",
  }).refine((file) => !file || file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB.",
  }),
});

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CourseForm = ({ courseId, setCourseId, setActiveTab, setModules }) => {
  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "",
      category: "",
      price: "",
      requirements: "",
      thumbnail: null,
    },
  });

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        const c = res.data;

        form.reset({
          title: c?.title || "",
          description: c?.description || "",
          level: c?.level || "",
          category: c?.category || "",
          price: c?.price != null ? String(c.price) : "",
          requirements: c?.requirements || "",
          thumbnail: null,
        });

        if (Array.isArray(c?.modules)) {
          setModules(c.modules);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load course");
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const onSubmit = async (values) => {
    console.log("Submitting course form with values:", values);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "thumbnail" && value) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, value);
        }
      });

      if (courseId) {
        console.log("Updating existing course:", courseId);
        await api.put(`/courses/${courseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Course updated successfully");
        console.log("Setting active tab to curriculum");
        setActiveTab("curriculum");
        return;
      }

      console.log("Creating new course");
      const response = await api.post("/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newCourseId = response.data._id;
      console.log("New course created with ID:", newCourseId);
      setCourseId(newCourseId);
      setModules([]);
      form.reset();
      toast.success("Course created successfully");
      console.log("Setting active tab to curriculum");
      setActiveTab("curriculum");
    } catch (error) {
      console.error("Error submitting course form:", error);
      toast.error(error.response?.data?.message || (courseId ? "Failed to update course" : "Failed to create course"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Course Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Advanced React Development" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, specific title that describes what you'll teach
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your course in detail..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of what students will learn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the appropriate level for your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category.toLowerCase().replace(/\s+/g, "-")}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best fits your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the requirements or prerequisites for your course..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify what students need to know or have before taking this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Thumbnail</FormLabel>
                  <FormControl>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-md">
                      <div className="space-y-1 text-center">
                        {field.value ? (
                          <img
                            src={URL.createObjectURL(field.value)}
                            alt="Thumbnail preview"
                            className="mx-auto h-32 w-32 object-cover rounded-md"
                          />
                        ) : (
                          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                        )}
                        <div className="flex text-sm">
                          <label
                            htmlFor="thumbnail-upload"
                            className="relative cursor-pointer rounded-md font-medium text-fidel-600 hover:text-fidel-500 focus-within:outline-none"
                          >
                            <span>{field.value ? "Change file" : "Upload a file"}</span>
                            <input
                              id="thumbnail-upload"
                              name="thumbnail-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/gif"
                              className="sr-only"
                              onChange={(e) => field.onChange(e.target.files[0])}
                            />
                          </label>
                          <p className="pl-1 text-slate-500 dark:text-slate-400">
                            or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  {field.value && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {field.value.name}
                    </p>
                  )}
                  <FormDescription>
                    Upload a thumbnail image for your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Price ($)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g. 49.99" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set a price for your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-8">
              <Button type="submit" size="lg">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;