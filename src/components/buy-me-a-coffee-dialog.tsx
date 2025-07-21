"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"

interface BuyMeACoffeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyMeACoffeeDialog({ open, onOpenChange }: BuyMeACoffeeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Coffee className="text-amber-600" />
            Like this app?
          </AlertDialogTitle>
          <AlertDialogDescription>
            If you're enjoying memesgo.info, consider supporting its development with a small coffee. It helps keep the servers running and new features coming!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Maybe later</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <a href="https://coff.ee/mahas" target="_blank" rel="noopener noreferrer">
              <Button>
                <Coffee className="mr-2 h-4 w-4" />
                Buy me a coffee
              </Button>
            </a>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
