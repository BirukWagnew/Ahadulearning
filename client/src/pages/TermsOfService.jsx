import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Welcome to Ahadu Online Learning. Please read these terms carefully.
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
                <FileText className="w-8 h-8 mr-3 text-fidel-500" />
                Agreement to Terms
              </h2>
              
              <p className="text-muted-foreground mb-4">
                <strong>Effective Date:</strong> January 6, 2026
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h3>
              <p className="text-muted-foreground mb-6">
                By accessing and using Ahadu Online Learning, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                2. Description of Service
              </h3>
              <p className="text-muted-foreground mb-6">
                Ahadu Online Learning is an online educational platform that provides courses, 
                learning materials, and educational services. We connect students with qualified instructors 
                and provide tools for effective online learning.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                3. User Responsibilities
              </h3>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform for legitimate educational purposes</li>
                <li>Respect intellectual property rights of instructors</li>
                <li>Follow community guidelines and code of conduct</li>
              </ul>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                4. Privacy and Data Protection
              </h3>
              <p className="text-muted-foreground mb-6">
                We respect your privacy and are committed to protecting your personal information. 
                Please review our Privacy Policy for detailed information about data collection and usage.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                5. Payment Terms
              </h3>
              <p className="text-muted-foreground mb-6">
                All payments are processed through secure payment gateways. 
                Once a payment has been completed, there are no returns or refunds.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                6. Security and Misuse
              </h3>
              <p className="text-muted-foreground mb-6">
                Any attempt to interrupt, abuse, or interfere with the system or platform services may result in permanent account blocking.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                7. Intellectual Property
              </h3>
              <p className="text-muted-foreground mb-6">
                All course content and materials are the intellectual property of Ahadu Online Learning 
                or our instructors. Unauthorized reproduction or distribution is prohibited.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                8. Service Availability
              </h3>
              <p className="text-muted-foreground mb-6">
                We strive to maintain high service availability but cannot guarantee 100% uptime. 
                We reserve the right to modify or discontinue services with appropriate notice.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                9. Limitation of Liability
              </h3>
              <p className="text-muted-foreground mb-6">
                Ahadu Online Learning shall not be liable for any indirect, incidental, or consequential 
                damages arising from your use of our services.
              </p>

              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                10. Contact Information
              </h3>
              <p className="text-muted-foreground mb-6">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="font-medium">Email: info@ahadulearning.edu</p>
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

export default TermsOfService;
