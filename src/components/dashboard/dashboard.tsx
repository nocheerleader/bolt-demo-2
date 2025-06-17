import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { subscription, loading, error, isActive, getSubscriptionPlan } = useSubscription();

  const currentPlan = getSubscriptionPlan();

  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusColors = {
      active: 'bg-green-500',
      trialing: 'bg-blue-500',
      past_due: 'bg-yellow-500',
      canceled: 'bg-red-500',
      not_started: 'bg-gray-500',
    };

    return (
      <Badge className={statusColors[subscription.subscription_status] || 'bg-gray-500'}>
        {subscription.subscription_status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Please Sign In</CardTitle>
            <CardDescription className="text-center">
              You need to be signed in to view your dashboard
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    {getStatusBadge()}
                  </div>
                  
                  {currentPlan && (
                    <div>
                      <p><strong>Plan:</strong> {currentPlan.name}</p>
                      <p><strong>Price:</strong> ${currentPlan.price}/month</p>
                    </div>
                  )}
                  
                  {subscription.current_period_start && (
                    <p><strong>Current Period:</strong> {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</p>
                  )}
                  
                  {subscription.payment_method_brand && (
                    <p><strong>Payment Method:</strong> {subscription.payment_method_brand} ending in {subscription.payment_method_last4}</p>
                  )}
                  
                  {subscription.cancel_at_period_end && (
                    <Alert>
                      <AlertDescription>
                        Your subscription will cancel at the end of the current period.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No active subscription</p>
                  <Link to="/pricing">
                    <Button>View Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link to="/pricing">
                  <Button variant="outline">
                    {isActive ? 'Change Plan' : 'Subscribe Now'}
                  </Button>
                </Link>
                
                {isActive && (
                  <Button variant="outline" disabled>
                    Manage Billing (Coming Soon)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}