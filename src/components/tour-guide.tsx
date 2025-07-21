
"use client";

import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

interface TourGuideProps {
  run: boolean;
  setRunTour: (run: boolean) => void;
}

export function TourGuide({ run, setRunTour }: TourGuideProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '#tour-step-1',
      content: 'Welcome to memesgo.info! First, choose your meme source. You can use trending headlines, custom text, AI-generated images, and more!',
      placement: 'bottom',
    },
    {
      target: '#tour-step-2',
      content: 'Next, pick a tone for your meme. Do you want it to be funny, sarcastic, or something else?',
      placement: 'bottom',
    },
    {
      target: '#tour-step-3',
      content: 'Select the perfect font to match your meme\'s style.',
      placement: 'top',
    },
    {
      target: '#tour-step-4',
      content: 'When you\'re ready, hit "Generate Meme" to let the AI work its magic!',
      placement: 'bottom',
    },
    {
      target: '#tour-step-5',
      content: 'Your masterpiece will appear here. You can download it or share it with your friends.',
      placement: 'left',
    },
    {
        target: '#tour-step-6',
        content: 'Your recent creations are saved here in your gallery for easy access.',
        placement: 'top',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: 'hsl(var(--card))',
          backgroundColor: 'hsl(var(--card))',
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--card-foreground))',
          zIndex: 1000,
        },
        buttonClose: {
          display: 'none',
        },
        spotlight: {
            borderRadius: 'var(--radius)'
        }
      }}
    />
  );
}
