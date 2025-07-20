"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, Linkedin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const XIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.784.305-1.459.717-2.126 1.384S.935 3.356.63 4.14C.333 4.905.13 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.784.718 1.459 1.384 2.126.667.666 1.342 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.784-.305 1.459-.718 2.126-1.384.666-.667 1.079-1.342 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.148-.558-2.913-.305-.784-.718-1.459-1.384-2.126C21.314.935 20.64.522 19.86.217c-.765-.296-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.056 1.17-.249 1.805-.413 2.227-.217.562-.477.96-.896 1.381-.42.419-.819.679-1.38.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.585-.015-4.85-.074c-1.17-.056-1.805-.249-2.227-.413-.562-.217-.96-.477-1.381-.896-.419-.42-.679-.819-.896-1.38-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.585.07-4.85c.055-1.17.249-1.805.413-2.227.217-.562.477.96.896-1.381.42-.419.819-.679 1.38-.896.422-.164 1.057.36 2.227-.413C8.415 2.175 8.797 2.16 12 2.16zm0 5.482A4.356 4.356 0 1 0 12 16.35a4.356 4.356 0 0 0 0-8.708zM12 14.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm6.406-11.845a1.288 1.288 0 0 0-1.82 1.82 1.288 1.288 0 0 0 1.82-1.82z"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <path d="M12.04 2.01A10.02 10.02 0 0 0 2 12.05a10.02 10.02 0 0 0 10.04 10.03c5.52 0 10.03-4.5 10.03-10.03S17.56 2.01 12.04 2.01zM12.05 20.1c-4.42 0-8.02-3.6-8.02-8.04s3.6-8.03 8.02-8.03c4.42 0 8.03 3.6 8.03 8.03s-3.6 8.04-8.03 8.04zm4.5-5.98c-.27-.13-1.58-.78-1.82-.87-.25-.09-.43-.13-.61.13-.18.27-.69.87-.85 1.04-.16.18-.32.19-.59.06-.27-.13-1.14-.42-2.18-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.14-.12.18-.2.27-.35.09-.14.05-.27-.01-.39-.06-.13-.61-1.47-.83-2.01-.22-.54-.45-.47-.61-.47h-.5c-.18 0-.45.06-.69.33-.24.27-.92.9-1.12 2.18-.2 1.28.1 2.52.73 3.31.63.78 1.93 2.59 4.68 3.66 2.75 1.07 3.2.87 3.78.81.58-.06 1.58-.64 1.8-1.28.23-.64.23-1.18.16-1.28l-.04-.01z"/>
    </svg>
);


interface ShareButtonsProps {
  text: string;
}

export function ShareButtons({ text }: ShareButtonsProps) {
  const { toast } = useToast();
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${text} #memerdev`);

  const shareOptions = [
    { name: 'X', icon: <XIcon />, url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(pageUrl)}` },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, url: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}` },
    { name: 'LinkedIn', icon: <Linkedin />, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${shareText}` },
    { name: 'Instagram', icon: <InstagramIcon />, url: 'https://instagram.com', isInfo: true, info: "Sharing on Instagram requires the downloaded image." },
  ];

  const handleShare = (url: string, isInfo?: boolean, info?: string) => {
    if (isInfo) {
      toast({ title: 'Instagram Sharing', description: info });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    toast({ title: "Link Copied!", description: "URL copied to your clipboard." });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {shareOptions.map(option => (
          <DropdownMenuItem key={option.name} onSelect={() => handleShare(option.url, option.isInfo, option.info)}>
            {option.icon}
            <span className="ml-2">{option.name}</span>
          </DropdownMenuItem>
        ))}
         <DropdownMenuItem onSelect={copyLink}>
            <Link className="h-4 w-4" />
            <span className="ml-2">Copy Link</span>
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
