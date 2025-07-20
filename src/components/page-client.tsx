"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewsHeadline, Meme, MemeTone } from '@/lib/types';
import { generateMemeCaption } from '@/ai/flows/generate-meme-caption';
import { fetchTrendingHeadlines } from '@/lib/news-api';
import { getRandomMemeTemplate } from '@/lib/meme-templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/share-buttons';
import { MemeCard } from '@/components/meme-card';
import { Loader } from '@/components/loader';
import { Download, Laugh, RefreshCw, Sparkles, MessageCircleHeart } from 'lucide-react';
import Image from 'next/image';

const WavyText = ({ text }: { text: string }) => (
  <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tighter">
    {text.split('').map((char, index) => (
      <span key={index} className="inline-block wavy-char" style={{ animationDelay: `${index * 50}ms` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </h1>
);


export function PageClient() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);
  const [tone, setTone] = useState<MemeTone>('funny');
  const [generatedMeme, setGeneratedMeme] = useState<Meme | null>(null);
  const [memeHistory, setMemeHistory] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const memeDisplayRef = useRef<HTMLDivElement>(null);

  const loadHeadlines = useCallback(async () => {
    setIsLoading(true);
    try {
      const news = await fetchTrendingHeadlines();
      setHeadlines(news);
      if(news.length > 0) {
        setSelectedHeadline(news[0]);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch news headlines.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHeadlines();
    try {
      const storedMemes = localStorage.getItem('memeHistory');
      if (storedMemes) {
        setMemeHistory(JSON.parse(storedMemes));
      }
    } catch (error) {
      console.error("Could not load memes from local storage.", error)
    }
  }, [loadHeadlines]);

  useEffect(() => {
    if (selectedHeadline) {
      handleGenerateMeme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHeadline, tone]);
  
  const handleGenerateMeme = async () => {
    if (!selectedHeadline) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a headline first.' });
      return;
    }

    setIsGenerating(true);
    setGeneratedMeme(null);

    try {
      const result = await generateMemeCaption({ headline: selectedHeadline.title, tone });
      const template = getRandomMemeTemplate();
      const newMeme: Meme = {
        id: new Date().toISOString(),
        imageUrl: template.url,
        caption: result.caption,
        headline: selectedHeadline.title,
        createdAt: new Date().toISOString(),
        aiHint: template.hint,
      };
      setGeneratedMeme(newMeme);

      const updatedHistory = [newMeme, ...memeHistory].slice(0, 12); // Keep last 12
      setMemeHistory(updatedHistory);
      localStorage.setItem('memeHistory', JSON.stringify(updatedHistory));
      
      setTimeout(() => {
         memeDisplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate meme caption.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const memeNode = document.getElementById('meme-to-download');
    if (!memeNode) return;

    const imgElement = memeNode.querySelector('img');
    const captionElement = memeNode.querySelector('p');

    if (!imgElement || !captionElement) return;

    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = imgElement.src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // for higher resolution
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const fontSize = canvas.width / 14;
      ctx.font = `bold ${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 20;
      ctx.textAlign = 'center';
      
      const text = captionElement.innerText.toUpperCase();
      const x = canvas.width / 2;
      const maxWidth = canvas.width * 0.9;
      const lineHeight = fontSize * 1.1;

      const words = text.split(' ');
      let line = '';
      const lines = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());
      
      const textBlockHeight = lines.length * lineHeight;
      const topY = lineHeight * 1.2;
      const bottomY = canvas.height - textBlockHeight;

      const captionLines = lines.slice(0, 4); // max 4 lines

      for (let i = 0; i < captionLines.length; i++) {
        const yPos = bottomY + (i * lineHeight);
        ctx.strokeText(captionLines[i], x, yPos);
        ctx.fillText(captionLines[i], x, yPos);
      }

      const link = document.createElement('a');
      link.download = `memestream-ai-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.onerror = () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load image for download.' });
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8 md:mb-12">
        <WavyText text="MemeStream AI" />
        <p className="font-body text-lg text-muted-foreground mt-2">Turn today's news into tomorrow's memes.</p>
        <Button onClick={loadHeadlines} className="mt-4 animate-pulsating-glow" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching News...' : 'Refresh News'}
        </Button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">1. Pick a headline</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <div className="text-center p-8 font-body">Loading headlines...</div>}
              {!isLoading && headlines.length > 0 && (
                <Carousel
                  opts={{ align: 'start' }}
                  setApi={(api) => {
                    api?.on('select', () => setSelectedHeadline(headlines[api.selectedScrollSnap()]));
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {headlines.map((headline, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-full">
                        <div className="p-1">
                          <Card className={`h-40 flex flex-col justify-center p-6 border-2 transition-colors ${selectedHeadline?.title === headline.title ? 'border-primary' : ''}`}>
                            <p className="font-body font-bold text-lg">{headline.title}</p>
                            <p className="font-body text-sm text-muted-foreground mt-2">{headline.source}</p>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">2. Choose a tone</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="funny" onValueChange={(value: string) => setTone(value as MemeTone)} className="flex justify-center">
                <div className="flex space-x-2 rounded-full bg-muted p-1">
                  {[
                    { value: 'funny', label: 'Funny', icon: <Laugh className="w-4 h-4 mr-2"/> },
                    { value: 'sarcastic', label: 'Sarcastic', icon: <MessageCircleHeart className="w-4 h-4 mr-2"/> },
                    { value: 'inspirational', label: 'Inspirational', icon: <Sparkles className="w-4 h-4 mr-2"/> },
                  ].map(item => (
                    <div key={item.value}>
                      <RadioGroupItem value={item.value} id={item.value} className="peer sr-only" />
                      <Label htmlFor={item.value} className="flex items-center justify-center font-body cursor-pointer rounded-full px-4 py-2 text-sm transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=unchecked]:hover:bg-muted-foreground/10">
                        {item.icon}{item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 lg:mt-0" ref={memeDisplayRef}>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">3. Your Meme</CardTitle>
              <CardDescription className="font-body">Here's your AI-generated meme. Download and share it!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {isGenerating && <Loader />}
                {!isGenerating && generatedMeme && (
                  <div id="meme-to-download" className="w-full h-full animate-fade-in-zoom">
                     <Image 
                        src={generatedMeme.imageUrl} 
                        alt={generatedMeme.caption}
                        fill
                        className="object-cover"
                        data-ai-hint={generatedMeme.aiHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <p className="font-impact text-white uppercase text-2xl md:text-4xl text-center [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_0_0_#000,-2px_0_0_#000,0_2px_0_#000,0_-2px_0_#000] drop-shadow-lg leading-tight">
                          {generatedMeme.caption}
                        </p>
                      </div>
                  </div>
                )}
                {!isGenerating && !generatedMeme && (
                  <div className="text-center p-8 font-body text-muted-foreground">
                    <p>Your meme will appear here.</p>
                  </div>
                )}
              </div>
              {generatedMeme && !isGenerating && (
                <div className="mt-4 flex flex-col sm:flex-row gap-2 animate-fade-in-zoom">
                   <Button onClick={handleDownload} className="w-full bounce-on-tap">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <ShareButtons text={`Check out this meme I made: "${generatedMeme.caption}"`} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {memeHistory.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">Your Meme Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {memeHistory.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
