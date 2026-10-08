import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Mail,
  User,
  Phone,
  Upload,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters")
    .regex(/^[A-Za-z ]+$/, "Name must contain letters only"),
  email: z
    .string()
    .email("Please enter a valid email")
    .regex(
      /^[A-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/i,
      "Email must be a gmail.com, hotmail.com, or yahoo.com address"
    ),
  phone: z.string()
    .regex(/^(\+251\d{9}|09\d{8}|07\d{8})$/, "Phone number must be in Ethiopian format: +251XXXXXXXXX, 09XXXXXXXX, or 07XXXXXXXX")
    .optional(),
  role: z.enum(["student", "instructor"]),
  expertise: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#\-\_\=\+])[A-Za-z\d@$!%*?&\#\-\_\=\+]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.role === "instructor") {
    return !!data.expertise && data.expertise.trim() !== "";
  }
  return true;
}, {
  message: "Expertise is required for instructors",
  path: ["expertise"],
});

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
   const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "student",
      expertise: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes("pdf")) {
        toast({
          title: "Invalid File Type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "CV must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setCvFile(file);
    }
  };

  const handleRoleChange = (value) => {
    form.setValue("role", value);
    if (value === "student") {
      form.setValue("expertise", "");
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.phone) formData.append("phone", values.phone);
      formData.append("role", values.role);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      if (values.role === "instructor") {
        formData.append("expertise", values.expertise);
        if (cvFile) formData.append("cv", cvFile);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message || "Registration successful!");

      console.log("Navigating to /verify-otp with registrationData:", values);
      navigate('/signup/verify-otp', { 
        state: { 
          email: values.email, 
          registrationData: values, 
          otpAlreadySent: true,
          devOtp: response.data?.otp
        } 
      });
    } catch (error) {
      let errorMessage = "An error occurred during registration";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors)
          .map(err => typeof err === 'string' ? err : err.message)
          .join(", ");
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password generator function
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each required character type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Add remaining characters to reach 12 characters total
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Set both password fields
    form.setValue('password', password);
    form.setValue('confirmPassword', password);
    
    toast.success('Strong password generated! You can modify it if you want.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Your existing UI components */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-fidel-100 dark:bg-fidel-950/20 rounded-full blur-3xl opacity-60 dark:opacity-30 -z-10"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-slate-100 dark:bg-slate-800/20 rounded-full blur-3xl opacity-60 dark:opacity-30 -z-10"></div>

        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-5">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join us to start your learning journey
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 md:p-8 shadow-lg"
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    {...form.register("name")}
                    className="glass-input pl-10"
                    placeholder="John Doe"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                </div>
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="glass-input pl-10"
                    placeholder="your.email@example.com"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    className="glass-input pl-10"
                    placeholder="+2519XXXXXXXX or 09XXXXXXXX or 07XXXXXXXX"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                </div>
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Join As
                </label>
                <Select
                  value={form.watch("role")}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Instructor-specific fields */}
              {form.watch("role") === "instructor" && (
                <>
                  {/* Expertise Field */}
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Expertise
                    </label>
                    <div className="relative">
                      <Textarea
                        id="expertise"
                        {...form.register("expertise")}
                        className="glass-input pl-10"
                        placeholder="Your areas of expertise"
                      />
                      <BookOpen className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    </div>
                    {form.formState.errors.expertise && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.expertise.message}
                      </p>
                    )}
                  </div>

                  {/* CV Upload Field */}
                  <div>
                    <label htmlFor="cv" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      CV (PDF only, max 5MB)
                    </label>
                    <div className="relative">
                      <label
                        htmlFor="cv-upload"
                        className="flex flex-col items-center justify-center w-full glass-input p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-fidel-500 transition-colors"
                      >
                        <div className="flex items-center">
                          <Upload className="w-5 h-5 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {cvFile ? cvFile.name : "Click to upload your CV"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Only PDF files are allowed
                        </p>
                      </label>
                      <input
                        id="cv-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-fidel-600 hover:text-fidel-700 dark:text-fidel-400 dark:hover:text-fidel-300 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Suggest Strong Password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="glass-input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Must contain at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    className="glass-input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-fidel-500 hover:bg-fidel-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-fidel-600 hover:text-fidel-500 font-medium"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Signup;