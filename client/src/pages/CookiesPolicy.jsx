import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Shield, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiesPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-fidel-500 to-fidel-700 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cookies Policy
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              How Ahadu Online Learning uses cookies to enhance your experience.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose prose-slate dark:prose-invert max-w-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Cookie className="w-8 h-8 mr-3 text-fidel-500" />
                What Are Cookies?
              </h2>
              
              <p className="text-muted-foreground mb-6">
                <strong>Effective Date:</strong> January 6, 2026
              </p>

              <p className="text-muted-foreground mb-6">
                Cookies are small text files that are stored on your device when you visit Ahadu Online Learning. 
                They help us provide, protect, and improve our services.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                1. Types of Cookies We Use
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Essential Cookies
                  </h4>
                  <p>Required for basic site functionality and security.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Performance Cookies</h4>
                  <p>Help us understand how our platform is used and improve performance.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Functional Cookies</h4>
                  <p>Enable enhanced features and personalization options.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                2. How We Use Cookies
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Platform Functionality
                  </h4>
                  <p>Maintain user sessions, preferences, and security settings.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Analytics & Improvement</h4>
                  <p>Analyze usage patterns to enhance our educational offerings.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Personalization</h4>
                  <p>Remember your preferences and provide customized learning experiences.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                3. Managing Your Cookie Preferences
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="mb-4">
                  You can control and manage cookies through your browser settings:
                </p>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Browser Settings</h4>
                  <p>Most browsers allow you to block or delete cookies through settings.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Cookie Preferences</h4>
                  <p>You can choose to accept or reject non-essential cookies.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                4. Third-Party Cookies
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="mb-4">
                  Ahadu Online Learning may use third-party services that place cookies on your device:
                </p>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Payment Processors</h4>
                  <p>Chapa and other payment gateways for secure transactions.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Analytics Services</h4>
                  <p>Google Analytics and similar tools for platform improvement.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                5. Cookie Duration
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2">Session Cookies</h4>
                  <p>Expire when you close your browser (typically 24 hours).</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Persistent Cookies</h4>
                  <p>Remain on your device for extended periods (up to 1 year).</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                6. Your Rights
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2">Control Options</h4>
                  <p>You can accept, reject, or delete cookies at any time.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Transparency</h4>
                  <p>We provide clear information about our cookie usage.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                7. Updates to This Policy
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="mb-4">
                  We may update this cookies policy to reflect changes in our practices:
                </p>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Notification</h4>
                  <p>Changes will be posted on this page with an updated effective date.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                8. Contact Information
              </h3>
              <p className="text-muted-foreground mb-6">
                For questions about this cookies policy, please contact us at:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="font-medium">Email: privacy@ahadulearning.edu</p>
                <p className="font-medium">Phone: +251 33 123 4567</p>
                <p className="font-medium">Address: 123 Kombolcha Street, Kombolcha, Ethiopia</p>
              </div>

              <p className="text-sm text-muted-foreground mt-8">
                <strong>Last Updated:</strong> January 6, 2026
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-fidel-500 hover:text-fidel-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default CookiesPolicy;
