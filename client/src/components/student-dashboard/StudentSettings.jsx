import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Bell, Shield, Palette, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const StudentSettings = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load user preferences
    if (user) {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
      setNotifications(localStorage.getItem('notifications') !== 'false');
      setEmailNotifications(localStorage.getItem('emailNotifications') !== 'false');
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save preferences to localStorage
      localStorage.setItem('darkMode', darkMode);
      localStorage.setItem('notifications', notifications);
      localStorage.setItem('emailNotifications', emailNotifications);

      // Here you could also save to backend user profile
      // await updateUser({ preferences: { darkMode, notifications, emailNotifications } });

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const settingsSections = [
    {
      title: "Account Settings",
      icon: User,
      items: [
        {
          label: "Full Name",
          value: user?.name || "Student Name",
          readonly: true,
        },
        {
          label: "Email Address",
          value: user?.email || "student@example.com",
          readonly: true,
        },
        {
          label: "Student ID",
          value: user?._id?.substring(0, 12) + "..." || "N/A",
          readonly: true,
        },
      ],
    },
    {
      title: "Notification Preferences",
      icon: Bell,
      items: [
        {
          label: "Push Notifications",
          type: "toggle",
          value: notifications,
          onChange: setNotifications,
          description: "Receive notifications in your browser",
        },
        {
          label: "Email Notifications",
          type: "toggle",
          value: emailNotifications,
          onChange: setEmailNotifications,
          description: "Receive updates via email",
        },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Dark Mode",
          type: "toggle",
          value: darkMode,
          onChange: setDarkMode,
          description: "Use dark theme across the platform",
        },
      ],
    },
    {
      title: "Platform Information",
      icon: Globe,
      items: [
        {
          label: "Platform Version",
          value: "1.0.0",
          readonly: true,
        },
        {
          label: "Last Updated",
          value: new Date().toLocaleDateString(),
          readonly: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-fidel-500" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.label}
                        </label>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.readonly ? (
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                          {item.value}
                        </div>
                      ) : item.type === "toggle" ? (
                        <Button
                          variant={item.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => item.onChange(!item.value)}
                          className="min-w-20"
                        >
                          {item.value ? "On" : "Off"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-fidel-500 hover:bg-fidel-600"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
