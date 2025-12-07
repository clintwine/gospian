import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1A2F]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-xl border-b border-[#D7E5FF] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#0A1A2F] dark:text-white">GOSPIAN</span>
            </Link>
            <Link to={createPageUrl('Landing')}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: December 7, 2025</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to GOSPIAN. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                music ear training application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">We collect the following types of information:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account Information:</strong> Email address, full name, and profile details</li>
                <li><strong>Usage Data:</strong> Exercise results, training progress, XP, streaks, and performance metrics</li>
                <li><strong>Social Data:</strong> Friend connections, messages, posts, and community interactions</li>
                <li><strong>Preferences:</strong> Theme settings, audio preferences, and practice configurations</li>
                <li><strong>Technical Data:</strong> Device information, browser type, and usage analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain our ear training services</li>
                <li>Track your progress and generate personalized training plans</li>
                <li>Enable social features like leaderboards and friend connections</li>
                <li>Send notifications about achievements and challenges</li>
                <li>Improve our services and develop new features</li>
                <li>Communicate with you about updates and support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>With Other Users:</strong> Your profile name, level, and leaderboard rankings are visible to other users</li>
                <li><strong>With Friends:</strong> Friends can see your progress, achievements, and activity feed</li>
                <li><strong>Service Providers:</strong> We use trusted third-party services for hosting and analytics</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method 
                of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data</li>
                <li>Object to certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, remember your preferences, 
                and analyze usage patterns. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is intended for users aged 13 and above. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected such information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any significant 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us 
                through the feedback feature in the app or via email.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}