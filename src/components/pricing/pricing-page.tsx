import { PricingCard } from './pricing-card';
import { stripeProducts } from '@/stripe-config';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Loader2 } from 'lucide-react';

export function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stripeProducts.map((product) => (
            <PricingCard
              key={product.id}
              product={product}
              isCurrentPlan={subscription?.price_id === product.priceId}
              isAuthenticated={!!user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}