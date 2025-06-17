import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { StripeProduct } from '@/stripe-config';
import { supabase } from '@/lib/supabase';

interface PricingCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
  isAuthenticated: boolean;
}

export function PricingCard({ product, isCurrentPlan = false, isAuthenticated }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to continue');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Current Plan
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <div className="text-3xl font-bold">
          ${product.price}
          {product.mode === 'subscription' && <span className="text-lg font-normal">/month</span>}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          className="w-full"
          variant={isCurrentPlan ? 'secondary' : 'default'}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentPlan
            ? 'Current Plan'
            : loading
            ? 'Processing...'
            : product.mode === 'subscription'
            ? 'Subscribe'
            : 'Purchase'
          }
        </Button>
      </CardContent>
    </Card>
  );
}