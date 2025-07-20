import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  text?: string;
}

export function Loader({ className, text = "Generating your meme..." }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}>
      <div className="text-6xl animate-spin" style={{ animationDuration: '1.5s' }}>
        😂
      </div>
      <p className="font-headline text-lg text-primary">{text}</p>
    </div>
  );
}
