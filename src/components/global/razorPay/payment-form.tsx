// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useToast } from '@/components/ui/use-toast';
// import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// interface PaymentFormProps {
//     redirectTo?: string;
// }

// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

// export default function PaymentForm({ redirectTo = '/group/create' }: PaymentFormProps) {
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);
//     const [phone, setPhone] = useState('');
//     const [name, setName] = useState('');
//     const { toast } = useToast();

//     const loadRazorpayScript = () => {
//         return new Promise((resolve) => {
//             const script = document.createElement('script');
//             script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//             script.onload = () => resolve(true);
//             script.onerror = () => resolve(false);
//             document.body.appendChild(script);
//         });
//     };

//     const handlePayment = async () => {
//         if (!phone || phone.length !== 10) {
//             toast({
//                 title: 'Invalid Phone',
//                 description: 'Please enter a valid 10-digit phone number',
//                 variant: 'destructive',
//             });
//             return;
//         }

//         if (!name || name.length < 2) {
//             toast({
//                 title: 'Invalid Name',
//                 description: 'Please enter your full name',
//                 variant: 'destructive',
//             });
//             return;
//         }

//         try {
//             setLoading(true);

//             const scriptLoaded = await loadRazorpayScript();
//             if (!scriptLoaded) {
//                 throw new Error('Failed to load Razorpay SDK');
//             }

//             // Step 1: Create customer
//             const customerRes = await fetch('/api/razorpay/create-customer', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ phone, name }),
//             });
//             const customerData = await customerRes.json();

//             if (!customerData.success) {
//                 throw new Error(customerData.error);
//             }

//             // Step 2: Create order
//             const orderRes = await fetch('/api/razorpay/create-order', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ customerId: customerData.customerId }),
//             });
//             const orderData = await orderRes.json();

//             if (!orderData.success) {
//                 throw new Error(orderData.error);
//             }

//             // Step 3: Open Razorpay checkout
//             const options = {
//                 key: orderData.key,
//                 amount: orderData.amount,
//                 currency: orderData.currency,
//                 order_id: orderData.orderId,
//                 name: 'NEXUS',
//                 description: 'Card Validation (₹1 will be refunded)',
//                 customer_id: customerData.customerId,
//                 prefill: {
//                     name: name,
//                     contact: phone,
//                 },
//                 theme: {
//                     color: '#3b82f6',
//                 },
//                 handler: async function (response: any) {
//                     try {
//                         const tokenRes = await fetch('/api/razorpay/save-token', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({
//                                 razorpay_payment_id: response.razorpay_payment_id,
//                                 razorpay_order_id: response.razorpay_order_id,
//                                 razorpay_signature: response.razorpay_signature,
//                                 customerId: customerData.customerId,
//                             }),
//                         });
//                         const tokenData = await tokenRes.json();

//                         if (tokenData.success) {
//                             toast({
//                                 title: 'Success! 🎉',
//                                 description: 'Payment method added. You can now create your group!',
//                             });

//                             // Refresh the page to show group creation form
//                             router.refresh();
//                         } else {
//                             throw new Error(tokenData.error);
//                         }
//                     } catch (err: any) {
//                         toast({
//                             title: 'Error',
//                             description: err.message,
//                             variant: 'destructive',
//                         });
//                     }
//                     setLoading(false);
//                 },
//                 modal: {
//                     ondismiss: function () {
//                         setLoading(false);
//                         toast({
//                             title: 'Payment Cancelled',
//                             description: 'You cancelled the payment process',
//                             variant: 'destructive',
//                         });
//                     },
//                 },
//             };

//             const rzp = new window.Razorpay(options);
//             rzp.open();
//         } catch (err: any) {
//             toast({
//                 title: 'Error',
//                 description: err.message,
//                 variant: 'destructive',
//             });
//             setLoading(false);
//         }
//     };

