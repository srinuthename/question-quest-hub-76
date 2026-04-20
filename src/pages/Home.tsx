import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import kiwiMascot from "@/assets/monk-mascot.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthContext";
import {
  Sparkles, PlayCircle, Cpu, Zap, Trophy,
  ArrowRight, Radio, BarChart3, Shield, Clock, Eye, Target, Volume2,
  Users, AlertTriangle, X, ShieldAlert, Lock, FileText
} from "lucide-react";
import { getAppMode, APP_MODE_CONFIGS } from "@/config/appMode";
import { SESSION_EXPIRED_FLAG_KEY } from "@/lib/authInterceptor";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const FEATURES = [
  { icon: Users, title: "Team Quiz", desc: "2–4 team competitive gameplay with lifelines, scoring, and turn management", color: "text-accent" },
  { icon: Eye, title: "Viewer Scoring", desc: "YouTube chat viewers earn points for correct answers — real-time leaderboard", color: "text-primary" },
  { icon: Zap, title: "Powerplay Mode", desc: "Rapid-fire rounds where one team answers all questions against the clock", color: "text-secondary" },
  { icon: Radio, title: "SSE Live Stream", desc: "Server-Sent Events pipeline for real-time answer ingestion from YouTube Live", color: "text-accent" },
  { icon: BarChart3, title: "Live Analytics", desc: "Response distribution charts, hype meters, and participation tracking", color: "text-primary" },
  { icon: Trophy, title: "Podium Finish", desc: "Animated leaderboards with confetti, medals, and celebration effects", color: "text-secondary" },
  { icon: Shield, title: "Session Recovery", desc: "IndexedDB persistence ensures quizzes survive page reloads", color: "text-accent" },
  { icon: Volume2, title: "Sound Engine", desc: "Synthesized sound effects, background music, and dramatic reveals", color: "text-primary" },
];

const ARCHITECTURE_STEPS = [
  { label: "YouTube Live Chat", emoji: "💬", color: "bg-destructive/20 border-destructive/40" },
  { label: "SSE Orchestrator", emoji: "⚡", color: "bg-accent/20 border-accent/40" },
  { label: "React Frontend", emoji: "⚛️", color: "bg-primary/20 border-primary/40" },
  { label: "Live Leaderboards", emoji: "🏆", color: "bg-secondary/20 border-secondary/40" },
];

const preloadAdminRoute = () => import("./Admin");


