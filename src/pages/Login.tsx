import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import CosmicBackground from "@/components/CosmicBackground"; // ✅ shared background
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Eye, EyeOff, Sparkles, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "Please agree to the Terms & Privacy Policy to continue" }),
  }),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loginDemo } = useAppStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { agree: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const success = await login(data.email, data.password);
      if (success) {
        toast({ title: "Welcome to KarmAnk ✨", description: "Your cosmic journey begins now." });
        navigate("/welcome", { replace: true });
      } else {
        toast({
          title: "Authentication Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setValue("email", "demo@karmank.com");
    setValue("password", "demo123456");
    setValue("agree", true);
    loginDemo();
    navigate("/welcome", { replace: true });
  };

  const agreed = watch("agree");

  return (
    <CosmicBackground density={180}>
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="relative"
              >
                <h1 className="text-6xl lg:text-8xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent leading-tight tracking-tight">
                  KarmAnk
                </h1>
                <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4">
                  <Crown className="h-8 w-8 lg:h-12 lg:w-12 text-auric-gold animate-pulse" />
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl lg:text-2xl font-light italic text-gradient"
              >
                Cosmic Numerology, Reimagined.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="space-y-6"
            >
              {/* Paragraph */}
              <p className="text-lg lg:text-xl font-light leading-relaxed text-gradient">
                Unlock the mysteries of the universe through authentic Vedic numerology, sacred geometry, and cosmic wisdom.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm lg:text-base">
                {[
                  "Vedic Compatibility Analysis",
                  "Sacred Name Vibrations",
                  "Krishna Gita Wisdom",
                  "Cosmic Kundli Insights",
                ].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                    className="flex items-center gap-3 group"
                  >
                    <Sparkles className="h-5 w-5 text-auric-gold group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gradient group-hover:opacity-90 transition-opacity">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="text-xs text-muted-foreground"
            >
              © {new Date().getFullYear()} KarmAnk - Sacred Technology
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <GlassCard variant="elevated" size="lg" className="w-full max-w-md">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="text-center space-y-4">
                  <motion.div className="flex justify-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <div className="p-4 rounded-full bg-gradient-auric shadow-lg">
                      <Crown className="h-8 w-8 text-cosmic-blue" />
                    </div>
                  </motion.div>

                  <div>
                    <h2 className="text-3xl font-serif font-semibold text-foreground mb-2">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter your cosmic credentials to continue your journey
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.cosmic.email@domain.com"
                      className="bg-background/30 border-primary/30 focus:border-auric-gold focus:ring-auric-gold/20 text-foreground placeholder:text-muted-foreground h-12"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && <p id="email-error" className="text-sm text-destructive mt-1" role="alert">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="bg-background/30 border-primary/30 focus:border-auric-gold focus:ring-auric-gold/20 text-foreground placeholder:text-muted-foreground h-12 pr-12"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-muted-foreground hover:text-auric-gold"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p id="password-error" className="text-sm text-destructive mt-1" role="alert">{errors.password.message}</p>}
                  </div>

                  {/* Agree */}
                  <div className="flex items-start gap-3">
                    <input id="agree" type="checkbox" className="mt-1 h-4 w-4 accent-auric-gold cursor-pointer" {...register("agree")} />
                    <Label htmlFor="agree" className="text-sm text-muted-foreground">
                      By continuing, you agree to our{" "}
                      <Link to="/terms" className="text-auric-gold hover:underline">Terms</Link>,{" "}
                      <Link to="/privacy" className="text-auric-gold hover:underline">Privacy Policy</Link>,{" "}
                      <Link to="/refund" className="text-auric-gold hover:underline">Refund &amp; Cancellation</Link> and{" "}
                      <Link to="/disclaimer" className="text-auric-gold hover:underline">Disclaimer</Link>.
                    </Label>
                  </div>
                  {errors.agree && <p className="text-sm text-destructive" role="alert">{errors.agree.message}</p>}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-auric hover:shadow-lg hover:shadow-auric-gold/30 text-cosmic-blue font-semibold hover-sweep text-lg relative overflow-hidden"
                    disabled={isLoading || !agreed}
                    id="login-btn"
                  >
                    <motion.span animate={isLoading ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}>
                      {isLoading ? "Connecting to Cosmos..." : "Enter the Cosmos"}
                    </motion.span>
                  </Button>
                </form>

                {/* Demo login */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-primary/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-card px-4 text-muted-foreground">Demo Access</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDemoLogin}
                    className="w-full h-11 border-primary/30 hover:bg-primary/10 hover:border-auric-gold/50 text-foreground transition-all duration-200"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Demo Account
                  </Button>
                </div>

                {/* Footer links */}
                <div className="pt-2 text-center space-y-2 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
                    <Link to="/terms" className="hover:text-auric-gold">Terms</Link>
                    <span>•</span>
                    <Link to="/privacy" className="hover:text-auric-gold">Privacy</Link>
                    <span>•</span>
                    <Link to="/refund" className="hover:text-auric-gold">Refund</Link>
                    <span>•</span>
                    <Link to="/disclaimer" className="hover:text-auric-gold">Disclaimer</Link>
                  </div>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </CosmicBackground>
  );
}
