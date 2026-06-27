declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill?: { email?: string; name?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    handler: (response: { error: { description: string } }) => void,
  ) => void;
};

export type { RazorpayOptions, RazorpaySuccessResponse };

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: {
  key: string;
  subscriptionId: string;
  userName?: string;
  userEmail?: string;
  onSuccess: () => void;
  onDismiss?: () => void;
}): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded) return false;

  const rzp = new window.Razorpay({
    key: options.key,
    subscription_id: options.subscriptionId,
    name: 'Codentra',
    description: 'Monthly Membership — ₹49/month',
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    theme: { color: '#7c3aed' },
    handler: () => options.onSuccess(),
    modal: { ondismiss: options.onDismiss },
  });

  rzp.on('payment.failed', () => options.onDismiss?.());
  rzp.open();
  return true;
}
