import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music2 } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: December 7, 2025</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using GOSPIAN, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                GOSPIAN is a music ear training application that provides exercises, challenges, and social features 
                to help musicians improve their listening and pitch recognition skills. We reserve the right to modify, 
                suspend, or discontinue any aspect of the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">When creating an account, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 13 years of age</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post offensive, inappropriate, or spam content</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Reverse engineer or decompile any part of the application</li>
                <li>Use automated tools or bots to manipulate rankings or achievements</li>
                <li>Impersonate other users or misrepresent your identity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">5. Content and Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                All content provided through GOSPIAN, including exercises, audio files, graphics, and software, 
                is owned by us or our licensors and protected by intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of content you create (such as posts and messages), but grant us a license 
                to use, display, and distribute it within the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">6. XP, Achievements, and Virtual Items</h2>
              <p className="text-muted-foreground leading-relaxed">
                XP points, achievements, streaks, and other virtual items have no real-world monetary value. 
                We reserve the right to modify, reset, or remove these items at our discretion, including 
                in cases of cheating or abuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">7. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of GOSPIAN is also governed by our Privacy Policy. Please review it to understand 
                how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these 
                terms or for any other reason. You may also delete your account at any time through the app settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">9. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed">
                GOSPIAN is provided "as is" without warranties of any kind. We do not guarantee that the service 
                will be uninterrupted, error-free, or completely secure. We are not responsible for any loss of 
                data or progress.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from your use of GOSPIAN.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms of Service from time to time. Continued use of the service after 
                changes are posted constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with applicable laws. 
                Any disputes shall be resolved in the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] dark:text-white mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through the 
                feedback feature in the app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}