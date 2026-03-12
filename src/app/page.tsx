"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeMode, setActiveMode] = useState<"focus" | "break">("focus");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">BurrowTimer</span>
          <Badge variant="secondary">Beta</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Log in</Button>
          <Button size="sm">Download</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-4">
          <Badge className="mb-2">Track every second of your day</Badge>
          <h1 className="text-5xl font-bold tracking-tight">
            Time well spent,<br />time well tracked.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            A 24-hour ring timer for iOS, Android, and Desktop. Built for
            deep work, built for humans.
          </p>
          <div className="flex gap-3 mt-4">
            <Button size="lg">Get BurrowTimer</Button>
            <Button size="lg" variant="outline">View on GitHub</Button>
          </div>
        </section>

        {/* Timer demo card */}
        <section className="flex justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Timer
                <Badge variant={timerRunning ? "default" : "secondary"}>
                  {timerRunning ? "Running" : "Paused"}
                </Badge>
              </CardTitle>
              <CardDescription>25-minute focus session</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {/* Ring visual */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * 0.4}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums">25:00</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{activeMode}</span>
                </div>
              </div>

              <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "focus" | "break")} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="focus" className="flex-1">Focus</TabsTrigger>
                  <TabsTrigger value="break" className="flex-1">Break</TabsTrigger>
                </TabsList>
                <TabsContent value="focus" className="text-center text-sm text-muted-foreground pt-2">
                  Deep work mode. Notifications silenced.
                </TabsContent>
                <TabsContent value="break" className="text-center text-sm text-muted-foreground pt-2">
                  5-minute reset. Step away from the screen.
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                variant={timerRunning ? "outline" : "default"}
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="ghost" onClick={() => setTimerRunning(false)}>Reset</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Team / social proof */}
        <section className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold">Loved by focused people</h2>
          <div className="flex -space-x-3">
            {["AB", "CD", "EF", "GH", "IJ"].map((initials) => (
              <Avatar key={initials} className="border-2 border-background">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">Join thousands tracking their day</p>
        </section>

        {/* Waitlist CTA */}
        <section className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join the waitlist</CardTitle>
              <CardDescription>Get early access when we launch the web app.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger render={<Button variant="ghost" size="sm" />}>
                  Learn more
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About BurrowTimer</DialogTitle>
                    <DialogDescription>
                      BurrowTimer is a 24-hour ring timer that helps you visualize and own your entire day — not just
                      your work blocks. Available for iOS, Android, and Desktop.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button>Notify me</Button>
            </CardFooter>
          </Card>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 BurrowTimer · pomoborrow.com
      </footer>
    </div>
  );
}
