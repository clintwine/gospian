import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Copy, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShareButton({ 
  title = "Check out my achievement!", 
  text,
  url = window.location.href 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const shareText = `${title}\n${text}\n\n${url}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="gap-2 cursor-pointer">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}