//     return (
//         <Card className="w-full max-w-md">
//             <CardHeader>
//                 <CardTitle>Add Payment Method</CardTitle>
//                 <CardDescription>
//                     We'll validate your card with a ₹1 charge (refunded immediately).
//                     <strong> Your first 14 days are completely free!</strong>
//                 </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                     <Label htmlFor="name">Full Name</Label>
//                     <Input
//                         id="name"
//                         placeholder="John Doe"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         disabled={loading}
//                     />
//                 </div>
//                 <div className="space-y-2">
//                     <Label htmlFor="phone">Phone Number</Label>
//                     <Input
//                         id="phone"
//                         type="tel"
//                         placeholder="9876543210"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                         disabled={loading}
//                         maxLength={10}
//                     />
//                 </div>
//                 <Button
//                     onClick={handlePayment}
//                     disabled={loading}
//                     className="w-full">
//                     {loading ? (
//                         <span className="flex items-center gap-2">
//                             <Loader2 /> Processing...
//                         </span>
//                     ) : (
//                         'Add Card Details'
//                     )}
//                 </Button>
//                 <p className="text-xs text-center text-muted-foreground">
//                     🔒 Secured by Razorpay. Card details are never stored on our servers.
//                 </p>
//             </CardContent>
//         </Card>
//     )
// };



// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';
// import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// const CATEGORIES = [
//   'Technology',
//   'Business',
//   'Education',
//   'Entertainment',
//   'Health & Fitness',
//   'Lifestyle',
//   'Other'
// ];

// interface PaymentFormProps {
//   redirectTo?: string;
// }

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// export default function PaymentForm({ redirectTo = '/group/create' }: PaymentFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<'group' | 'payment'>('group');
//   const { toast } = useToast();
  
//   // Group details
//   const [groupData, setGroupData] = useState({
//     name: '',
//     category: '',
//     description: '',
//     privacy: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
//   });

