import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SuggestionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      toast.error('Please enter a suggestion');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use InvokeLLM to process and categorize the suggestion
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User feedback/suggestion for ear training app: "${suggestion}"\n\nAnalyze this suggestion and provide:\n1. Category (UI/UX, Feature Request, Bug Report, Performance, Content, Other)\n2. Priority (Low, Medium, High, Critical)\n3. Summary (one sentence)\n4. Detailed analysis`,
        response_json_schema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            priority: { type: 'string' },
            summary: { type: 'string' },
            analysis: { type: 'string' }
          }
        }
      });

      // Store the processed suggestion
      await base44.integrations.Core.SendEmail({
        to: 'feedback@gospian.app',
        subject: `[${response.category}] New Suggestion: ${response.summary}`,
        body: `
Priority: ${response.priority}
Category: ${response.category}

Original Suggestion:
${suggestion}

AI Analysis:
${response.analysis}
        `
      });

      toast.success('Thank you! Your suggestion has been submitted.');
      setSuggestion('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to submit suggestion. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-4 shadow-lg bg-white dark:bg-[#0A1A2F] border-[#3E82FC] hover:bg-[#D7E5FF] dark:hover:bg-[#243B73] z-40"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Suggest
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve GOSPIAN! Share your ideas, report issues, or suggest new features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What would you like to see improved or added?"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !suggestion.trim()}
              className="w-full bg-[#3E82FC] hover:bg-[#243B73]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}