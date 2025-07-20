"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewsHeadline, Meme, MemeTone, MemeInputType } from '@/lib/types';
import { generateMemeCaption } from '@/ai/flows/generate-meme-caption';
import { generateImageFromText, generateHashtags } from '@/ai/flows/meme-tools';
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
import { Download, Laugh, RefreshCw, Sparkles, MessageCircleHeart, Image as ImageIcon, Link, Upload, Newspaper, Wand2, FileInput, Bot, Tags } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Textarea } from './ui/textarea';

const WavyText = ({ text }: { text: string }) => (
  <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tighter">
    {text.split('').map((char, index) => (
      <span key={index} className="inline-block" style={{ animation: 'bounce 1s ease-in-out', animationDelay: `${index * 50}ms`, animationIterationCount: 1 }}>
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
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [generatedHashtags, setGeneratedHashtags] = useState<string | null>(null);
  const [inputType, setInputType] = useState<MemeInputType>('headline');
  const [imageUrl, setImageUrl] = useState('');
  const [customHeadline, setCustomHeadline] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  

  const { toast } = useToast();
  const memeDisplayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleGenerateMeme = useCallback(async (options?: { surprise?: boolean }) => {
    setIsGenerating(true);
    setGeneratedMeme(null);
    setGeneratedHashtags(null);

    let context: string | null = null;
    let baseImageUrl: string | null = null;
    let headlineText: string = "User-provided content";
    let aiHint = 'custom image';
    let currentTone = tone;

    try {
        if (options?.surprise) {
            const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
            context = randomHeadline.title;
            headlineText = randomHeadline.title;
            const template = getRandomMemeTemplate();
            baseImageUrl = template.url;
            aiHint = template.hint;
            const tones: MemeTone[] = ['funny', 'sarcastic', 'inspirational', 'whimsical'];
            currentTone = tones[Math.floor(Math.random() * tones.length)];
            setTone(currentTone);
        } else if (inputType === 'headline') {
            if (!selectedHeadline) throw new Error('Please select a headline first.');
            context = selectedHeadline.title;
            headlineText = selectedHeadline.title;
            const template = getRandomMemeTemplate();
            baseImageUrl = template.url;
            aiHint = template.hint;
        } else if (inputType === 'custom') {
            if (!customHeadline) throw new Error('Please enter a custom headline.');
            context = customHeadline;
            headlineText = customHeadline;
            const template = getRandomMemeTemplate();
            baseImageUrl = template.url;
            aiHint = template.hint;
        } else if (inputType === 'ai-image') {
            if (!aiImagePrompt) throw new Error('Please enter a prompt for the AI image.');
            context = aiImagePrompt;
            headlineText = `AI Image: ${aiImagePrompt}`;
            aiHint = aiImagePrompt;
            const {imageUrl} = await generateImageFromText({prompt: aiImagePrompt});
            if(!imageUrl) throw new Error('The AI failed to generate an image. Please try again.');
            baseImageUrl = imageUrl;
        } else if (inputType === 'url') {
            if (!imageUrl || !imageUrl.startsWith('http')) throw new Error('Please enter a valid image URL.');
            context = "an image provided by URL";
            baseImageUrl = imageUrl;
        } else if (inputType === 'upload') {
            if(!localFile || !localFilePreview) throw new Error('Please upload an image file.');
            context = "an uploaded image";
            baseImageUrl = localFilePreview;
        }

        if (!context || !baseImageUrl) return;

        const result = await generateMemeCaption({ context, tone: currentTone });
        const newMeme: Meme = {
            id: new Date().toISOString(),
            imageUrl: baseImageUrl,
            caption: result.caption,
            headline: headlineText,
            createdAt: new Date().toISOString(),
            aiHint,
        };
        setGeneratedMeme(newMeme);

        const updatedHistory = [newMeme, ...memeHistory].slice(0, 12); // Keep last 12
        setMemeHistory(updatedHistory);
        localStorage.setItem('memeHistory', JSON.stringify(updatedHistory));
        
        setTimeout(() => {
            memeDisplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'An unexpected error occurred.' });
    } finally {
        setIsGenerating(false);
    }
  }, [selectedHeadline, tone, memeHistory, toast, inputType, imageUrl, localFile, localFilePreview, customHeadline, headlines, aiImagePrompt]);
  
  const handleGenerateHashtags = useCallback(async () => {
    if (!generatedMeme) return;
    setIsGeneratingHashtags(true);
    try {
      const result = await generateHashtags({
        caption: generatedMeme.caption,
        context: generatedMeme.headline,
      });
      setGeneratedHashtags(result.hashtags.join(' '));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hashtag Error', description: 'Could not generate hashtags.' });
    } finally {
      setIsGeneratingHashtags(false);
    }
  }, [generatedMeme, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      link.download = `memer-ai-${Date.now()}.png`;
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
      <header className="text-center mb-8 md:mb-12 relative">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <WavyText text="Memer AI" />
        <p className="font-body text-lg text-muted-foreground mt-2">Generate memes with the power of AI.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">1. Choose your source</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={inputType} onValueChange={(value) => setInputType(value as MemeInputType)} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="headline"><Newspaper className="mr-2 h-4 w-4" />Headline</TabsTrigger>
                  <TabsTrigger value="custom"><FileInput className="mr-2 h-4 w-4" />Custom</TabsTrigger>
                  <TabsTrigger value="ai-image"><Bot className="mr-2 h-4 w-4" />AI Image</TabsTrigger>
                  <TabsTrigger value="url"><Link className="mr-2 h-4 w-4" />URL</TabsTrigger>
                  <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="headline" className="mt-4">
                    <Card className="border-dashed">
                        <CardHeader>
                           <CardTitle className="flex items-center"><Newspaper className="mr-2"/>Trending Headlines</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isLoading && <div className="text-center p-8 font-body">Loading headlines...</div>}
                          {!isLoading && headlines.length > 0 && (
                            <Carousel
                              opts={{ align: 'start' }}
                              setApi={(api) => {
                                if(api) api.on('select', () => setSelectedHeadline(headlines[api.selectedScrollSnap()]));
                              }}
                              className="w-full"
                            >
                              <CarouselContent>
                                {headlines.map((headline, index) => (
                                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-full">
                                    <div className="p-1">
                                      <Card className={`h-40 flex flex-col justify-center p-6 border-2 transition-colors cursor-pointer ${selectedHeadline?.title === headline.title ? 'border-primary shadow-lg' : 'hover:border-primary/50'}`}
                                       onClick={() => setSelectedHeadline(headline)}>
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
                          <Button onClick={loadHeadlines} className="mt-4 w-full" variant="secondary" disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Fetching News...' : 'Refresh News'}
                          </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="custom" className="mt-4">
                   <div className="space-y-2">
                    <Label htmlFor="customHeadline">Custom Headline</Label>
                    <Textarea id="customHeadline" placeholder="e.g., Man discovers his cat is a wanted jewel thief" value={customHeadline} onChange={e => setCustomHeadline(e.target.value)} />
                    <p className="text-xs text-muted-foreground">The AI will generate a meme from a random template based on your text.</p>
                  </div>
                </TabsContent>
                 <TabsContent value="ai-image" className="mt-4">
                   <div className="space-y-2">
                    <Label htmlFor="aiImagePrompt">AI Image Prompt</Label>
                    <Textarea id="aiImagePrompt" placeholder="e.g., A photo of a cat programmer wearing glasses, working on a laptop" value={aiImagePrompt} onChange={e => setAiImagePrompt(e.target.value)} />
                    <p className="text-xs text-muted-foreground">The AI will generate a unique image to use as the meme background based on your prompt.</p>
                  </div>
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" type="url" placeholder="https://example.com/image.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    {imageUrl && <div className="p-2 border rounded-md"><Image src={imageUrl} alt="URL Preview" width={100} height={100} className="rounded-md object-cover" /></div>}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="localFile">Upload Image</Label>
                    <Input id="localFile" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="cursor-pointer" />
                    {localFilePreview && <div className="p-2 border rounded-md"><Image src={localFilePreview} alt="File Preview" width={100} height={100} className="rounded-md object-cover" /></div>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">2. Choose a tone</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={tone} onValueChange={(value: string) => setTone(value as MemeTone)} className="flex justify-center flex-wrap gap-2">
                <div className="flex space-x-2 rounded-full bg-muted p-1">
                  {[
                    { value: 'funny', label: 'Funny', icon: <Laugh className="w-4 h-4 mr-2"/> },
                    { value: 'sarcastic', label: 'Sarcastic', icon: <MessageCircleHeart className="w-4 h-4 mr-2"/> },
                    { value: 'inspirational', label: 'Inspirational', icon: <Sparkles className="w-4 h-4 mr-2"/> },
                    { value: 'whimsical', label: 'Whimsical', icon: <Wand2 className="w-4 h-4 mr-2"/> }
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
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => handleGenerateMeme()} size="lg" className="w-full font-bold text-lg animate-pulsating-glow" disabled={isGenerating}>
                <Sparkles className="mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Meme'}
            </Button>
            <Button onClick={() => handleGenerateMeme({ surprise: true })} size="lg" variant="secondary" className="w-full font-bold text-lg" disabled={isGenerating || isLoading}>
                <Wand2 className="mr-2" />
                Surprise Me!
            </Button>
          </div>
        </div>
        <div className="mt-8 lg:mt-0" ref={memeDisplayRef}>
          <Card className="sticky top-8 shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">3. Your Meme</CardTitle>
              <CardDescription className="font-body">Here's your AI-generated meme. Download and share it!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden border">
                {isGenerating && <Loader text={inputType === 'ai-image' ? 'Generating AI Image...' : 'Generating your meme...'} />}
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
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"/>
                    <p>Your meme will appear here.</p>
                  </div>
                )}
              </div>
              {generatedMeme && !isGenerating && (
                <div className="mt-4 flex flex-col gap-2 animate-fade-in-zoom">
                    <div className="flex flex-col sm:flex-row gap-2">
                       <Button onClick={handleDownload} className="w-full bounce-on-tap">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <ShareButtons text={`Check out this meme I made: "${generatedMeme.caption}"`} />
                   </div>
                   <Button onClick={handleGenerateHashtags} className="w-full" variant="outline" disabled={isGeneratingHashtags}>
                        <Tags className={`mr-2 h-4 w-4 ${isGeneratingHashtags ? 'animate-spin' : ''}`} />
                        {isGeneratingHashtags ? 'Generating...' : 'Generate Hashtags'}
                   </Button>
                   {generatedHashtags && (
                      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground font-mono break-words animate-fade-in-zoom cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(generatedHashtags)
                        toast({ title: 'Hashtags Copied!' })
                      }}>
                        {generatedHashtags}
                      </div>
                   )}
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

      <footer className="text-center mt-16 py-6 border-t">
        <p className="text-muted-foreground font-body">Made with vibes by Mahas ❤️</p>
      </footer>
    </div>
  );
}

    