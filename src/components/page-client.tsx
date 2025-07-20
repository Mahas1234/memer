

"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewsHeadline, Meme, MemeTone, MemeInputType, MemeStory } from '@/lib/types';
import { generateMemeCaption } from '@/ai/flows/generate-meme-caption';
import { generateImageFromText, generateHashtags } from '@/ai/flows/meme-tools';
import { removeImageBackground } from '@/ai/flows/remove-background';
import { generateMemeStory } from '@/ai/flows/generate-story';
import { generateMoodMeme } from '@/ai/flows/mood-meme';
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
import { Download, Laugh, RefreshCw, Sparkles, MessageCircleHeart, Image as ImageIcon, Link, Upload, Newspaper, Wand2, FileInput, Bot, Tags, Camera, Smile, Eraser, Film, Type, PencilRuler } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const WavyText = ({ text }: { text: string }) => (
  <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tighter">
    {text.split('').map((char, index) => (
      <span key={index} className="inline-block" style={{ animation: 'bounce 1s ease-in-out', animationDelay: `${index * 50}ms`, animationIterationCount: 1 }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </h1>
);

type MemeFont = 'Impact' | 'Anton' | 'Lobster' | 'Comic Neue';
const fontOptions: { value: MemeFont, label: string, className: string, style: string }[] = [
    { value: 'Impact', label: 'Impact', className: 'font-impact', style: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' },
    { value: 'Anton', label: 'Anton', className: 'font-anton', style: '"Anton", sans-serif' },
    { value: 'Lobster', label: 'Lobster', className: 'font-lobster', style: '"Lobster", cursive' },
    { value: 'Comic Neue', label: 'Comic Neue', className: 'font-comic-neue', style: '"Comic Neue", cursive' },
];

const toneOptions: { value: MemeTone, label: string, icon: string }[] = [
  { value: 'funny', label: 'Funny', icon: '😂' },
  { value: 'sarcastic', label: 'Sarcastic', icon: '😏' },
  { value: 'inspirational', label: 'Inspirational', icon: '✨' },
  { value: 'whimsical', label: 'Whimsical', icon: '🤪' }
];

const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
};

export function PageClient() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);
  const [tone, setTone] = useState<MemeTone>('funny');
  const [generatedMeme, setGeneratedMeme] = useState<Meme | null>(null);
  const [generatedStory, setGeneratedStory] = useState<MemeStory | null>(null);
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
  const [storyPrompt, setStoryPrompt] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [font, setFont] = useState<MemeFont>('Impact');

  const { toast } = useToast();
  const memeDisplayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (inputType === 'mood') {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this app.',
            });
          }
        };
        getCameraPermission();
    } else {
        // Stop camera stream when not in mood tab
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [inputType, toast]);

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
      // Logic for loading user-specific memes will go here
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
    setGeneratedStory(null);
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
        } else if (inputType === 'remove-bg') {
            if(!localFile || !localFilePreview) throw new Error('Please upload an image file to remove the background.');
            headlineText = "Background Removed";
            const { imageWithBackgroundRemovedDataUri } = await removeImageBackground({imageDataUri: localFilePreview});
            context = "image with background removed";
            baseImageUrl = imageWithBackgroundRemovedDataUri;
        } else if (inputType === 'story') {
            if (!storyPrompt) throw new Error('Please enter a story prompt.');
            headlineText = `Story: ${storyPrompt}`;
            const storyResult = await generateMemeStory({prompt: storyPrompt});
            
            // For now, we will generate images for the story sequentially.
            const storyPanels = [];
            for (const panel of storyResult.panels) {
                const { imageUrl } = await generateImageFromText({prompt: panel.imagePrompt});
                storyPanels.push({ ...panel, imageUrl });
            }

            const newStory : MemeStory = {
                id: new Date().toISOString(),
                title: storyResult.title,
                panels: storyPanels,
                createdAt: new Date().toISOString(),
            };
            setGeneratedStory(newStory);
            setIsGenerating(false);
            return;
        } else if (inputType === 'mood') {
            if (!hasCameraPermission || !videoRef.current) throw new Error('Camera not available or permission denied.');
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const photoDataUri = canvas.toDataURL('image/jpeg');
            
            const moodResult = await generateMoodMeme({photoDataUri});
            const { imageUrl } = await generateImageFromText({prompt: moodResult.imagePrompt});

            context = `Mood: ${moodResult.mood}`;
            headlineText = `User looking ${moodResult.mood}`;
            baseImageUrl = imageUrl;
            aiHint = moodResult.imagePrompt;

            const newMeme: Meme = {
                id: new Date().toISOString(),
                imageUrl: baseImageUrl,
                caption: moodResult.caption,
                headline: headlineText,
                createdAt: new Date().toISOString(),
                aiHint,
                font: font,
            };
            setGeneratedMeme(newMeme);

            const updatedHistory = [newMeme, ...memeHistory].slice(0, 12);
            setMemeHistory(updatedHistory);
            localStorage.setItem('memeHistory', JSON.stringify(updatedHistory));
            setIsGenerating(false);
            return;
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
            font: font,
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
  }, [selectedHeadline, tone, memeHistory, toast, inputType, imageUrl, localFile, localFilePreview, customHeadline, headlines, aiImagePrompt, storyPrompt, hasCameraPermission, font]);
  
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
    
    const selectedFont = fontOptions.find(f => f.value === font) || fontOptions[0];

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
      ctx.font = `bold ${fontSize}px ${selectedFont.style}`;
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
      link.download = `memers-dev-${Date.now()}.png`;
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
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <ThemeToggle />
        </div>
        <WavyText text="memers.dev" />
        <p className="font-body text-lg text-muted-foreground mt-2">The Internet's Unhinged Meme Factory. Now Open.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><PencilRuler />1. Choose your source</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={inputType} onValueChange={(value) => {
                  const newType = value as MemeInputType;
                  setInputType(newType);
                  if (['remove-bg', 'story', 'mood'].includes(newType)) {
                      setInputType('headline');
                       toast({ title: 'Coming Soon!', description: 'This feature is under construction.' });
                  }
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="headline" className="text-xs"><Newspaper className="mr-1 h-4 w-4" />Headline</TabsTrigger>
                  <TabsTrigger value="custom" className="text-xs"><FileInput className="mr-1 h-4 w-4" />Custom</TabsTrigger>
                  <TabsTrigger value="ai-image" className="text-xs"><Bot className="mr-1 h-4 w-4" />AI Image</TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs"><Upload className="mr-1 h-4 w-4" />Upload</TabsTrigger>
                  <TabsTrigger value="url" className="text-xs"><Link className="mr-1 h-4 w-4" />URL</TabsTrigger>
                </TabsList>
                {/* 
                 <TabsList className="grid w-full grid-cols-3 mt-2">
                  <TabsTrigger value="remove-bg" className="text-xs"><Eraser className="mr-1 h-4 w-4" />Remove BG</TabsTrigger>
                  <TabsTrigger value="story" className="text-xs"><Film className="mr-1 h-4 w-4" />Story</TabsTrigger>
                  <TabsTrigger value="mood" className="text-xs"><Smile className="mr-1 h-4 w-4" />Mood</TabsTrigger>
                </TabsList>
                */}
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
                              setApi={(api: any) => {
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
                    {imageUrl && isImageUrl(imageUrl) && <div className="p-2 border rounded-md"><Image src={imageUrl} alt="URL Preview" width={100} height={100} className="rounded-md object-cover" data-ai-hint="custom image"/></div>}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="localFile">Upload Image</Label>
                    <Input id="localFile" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="cursor-pointer" />
                    {localFilePreview && <div className="p-2 border rounded-md"><Image src={localFilePreview} alt="File Preview" width={100} height={100} className="rounded-md object-cover" data-ai-hint="custom upload"/></div>}
                  </div>
                </TabsContent>
                 <TabsContent value="remove-bg" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="localFileBg">Upload Image for Background Removal</Label>
                    <Input id="localFileBg" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                    {localFilePreview && <div className="p-2 border rounded-md"><Image src={localFilePreview} alt="File Preview" width={100} height={100} className="rounded-md object-cover" data-ai-hint="custom upload"/></div>}
                     <p className="text-xs text-muted-foreground">Upload an image and the AI will attempt to remove the background.</p>
                  </div>
                </TabsContent>
                <TabsContent value="story" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="storyPrompt">Meme Story Prompt</Label>
                    <Textarea id="storyPrompt" placeholder="e.g., A dog trying to order a pizza." value={storyPrompt} onChange={e => setStoryPrompt(e.target.value)} />
                    <p className="text-xs text-muted-foreground">The AI will generate a 3-panel meme story with images and captions.</p>
                  </div>
                </TabsContent>
                <TabsContent value="mood" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground">Let the AI detect your mood and create a meme just for you!</p>
                    <div className="relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                       <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                       {hasCameraPermission === false && (
                         <Alert variant="destructive" className="m-4">
                            <Camera className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use this feature.
                            </AlertDescription>
                         </Alert>
                       )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles />2. Choose a tone</CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel 
                  opts={{
                    align: 'center',
                    loop: true,
                  }}
                  setApi={(api: any) => {
                    if (api) {
                      api.on('select', () => {
                        const selectedTone = toneOptions[api.selectedScrollSnap()].value;
                        setTone(selectedTone);
                      });
                    }
                  }}
                  className="w-full max-w-xs mx-auto"
                >
                    <CarouselContent>
                      {toneOptions.map(({ value, label, icon }) => (
                        <CarouselItem key={value} className="basis-1/2">
                          <div className="p-1">
                            <Card 
                              className={`cursor-pointer transition-all ${tone === value ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted/50 hover:bg-muted'}`}
                              onClick={() => setTone(value)}
                            >
                              <CardContent className="flex flex-col items-center justify-center gap-2 p-6 aspect-square">
                                <span className="text-4xl">{icon}</span>
                                <p className="font-bold">{label}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Type />3. Select a Font</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={font} onValueChange={(value) => setFont(value as MemeFont)}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                                <SelectValue placeholder="Select a font" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {fontOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className={option.className}>{option.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
          </div>
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
              <CardTitle className="font-headline text-2xl">Your Creation</CardTitle>
              <CardDescription className="font-body">Here's your AI-generated masterpiece. Download and share it!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden border">
                {isGenerating && <Loader text={
                    inputType === 'ai-image' ? 'Generating AI Image...' : 
                    inputType === 'story' ? 'Generating meme story...' :
                    inputType === 'mood' ? 'Analyzing mood & generating...' :
                    inputType === 'remove-bg' ? 'Removing background...' :
                    'Generating your meme...'
                } />}

                {!isGenerating && generatedStory && (
                   <Carousel className="w-full h-full">
                        <CarouselContent>
                            {generatedStory.panels.map((panel, index) => (
                                <CarouselItem key={index} className="w-full h-full relative">
                                    <Image 
                                        src={panel.imageUrl}
                                        alt={panel.caption}
                                        fill
                                        className="object-contain"
                                        data-ai-hint="story panel"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                                        <p className="font-impact text-white uppercase text-xl md:text-2xl text-center [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_0_0_#000,-2px_0_0_#000,0_2px_0_#000,0_-2px_0_#000] drop-shadow-lg leading-tight">
                                            {panel.caption}
                                        </p>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                   </Carousel>
                )}

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
                        <p className={`${fontOptions.find(f => f.value === generatedMeme.font)?.className || 'font-impact'} text-white uppercase text-2xl md:text-4xl text-center [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_0_0_#000,-2px_0_0_#000,0_2px_0_#000,0_-2px_0_#000] drop-shadow-lg leading-tight`}>
                          {generatedMeme.caption}
                        </p>
                      </div>
                  </div>
                )}
                {!isGenerating && !generatedMeme && !generatedStory && (
                  <div className="text-center p-8 font-body text-muted-foreground">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"/>
                    <p>Your creation will appear here.</p>
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

    