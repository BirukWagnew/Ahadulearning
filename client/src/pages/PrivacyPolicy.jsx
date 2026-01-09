import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Your privacy is important to us at Ahadu Online Learning.
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
                <Shield className="w-8 h-8 mr-3 text-fidel-500" />
                Our Commitment to Privacy
              </h2>
              
              <p className="text-muted-foreground mb-6">
                <strong>Effective Date:</strong> January 6, 2026
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                1. Information We Collect
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and contact information</li>
                    <li>Email address and phone number</li>
                    <li>Account credentials (encrypted)</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Educational Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Course enrollment and completion data</li>
                    <li>Learning progress and performance metrics</li>
                    <li>Quiz and assessment results</li>
                    <li>Certificate issuance records</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-2">Technical Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Access logs and usage patterns</li>
                    <li>Cookie and storage data</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2">Service Provision</h4>
                  <p>To provide educational services, process payments, and facilitate learning experiences.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Communication</h4>
                  <p>To send course updates, notifications, and respond to your inquiries.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Platform Improvement</h4>
                  <p>To analyze usage patterns and improve our educational offerings.</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-2">Legal Compliance</h4>
                  <p>To comply with educational regulations and legal requirements.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                3. Data Sharing and Disclosure
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="mb-4">
                  We do not sell, rent, or trade your personal information with third parties 
                  except as described in this policy.
                </p>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Instructors</h4>
                  <p>Course instructors can access student data for course management purposes only.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Legal Requirements</h4>
                  <p>We may disclose information when required by law or to protect our rights.</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                4. Data Security
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Security Measures
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>SSL encryption for all data transmissions</li>
                    <li>Secure password storage and authentication</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to sensitive information</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                5. Your Rights
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Access and Control
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Download your learning data</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                6. Contact Us
              </h3>
              <p className="text-muted-foreground mb-6">
                For privacy-related questions or concerns, please contact us at:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="font-medium">Email: privacy@ahadulearning.edu</p>
                <p className="font-medium">Phone: +251 33 123 4567</p>
                <p className="font-medium">Address: 123 Kombolcha Street, Kombolcha, Ethiopia</p>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                7. Policy Updates
              </h3>
              <p className="text-muted-foreground mb-6">
                We may update this privacy policy periodically. Changes will be posted on this page 
                with an updated effective date.
              </p>

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

export default PrivacyPolicy;