const Home = React.forwardRef<HTMLDivElement, Record<string, never>>((_props, ref) => {
  const [appMode, setAppMode] = useState(() => getAppMode());
  const [sessionExpired, setSessionExpired] = useState(false);
  const { user, loading, loginWithGoogle } = useAuth();

  const handleSignIn = () => {
    if (loading) return;
    void preloadAdminRoute();
    if (user) {
      window.location.href = "/admin";
      return;
    }
    loginWithGoogle("/admin");
  };

  useEffect(() => {
    const sync = () => setAppMode(getAppMode());
    window.addEventListener("appModeChanged", sync as EventListener);
    return () => window.removeEventListener("appModeChanged", sync as EventListener);
  }, []);

  // Surface a one-shot "session expired" banner when the auth interceptor
  // has just redirected the user back here after a 401/403.
  useEffect(() => {
    try {
      const flag = sessionStorage.getItem(SESSION_EXPIRED_FLAG_KEY);
      if (flag) {
        sessionStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
        setSessionExpired(true);
      }
    } catch {}
    const onExpired = () => setSessionExpired(true);
    window.addEventListener("quizSessionExpired", onExpired);
    return () => window.removeEventListener("quizSessionExpired", onExpired);
  }, []);

  useEffect(() => {
    if (!sessionExpired) return;
    const t = window.setTimeout(() => setSessionExpired(false), 8000);
    return () => window.clearTimeout(t);
  }, [sessionExpired]);

  useEffect(() => {
    let cancelled = false;
    const preload = () => {
      if (!cancelled) void preloadAdminRoute();
    };

    if (typeof window === "undefined") {
      return () => { cancelled = true; };
    }

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const idleId = w.requestIdleCallback(() => preload(), { timeout: 2000 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = w.setTimeout(preload, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const modeConfig = APP_MODE_CONFIGS[appMode];
  const isOffline = appMode === "offline";

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8 relative z-10 bg-gradient-to-b from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-background">
      <div className="mx-auto max-w-6xl space-y-10 md:space-y-16">
        <AnimatePresence>
          {sessionExpired ? (
            <motion.div
              key="session-expired-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="flex-1">
                Your session expired. Please sign in again to continue.
              </span>
              <button
                type="button"
                onClick={() => setSessionExpired(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/25 dark:border-primary/20 bg-card/95 dark:bg-card/70 p-8 md:p-14 shadow-xl dark:shadow-2xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 dark:bg-primary/25 blur-[100px]" aria-hidden="true" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-accent/10 dark:bg-accent/25 blur-[80px]" aria-hidden="true" />
          <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-secondary/8 dark:bg-secondary/15 blur-[60px]" aria-hidden="true" />

          <div className="relative z-10 space-y-6">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.img
                src={kiwiMascot}
                alt="Kiwi Mascot"
                className="h-16 w-16 md:h-24 md:w-24 drop-shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="flex flex-wrap gap-2">
                <Badge className="w-fit bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                  Live Quiz Platform
                </Badge>
                <Badge variant="outline" className="border-muted-foreground/30">
                  {modeConfig.label}
                </Badge>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-7xl font-black tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                YT Live{" "}
              </span>
              <span className="relative inline-block min-w-[3ch]">
                <motion.span
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0.3] }}
                  transition={{ delay: 0.5, duration: 1.5, times: [0, 0.3, 0.7, 1] }}
                >
                  Chat
                </motion.span>
                <motion.span
                  className="absolute left-0 top-1/2 h-[4px] md:h-[6px] bg-destructive rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.4, ease: "easeInOut" }}
                  aria-hidden="true"
                />
              </span>
              <motion.span
                className="inline-block ml-2"
                style={{ fontFamily: "'Comic Sans MS', 'Comic Sans', cursive" }}
                initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                animate={{ opacity: 1, scale: 1.1, rotate: -3 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 180, damping: 12 }}
              >
                <span className="bg-gradient-to-r from-primary via-yellow-500 to-accent bg-clip-text text-transparent">
                  Quiz
                </span>
              </motion.span>
              <motion.span
                className="inline-block ml-2"
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 2.2, type: "spring", stiffness: 300 }}
                aria-hidden="true"
              >
                <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-primary inline" />
              </motion.span>
            </motion.h1>

            <motion.p
              className="max-w-3xl text-base md:text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              A production-ready YouTube-integrated quiz platform with live team gameplay,
              real-time viewer scoring via chat, stream orchestration through SSE events,
              and comprehensive admin controls.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                className="gap-2 font-bold shadow-lg hover:shadow-xl transition-shadow"
                onClick={handleSignIn}
                disabled={loading}
              >
                <Lock className="h-5 w-5" aria-hidden="true" />
                Sign in with YouTube
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section aria-label="Architecture overview">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            How It Works
          </motion.h2>

          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {ARCHITECTURE_STEPS.map((step, i) => (
              <motion.div key={step.label} className="flex items-center" variants={fadeUp} custom={i}>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${step.color} backdrop-blur-sm`}>
                  <span className="text-2xl" aria-hidden="true">{step.emoji}</span>
                  <span className="font-semibold text-sm md:text-base text-foreground">{step.label}</span>
                </div>
                {i < ARCHITECTURE_STEPS.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 hidden md:block" aria-hidden="true" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Grid */}
        <section aria-label="Platform features">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Platform Features
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i + 1}>
                <Card className="group border-border/50 bg-card/85 dark:bg-card/50 hover:bg-card dark:hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/10 h-full">
                  <CardContent className="p-5 space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color}`} aria-hidden="true" />
                    </motion.div>
                    <h3 className="font-bold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How To Run Section */}
        {false && (
          <section>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <Card className="border-primary/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-6 w-6 text-primary" aria-hidden="true" />
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Backend Setup (Orchestrator)</h2>
                  </div>
                  <p className="text-muted-foreground">
                    The orchestrator backend validates YouTube Live streams, runs chat reader workers,
                    and emits SSE events for real-time scoring and activity tracking.
                  </p>
                  <pre className="rounded-xl bg-background/80 border border-border/50 p-4 overflow-x-auto text-sm font-mono text-foreground">
{`cd nodejs-service-orchastrator
npm install
cp .env.example .env    # Set backend-only config like YOUTUBE_API_KEYS, auth-service URL, Mongo/Redis config
npm start               # Starts on http://localhost:50510`}
                  </pre>
                  <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-3">
                    <div className="rounded-lg border border-border/30 bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                        <span className="text-sm font-semibold text-foreground">API Server</span>
                      </div>
                      <code className="text-xs text-muted-foreground">http://localhost:50510</code>
                    </div>
                    <div className="rounded-lg border border-border/30 bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span className="text-sm font-semibold text-foreground">SSE Stream</span>
                      </div>
                      <code className="text-xs text-muted-foreground">http://localhost:50510/sse</code>
                    </div>
                    <div className="rounded-lg border border-border/30 bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Target className="h-4 w-4 text-secondary" aria-hidden="true" />
                        <span className="text-sm font-semibold text-foreground">Viewer Answers</span>
                      </div>
                      <code className="text-xs text-muted-foreground">via YouTube Chat → SSE</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}

        {/* Legal: Disclaimer / Privacy / Terms */}
        <section aria-label="Legal information" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Disclaimer */}
          <Card className="border-destructive/30 bg-card/85 dark:bg-card/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
                <h3 className="font-bold text-foreground">Disclaimer</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This software is provided on an <strong>"as-is"</strong> basis without warranties of any kind,
                express or implied. Live-streaming integrations, scoring, and prize workflows depend on third-party
                services (YouTube, network, hosting) which may be unavailable, delayed, or inaccurate at any time.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Use at your own risk.</strong> ThinMonk EduTech and its contributors will not be responsible
                for any direct, indirect, incidental, or consequential loss — including loss of data, viewers,
                revenue, prizes, or reputation — arising out of the use of this platform.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="border-primary/30 bg-card/85 dark:bg-card/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-bold text-foreground">Privacy Policy</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We respect your privacy. When you sign in with Google / YouTube we receive your{" "}
                <strong>email address and display name</strong> directly from Google. Any other profile
                details (channel title, channel ID, channel thumbnail, profile picture) are obtained from
                YouTube's public APIs using the access you grant during sign-in.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use this information solely to operate the quiz host experience — authenticating your
                session, displaying your identity in the app, and binding quizzes you create to your
                account. We do not share, sell, or rent your personal information to third parties.
                Cookies and local storage are used for session persistence and analytics with your consent.
              </p>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="border-accent/30 bg-card/85 dark:bg-card/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <h3 className="font-bold text-foreground">Terms &amp; Conditions</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By using this software you acknowledge that we capture and store{" "}
                <strong>publicly visible YouTube live chat data</strong> (chat messages, author display
                names, channel IDs, channel thumbnails, and timestamps) for quiz scoring, leaderboards,
                analytics, and product improvement. Using this software constitutes your{" "}
                <strong>full acceptance of these terms</strong>.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We do <strong>not</strong> sell or distribute this data to third parties. Viewers may
                opt out at a later date by contacting the administrator at{" "}
                <a href="mailto:support@thinmonk.com" className="text-primary hover:underline">
                  support@thinmonk.com
                </a>
                . Please note that <strong>full deletion is not guaranteed</strong> — aggregate analytics,
                backups, and derived statistics may persist after individual record removal.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Powered by ThinMonk EduTech
        </footer>
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;
