import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';

export function SuccessPage() {
  const { user } = useAuth();
  const { subscription, loading, getSubscriptionPlan } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Give some time for the webhook to process
    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const currentPlan = getSubscriptionPlan();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Please Sign In</CardTitle>
            <CardDescription className="text-center">
              You need to be signed in to view this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we confirm your payment...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Thank you for your purchase. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentPlan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">Current Plan</h3>
              <p className="text-gray-600">{currentPlan.name}</p>
              <p className="text-sm text-gray-500">${currentPlan.price}/month</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Link to="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="w-full">
                View All Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}