//   // Payment details
//   const [paymentData, setPaymentData] = useState({
//     phone: '',
//     name: '',
//   });

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleNextStep = () => {
//     // Validate group data
//     if (!groupData.name || !groupData.category) {
//       toast({
//         title: 'Missing Information',
//         description: 'Please fill in group name and category',
//         variant: 'destructive',
//       });
//       return;
//     }

//     setStep('payment');
//   };

//   const handlePayment = async () => {
//     if (!paymentData.phone || paymentData.phone.length !== 10) {
//       toast({
//         title: 'Invalid Phone',
//         description: 'Please enter a valid 10-digit phone number',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (!paymentData.name || paymentData.name.length < 2) {
//       toast({
//         title: 'Invalid Name',
//         description: 'Please enter your full name',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         throw new Error('Failed to load Razorpay SDK');
//       }

//       // Step 1: Create customer
//       const customerRes = await fetch('/api/razorpay/create-customer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           phone: paymentData.phone, 
//           name: paymentData.name 
//         }),
//       });
//       const customerData = await customerRes.json();

//       if (!customerData.success) {
//         throw new Error(customerData.error);
//       }

//       // Step 2: Create order
//       const orderRes = await fetch('/api/razorpay/create-order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ customerId: customerData.customerId }),
//       });
//       const orderData = await orderRes.json();

//       if (!orderData.success) {
//         throw new Error(orderData.error);
//       }

//       // Step 3: Open Razorpay checkout (this opens a modal with card input)
//       const options = {
//         key: orderData.key,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         order_id: orderData.orderId,
//         name: 'NEXUS',
//         description: 'Card Validation (₹1 will be refunded)',
//         customer_id: customerData.customerId,
//         prefill: {
//           name: paymentData.name,
//           contact: paymentData.phone,
//         },
//         theme: {
//           color: '#3b82f6',
//         },
//         handler: async function (response: any) {
//           try {
//             // Save payment token
//             const tokenRes = await fetch('/api/razorpay/save-token', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 customerId: customerData.customerId,
//               }),
//             });
//             const tokenData = await tokenRes.json();

//             if (!tokenData.success) {
//               throw new Error(tokenData.error);
//             }

//             // Now create the group with subscription
//             const groupRes = await fetch('/api/groups/create', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(groupData),
//             });
//             const groupResult = await groupRes.json();

//             if (groupResult.success) {
//               toast({
//                 title: 'Success! 🎉',
//                 description: `Group "${groupData.name}" created! Your 14-day trial has started.`,
//               });
              
//               // Redirect to the new group
//               router.push(`/group/${groupResult.group.id}`);
//             } else {
//               throw new Error(groupResult.error);
//             }
//           } catch (err: any) {
//             toast({
//               title: 'Error',
//               description: err.message,
//               variant: 'destructive',
//             });
//           }
//           setLoading(false);
//         },
//         modal: {
//           ondismiss: function () {
//             setLoading(false);
//             toast({
//               title: 'Payment Cancelled',
//               description: 'You cancelled the payment process',
//               variant: 'destructive',
//             });
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err: any) {
//       toast({
//         title: 'Error',
//         description: err.message,
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>
//           {step === 'group' ? 'Create Your Group' : 'Add Payment Method'}
//         </CardTitle>
//         <CardDescription>
//           {step === 'group' 
//             ? 'Set up your community. Free for 14 days!'
//             : "We'll validate your card with ₹1 (refunded immediately). Then your group will be created!"
//           }
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {step === 'group' ? (
//           // STEP 1: Group Details
//           <>
//             <div className="space-y-2">
//               <Label htmlFor="groupName">
//                 Group Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="groupName"
//                 placeholder="My Awesome Group"
//                 value={groupData.name}
//                 onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="category">
//                 Category <span className="text-red-500">*</span>
//               </Label>
//               <Select
//                 value={groupData.category}
//                 onValueChange={(value) => setGroupData({ ...groupData, category: value })}
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CATEGORIES.map((category) => (
//                     <SelectItem key={category} value={category}>
//                       {category}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description (Optional)</Label>
//               <Textarea
//                 id="description"
//                 placeholder="Tell us about your group..."
//                 value={groupData.description}
//                 onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
//                 disabled={loading}
//                 rows={3}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="privacy">Privacy</Label>
//               <Select
//                 value={groupData.privacy}
//                 onValueChange={(value: 'PUBLIC' | 'PRIVATE') => 
//                   setGroupData({ ...groupData, privacy: value })
//                 }
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="PRIVATE">🔒 Private</SelectItem>
//                   <SelectItem value="PUBLIC">🌍 Public</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-xs text-muted-foreground">
//                 {groupData.privacy === 'PRIVATE' 
//                   ? 'Only invited members can join'
//                   : 'Anyone can discover and join'
//                 }
//               </p>
//             </div>

//             <Button
//               onClick={handleNextStep}
//               disabled={loading}
//               className="w-full mt-4"
//             >
//               Continue to Payment
//             </Button>

//             <div className="text-xs text-center text-muted-foreground">
//               ✨ 14-day free trial • ₹99/month after trial
//             </div>
//           </>
//         ) : (
//           // STEP 2: Payment Details
//           <>
//             <div className="mb-4 p-3 bg-muted rounded-lg">
//               <p className="text-sm font-medium">Creating group:</p>
//               <p className="text-sm text-muted-foreground mt-1">
//                 <strong>{groupData.name}</strong> • {groupData.category}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 placeholder="John Doe"
//                 value={paymentData.name}
//                 onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 placeholder="9876543210"
//                 value={paymentData.phone}
//                 onChange={(e) => setPaymentData({ 
//                   ...paymentData, 
//                   phone: e.target.value.replace(/\D/g, '').slice(0, 10) 
//                 })}
//                 disabled={loading}
//                 maxLength={10}
//               />
//               <p className="text-xs text-muted-foreground">
//                 Required for payment processing
//               </p>
//             </div>

//             <div className="space-y-3 pt-2">
//               <Button
//                 onClick={handlePayment}
//                 disabled={loading}
//                 className="w-full">
//                 {loading ? (
//                   <span className="flex items-center gap-2">
//                     <Loader2 className="animate-spin" /> Processing...
//                   </span>
//                 ) : (
//                   'Add Card & Create Group'
//                 )}
//               </Button>

//               <Button
//                 onClick={() => setStep('group')}
//                 variant="outline"
//                 disabled={loading}
//                 className="w-full"
//               >
//                 Back
//               </Button>
//             </div>

//             <div className="space-y-2 pt-2">
//               <p className="text-xs text-center text-muted-foreground">
//                 🔒 Secured by Razorpay
//               </p>
//               <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
//                 <p className="font-medium mb-1">Next step:</p>
//                 <p>You'll enter your card details in Razorpay's secure payment window. We'll charge ₹1 to verify your card (refunded immediately), then create your group!</p>
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }



// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';
// import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// const CATEGORIES = [
//   'Technology',
//   'Business',
//   'Education',
//   'Entertainment',
//   'Health & Fitness',
//   'Lifestyle',
//   'Other'
// ];

// interface PaymentFormProps {
//   redirectTo?: string;
// }

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// export default function PaymentForm({ redirectTo = '/group/create' }: PaymentFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<'group' | 'payment'>('group');
//   const { toast } = useToast();
  
//   // Group details
//   const [groupData, setGroupData] = useState({
//     name: '',
//     category: '',
//     description: '',
//     privacy: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
//   });

//   // Payment details
//   const [paymentData, setPaymentData] = useState({
//     phone: '',
//     name: '',
//   });

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       // Check if already loaded
//       if (window.Razorpay) {
//         resolve(true);
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleNextStep = () => {
//     // Validate group data
//     if (!groupData.name || !groupData.category) {
//       toast({
//         title: 'Missing Information',
//         description: 'Please fill in group name and category',
//         variant: 'destructive',
//       });
//       return;
//     }

//     setStep('payment');
//   };

//   const handlePayment = async () => {
//     if (!paymentData.phone || paymentData.phone.length !== 10) {
//       toast({
//         title: 'Invalid Phone',
//         description: 'Please enter a valid 10-digit phone number',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (!paymentData.name || paymentData.name.length < 2) {
//       toast({
//         title: 'Invalid Name',
//         description: 'Please enter your full name',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       // Load Razorpay script
//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
//       }

//       // Step 1: Create Razorpay customer
//       const customerRes = await fetch('/api/razorpay/create-customer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           phone: paymentData.phone, 
//           name: paymentData.name 
//         }),
//       });

//       if (!customerRes.ok) {
//         throw new Error('Failed to create customer');
//       }

//       const customerData = await customerRes.json();

//       if (!customerData.success) {
//         throw new Error(customerData.error || 'Failed to create customer');
//       }

//       // Step 2: Create order for card validation
//       const orderRes = await fetch('/api/razorpay/create-order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ customerId: customerData.customerId }),
//       });

//       if (!orderRes.ok) {
//         throw new Error('Failed to create order');
//       }

//       const orderData = await orderRes.json();

//       if (!orderData.success) {
//         throw new Error(orderData.error || 'Failed to create order');
//       }

//       // Step 3: Open Razorpay checkout
//       const options = {
//         key: orderData.key,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         order_id: orderData.orderId,
//         name: 'NEXUS',
//         description: 'Card Validation (₹1 will be refunded)',
//         customer_id: customerData.customerId,
//         prefill: {
//           name: paymentData.name,
//           contact: paymentData.phone,
//         },
//         theme: {
//           color: '#3b82f6',
//         },
//         handler: async function (response: any) {
//           try {
//             console.log('Payment successful, saving token...');
            
//             // Step 4: Save payment token
//             const tokenRes = await fetch('/api/razorpay/save-token', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 customerId: customerData.customerId,
//               }),
//             });

//             if (!tokenRes.ok) {
//               throw new Error('Failed to save payment token');
//             }

//             const tokenData = await tokenRes.json();

//             if (!tokenData.success) {
//               throw new Error(tokenData.error || 'Failed to save payment token');
//             }

//             console.log('Token saved, creating group...');

//             // Step 5: Create group with subscription
//             const groupRes = await fetch('/api/groups/create-with-payment', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(groupData),
//             });

//             if (!groupRes.ok) {
//               throw new Error('Failed to create group');
//             }

//             const groupResult = await groupRes.json();

//             if (groupResult.success) {
//               toast({
//                 title: 'Success! 🎉',
//                 description: `Group "${groupData.name}" created! Your 14-day trial has started.`,
//               });
              
//               console.log('Group created successfully:', groupResult.group);
              
//               // Redirect to the new group
//               setTimeout(() => {
//                 router.push(`/group/${groupResult.group.id}`);
//               }, 1000);
//             } else {
//               throw new Error(groupResult.error || 'Failed to create group');
//             }
//           } catch (err: any) {
//             console.error('Error in payment handler:', err);
//             toast({
//               title: 'Error',
//               description: err.message || 'Something went wrong',
//               variant: 'destructive',
//             });
//             setLoading(false);
//           }
//         },
//         modal: {
//           ondismiss: function () {
//             console.log('Payment modal dismissed');
//             setLoading(false);
//             toast({
//               title: 'Payment Cancelled',
//               description: 'You cancelled the payment process',
//               variant: 'destructive',
//             });
//           },
//         },
//       };

//       console.log('Opening Razorpay checkout...');
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err: any) {
//       console.error('Error in handlePayment:', err);
//       toast({
//         title: 'Error',
//         description: err.message || 'Something went wrong',
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>
//           {step === 'group' ? 'Create Your Group' : 'Add Payment Method'}
//         </CardTitle>
//         <CardDescription>
//           {step === 'group' 
//             ? 'Set up your community. Free for 14 days!'
//             : "We'll validate your card with ₹1 (refunded immediately). Then your group will be created!"
//           }
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {step === 'group' ? (
//           // STEP 1: Group Details
//           <>
//             <div className="space-y-2">
//               <Label htmlFor="groupName">
//                 Group Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="groupName"
//                 placeholder="My Awesome Group"
//                 value={groupData.name}
//                 onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="category">
//                 Category <span className="text-red-500">*</span>
//               </Label>
//               <Select
//                 value={groupData.category}
//                 onValueChange={(value) => setGroupData({ ...groupData, category: value })}
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CATEGORIES.map((category) => (
//                     <SelectItem key={category} value={category}>
//                       {category}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description (Optional)</Label>
//               <Textarea
//                 id="description"
//                 placeholder="Tell us about your group..."
//                 value={groupData.description}
//                 onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
//                 disabled={loading}
//                 rows={3}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="privacy">Privacy</Label>
//               <Select
//                 value={groupData.privacy}
//                 onValueChange={(value: 'PUBLIC' | 'PRIVATE') => 
//                   setGroupData({ ...groupData, privacy: value })
//                 }
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="PRIVATE">🔒 Private</SelectItem>
//                   <SelectItem value="PUBLIC">🌍 Public</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-xs text-muted-foreground">
//                 {groupData.privacy === 'PRIVATE' 
//                   ? 'Only invited members can join'
//                   : 'Anyone can discover and join'
//                 }
//               </p>
//             </div>

//             <Button
//               onClick={handleNextStep}
//               disabled={loading}
//               className="w-full mt-4"
//             >
//               Continue to Payment
//             </Button>

//             <div className="text-xs text-center text-muted-foreground">
//               ✨ 14-day free trial • ₹99/month after trial
//             </div>
//           </>
//         ) : (
//           // STEP 2: Payment Details
//           <>
//             <div className="mb-4 p-3 bg-muted rounded-lg">
//               <p className="text-sm font-medium">Creating group:</p>
//               <p className="text-sm text-muted-foreground mt-1">
//                 <strong>{groupData.name}</strong> • {groupData.category}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 placeholder="John Doe"
//                 value={paymentData.name}
//                 onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 placeholder="9876543210"
//                 value={paymentData.phone}
//                 onChange={(e) => setPaymentData({ 
//                   ...paymentData, 
//                   phone: e.target.value.replace(/\D/g, '').slice(0, 10) 
//                 })}
//                 disabled={loading}
//                 maxLength={10}
//               />
//               <p className="text-xs text-muted-foreground">
//                 Required for payment processing
//               </p>
//             </div>

//             <div className="space-y-3 pt-2">
//               <Button
//                 onClick={handlePayment}
//                 disabled={loading}
//                 className="w-full"
//               >
//                 {loading ? (
//                   <span className="flex items-center gap-2">
//                     <Loader2 className="animate-spin" size={16} /> Processing...
//                   </span>
//                 ) : (
//                   'Add Card & Create Group'
//                 )}
//               </Button>

//               <Button
//                 onClick={() => setStep('group')}
//                 variant="outline"
//                 disabled={loading}
//                 className="w-full"
//               >
//                 Back
//               </Button>
//             </div>

//             <div className="space-y-2 pt-2">
//               <p className="text-xs text-center text-muted-foreground">
//                 🔒 Secured by Razorpay
//               </p>
//               <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
//                 <p className="font-medium mb-1">Next step:</p>
//                 <p>You'll enter your card details in Razorpay's secure payment window. We'll charge ₹1 to verify your card (refunded immediately), then create your group!</p>
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }



'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Health & Fitness',
  'Lifestyle',
  'Other'
];

interface PaymentFormProps {
  redirectTo?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentForm({ redirectTo = '/group/create' }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'group' | 'payment'>('group');
  const { toast } = useToast();
  
  const [groupData, setGroupData] = useState({
    name: '',
    category: '',
    description: '',
    privacy: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
  });

  const [paymentData, setPaymentData] = useState({
    phone: '',
    name: '',
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      console.log('⬇️ Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleNextStep = () => {
    console.log('▶️ Step 1: Validating group data...');
    console.log('📦 Group data:', groupData);

    if (!groupData.name || !groupData.category) {
      console.error('❌ Missing group name or category');
      toast({
        title: 'Missing Information',
        description: 'Please fill in group name and category',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ Group data valid, moving to payment step');
    setStep('payment');
  };

  const handlePayment = async () => {
    console.log('💳 Starting payment process...');
    console.log('📦 Payment data:', paymentData);
    console.log('📦 Group data:', groupData);

    if (!paymentData.phone || paymentData.phone.length !== 10) {
      console.error('❌ Invalid phone number');
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentData.name || paymentData.name.length < 2) {
      console.error('❌ Invalid name');
      toast({
        title: 'Invalid Name',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay script
      console.log('📦 Step 1/5: Loading Razorpay...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create customer
      console.log('👤 Step 2/5: Creating Razorpay customer...');
      const customerRes = await fetch('/api/razorpay/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: paymentData.phone, 
          name: paymentData.name 
        }),
      });

      console.log('📡 Customer API response status:', customerRes.status);
      
      if (!customerRes.ok) {
        const errorText = await customerRes.text();
        console.error('❌ Customer API error:', errorText);
        throw new Error(`Failed to create customer: ${customerRes.status}`);
      }

      const customerData = await customerRes.json();
      console.log('✅ Customer created:', customerData);

      if (!customerData.success) {
        throw new Error(customerData.error || 'Failed to create customer');
      }

      // Create order
      console.log('🧾 Step 3/5: Creating Razorpay order...');
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerData.customerId }),
      });

      console.log('📡 Order API response status:', orderRes.status);

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error('❌ Order API error:', errorText);
        throw new Error(`Failed to create order: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();
      console.log('✅ Order created:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Open Razorpay checkout
      console.log('💳 Step 4/5: Opening Razorpay checkout...');
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'NEXUS',
        description: 'Card Validation (₹1 will be refunded)',
        customer_id: customerData.customerId,
        prefill: {
          name: paymentData.name,
          contact: paymentData.phone,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async function (response: any) {
          console.log('✅ Payment successful!');
          console.log('📦 Payment response:', response);
          
          try {
            // Save token
            console.log('💾 Saving payment token...');
            const tokenRes = await fetch('/api/razorpay/save-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                customerId: customerData.customerId,
              }),
            });

            console.log('📡 Token API response status:', tokenRes.status);

            if (!tokenRes.ok) {
              const errorText = await tokenRes.text();
              console.error('❌ Token API error:', errorText);
              throw new Error(`Failed to save token: ${tokenRes.status}`);
            }

            const tokenData = await tokenRes.json();
            console.log('✅ Token saved:', tokenData);

            if (!tokenData.success) {
              throw new Error(tokenData.error || 'Failed to save payment token');
            }

            // Create group
            console.log('🏗️ Step 5/5: Creating group...');
            console.log('📦 Sending group data:', groupData);
            
            const groupRes = await fetch('/api/groups/create-with-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(groupData),
            });

            console.log('📡 Group API response status:', groupRes.status);

            if (!groupRes.ok) {
              const errorText = await groupRes.text();
              console.error('❌ Group API error:', errorText);
              console.error('❌ Group API returned:', groupRes.status);
              throw new Error(`Failed to create group: ${groupRes.status} - Check if API route exists at /api/groups/create-with-payment/route.ts`);
            }

            const groupResult = await groupRes.json();
            console.log('✅ Group API response:', groupResult);

            if (groupResult.success) {
              console.log('🎉 SUCCESS! Group created:', groupResult.group);
              
              toast({
                title: 'Success! 🎉',
                description: `Group "${groupData.name}" created! Your 14-day trial has started.`,
              });
              
              setTimeout(() => {
                console.log('➡️ Redirecting to:', `/group/${groupResult.group.id}`);
                router.push(`/group/${groupResult.group.id}`);
              }, 1000);
            } else {
              throw new Error(groupResult.error || 'Failed to create group');
            }
          } catch (err: any) {
            console.error('💥 Error in payment handler:', err);
            toast({
              title: 'Error',
              description: err.message || 'Something went wrong',
              variant: 'destructive',
            });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('❌ Payment modal dismissed by user');
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process',
              variant: 'destructive',
            });
          },
        },
      };

      console.log('🚀 Opening Razorpay modal...');
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('💥 Error in handlePayment:', err);
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {step === 'group' ? 'Create Your Group' : 'Add Payment Method'}
        </CardTitle>
        <CardDescription>
          {step === 'group' 
            ? 'Set up your community. Free for 14 days!'
            : "We'll validate your card with ₹1 (refunded immediately). Then your group will be created!"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'group' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="groupName">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="groupName"
                placeholder="My Awesome Group"
                value={groupData.name}
                onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={groupData.category}
                onValueChange={(value) => setGroupData({ ...groupData, category: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your group..."
                value={groupData.description}
                onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select
                value={groupData.privacy}
                onValueChange={(value: 'PUBLIC' | 'PRIVATE') => 
                  setGroupData({ ...groupData, privacy: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">🔒 Private</SelectItem>
                  <SelectItem value="PUBLIC">🌍 Public</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {groupData.privacy === 'PRIVATE' 
                  ? 'Only invited members can join'
                  : 'Anyone can discover and join'
                }
              </p>
            </div>

            <Button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full mt-4"
            >
              Continue to Payment
            </Button>

            <div className="text-xs text-center text-muted-foreground">
              ✨ 14-day free trial • ₹99/month after trial
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Creating group:</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>{groupData.name}</strong> • {groupData.category}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={paymentData.name}
                onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={paymentData.phone}
                onChange={(e) => setPaymentData({ 
                  ...paymentData, 
                  phone: e.target.value.replace(/\D/g, '').slice(0, 10) 
                })}
                disabled={loading}
                maxLength={10}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Processing...
                  </span>
                ) : (
                  'Add Card & Create Group'
                )}
              </Button>

              <Button
                onClick={() => setStep('group')}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                Back
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs text-center text-muted-foreground">
                🔒 Secured by Razorpay
              </p>
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="font-medium mb-1">Next step:</p>
                <p>You'll enter card details in Razorpay's secure window. We'll verify with ₹1 (refunded), then create your group!</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}