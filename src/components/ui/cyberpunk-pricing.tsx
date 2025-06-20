"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Zap, Shield, Cpu, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { stripeProducts, StripeProduct } from "@/stripe-config";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";

interface MatrixRainProps {
  fontSize?: number;
  color?: string;
  characters?: string;
  fadeOpacity?: number;
  speed?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({
  fontSize = 16,
  color = "#00ff41",
  characters = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
  fadeOpacity = 0.05,
  speed = 0.8
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = characters.split('');
    const drops: number[] = [];
    const columnCount = Math.floor(canvas.width / fontSize);

    for (let i = 0; i < columnCount; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }
    };

    const interval = setInterval(draw, 33 / speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fontSize, color, characters, fadeOpacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

interface CyberPricingTier {
  product: StripeProduct;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  popular?: boolean;
  glowColor: string;
  borderColor: string;
}

interface CyberPunkPricingProps {
  title?: string;
  subtitle?: string;
}

const CyberPunkPricing: React.FC<CyberPunkPricingProps> = ({
  title = "PLANS AND PRICING",
  subtitle = "Simple and transparent pricing"
}) => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading, getSubscriptionPlan } = useSubscription();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  // Map Stripe products to cyberpunk tiers
  const tiers: CyberPricingTier[] = [
    {
      product: stripeProducts.find(p => p.price === 29.00)!,
      name: "BASIC",
      icon: <Zap className="w-6 h-6" />,
      description: "Entry-level neural interface for street runners",
      features: [
        "Basic Neural Link",
        "Standard Encryption",
        "5GB Data Storage",
        "Community Support",
        "Basic Firewall"
      ],
      glowColor: "cyan",
      borderColor: "border-cyan-500"
    },
    {
      product: stripeProducts.find(p => p.price === 89.00)!,
      name: "ELITE",
      icon: <Shield className="w-6 h-6" />,
      description: "Advanced cybernetic suite for professional netrunners",
      features: [
        "Advanced Neural Interface",
        "Military-Grade Encryption",
        "50GB Secure Storage",
        "Priority Support Channel",
        "Advanced ICE Protection",
        "Stealth Mode Access"
      ],
      popular: true,
      glowColor: "emerald",
      borderColor: "border-emerald-500"
    },
    {
      product: stripeProducts.find(p => p.price === 199.00)!,
      name: "ENTERPRISE",
      icon: <Cpu className="w-6 h-6" />,
      description: "Corporate-grade neural enhancement for data fortress infiltration",
      features: [
        "Quantum Neural Matrix",
        "Quantum Encryption",
        "Unlimited Data Vault",
        "24/7 Elite Support",
        "Corporate ICE Bypass",
        "Reality Augmentation",
        "Time Dilation Access"
      ],
      glowColor: "purple",
      borderColor: "border-purple-500"
    }
  ];

  const handleSubscribe = async (tier: CyberPricingTier) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const productId = tier.product.id;
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    setErrors(prev => ({ ...prev, [productId]: '' }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setErrors(prev => ({ ...prev, [productId]: 'Please sign in to continue' }));
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: tier.product.priceId,
          mode: tier.product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrors(prev => ({ 
        ...prev, 
        [productId]: err instanceof Error ? err.message : 'An unexpected error occurred' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  const isCurrentPlan = (tier: CyberPricingTier) => {
    return subscription?.price_id === tier.product.priceId;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      y: 50, 
      opacity: 0,
      rotateX: -15
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-black text-green-400 overflow-hidden">
      <MatrixRain />
      
      <motion.div
        ref={containerRef}
        className="relative z-10 container mx-auto px-4 py-20"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={cardVariants}
        >
          <Badge 
            className="mb-4 bg-green-500/20 text-green-400 border-green-500 font-mono text-xs tracking-wider"
          >
            SYSTEM UPGRADE AVAILABLE
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-mono tracking-wider bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-green-300/80 font-mono max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => {
            const isLoading = loadingStates[tier.product.id];
            const error = errors[tier.product.id];
            const isCurrent = isCurrentPlan(tier);

            return (
              <motion.div
                key={tier.product.id}
                variants={cardVariants}
                className="relative group"
              >
                <Card className={cn(
                  "relative h-full bg-black/80 backdrop-blur-sm border-2 transition-all duration-500",
                  tier.borderColor,
                  "hover:shadow-2xl hover:scale-105",
                  tier.popular && "ring-2 ring-emerald-500/50",
                  isCurrent && "ring-2 ring-yellow-500/50"
                )}>
                  
                  {/* Glow Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl",
                    tier.glowColor === "cyan" && "bg-cyan-500",
                    tier.glowColor === "emerald" && "bg-emerald-500", 
                    tier.glowColor === "purple" && "bg-purple-500"
                  )}></div>

                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-emerald-500 text-black font-mono text-xs px-3 py-1 animate-pulse">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 z-20">
                      <Badge className="bg-yellow-500 text-black font-mono text-xs px-3 py-1">
                        CURRENT PLAN
                      </Badge>
                    </div>
                  )}

                  <div className="relative z-10 p-8">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-2 rounded-lg border",
                        tier.borderColor,
                        tier.glowColor === "cyan" && "bg-cyan-500/10",
                        tier.glowColor === "emerald" && "bg-emerald-500/10",
                        tier.glowColor === "purple" && "bg-purple-500/10"
                      )}>
                        {tier.icon}
                      </div>
                      <h3 className="text-xl font-bold font-mono text-white">
                        {tier.name}
                      </h3>
                    </div>

                    <p className="text-sm text-green-300/70 mb-6 font-mono">
                      {tier.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white font-mono">
                          ${tier.product.price}
                        </span>
                      </div>
                      <span className="text-sm text-green-300/60 font-mono">
                        /month • Neural subscription
                      </span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center",
                            tier.borderColor
                          )}>
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-sm text-green-300 font-mono">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription className="font-mono text-xs">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSubscribe(tier)}
                      disabled={isLoading || isCurrent || subscriptionLoading}
                      className={cn(
                        "w-full h-12 font-mono text-sm font-bold transition-all duration-300 relative overflow-hidden group/btn",
                        isCurrent
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-not-allowed"
                          : tier.popular 
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500" 
                          : "bg-transparent border-2 text-green-400 hover:bg-green-500/10",
                        !isCurrent && tier.borderColor
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isCurrent 
                          ? "CURRENT PLAN" 
                          : isLoading 
                          ? "PROCESSING..." 
                          : "START FREE TRIAL"
                        }
                      </span>
                      {!isCurrent && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      )}
                    </Button>
                  </div>

                  {/* Corner Accents */}
                  <div className={cn(
                    "absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2",
                    tier.borderColor
                  )}></div>
                  <div className={cn(
                    "absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2",
                    tier.borderColor
                  )}></div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16"
          variants={cardVariants}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent mb-6"></div>
          <p className="text-sm text-green-300/60 font-mono">
            All packages include quantum-encrypted data transmission and neural firewall protection
          </p>
          {!user && (
            <p className="text-xs text-green-300/40 font-mono mt-2">
              Sign in required to access neural enhancement protocols
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CyberPunkPricing;