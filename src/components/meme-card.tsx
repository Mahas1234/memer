"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Meme } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MemeCardProps {
  meme: Meme;
}

const fontClassMap = {
    'Impact': 'font-impact',
    'Anton': 'font-anton',
    'Lobster': 'font-lobster',
    'Comic Neue': 'font-comic-neue'
};

export function MemeCard({ meme }: MemeCardProps) {
  const fontClass = fontClassMap[meme.font || 'Impact'] || 'font-impact';

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-slide-up">
      <CardContent className="p-0 relative aspect-[4/3]">
        <Image 
          src={meme.imageUrl} 
          alt={meme.caption}
          fill
          className="object-cover" 
          data-ai-hint={meme.aiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end">
          <p className={cn(fontClass, "text-white uppercase text-xl md:text-2xl text-center [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_0_0_#000,-2px_0_0_#000,0_2px_0_#000,0_-2px_0_#000] drop-shadow-lg")}>
            {meme.caption}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex-col items-start text-sm bg-card">
        <p className="font-body text-muted-foreground italic line-clamp-2 text-xs">Based on: "{meme.headline}"</p>
        <p className="text-xs text-muted-foreground/80 mt-2 font-body">{formatDistanceToNow(new Date(meme.createdAt))} ago</p>
      </CardFooter>
    </Card>
  );
}
