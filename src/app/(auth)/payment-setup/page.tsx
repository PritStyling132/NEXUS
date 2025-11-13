'use client';

import PaymentForm from '@/components/global/razorPay/payment-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPaymentMethod = async () => {
      try {
        const res = await fetch('/api/user/check-payment-method');
        const data = await res.json();
        
        if (data.hasPaymentMethod) {
          router.push('/group/create');
        }
      } catch (error) {
        console.error('Error checking payment method:', error);
      } finally {
        setChecking(false);
      }
    };

    checkPaymentMethod();
  }, [router]);

  const handleSuccess = () => {
    router.push('/group/create');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2/>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <PaymentForm />
    </div>
  );
}
