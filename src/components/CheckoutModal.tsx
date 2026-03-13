import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, CheckCircle2, QrCode } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; price: number };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, product }) => {
  const { user, login } = useAuth();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to keep size small
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setScreenshot(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      login();
      return;
    }
    if (!screenshot) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        screenshotUrl: screenshot,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      toast.success("Order submitted successfully!");
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setScreenshot(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
                <h3 className="text-xl font-bold text-white">Payment Pending</h3>
                <p className="mt-2 text-gray-400">
                  Your payment screenshot has been submitted. An admin will verify it shortly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white">Checkout</h2>
                <p className="mt-1 text-gray-400">Complete your purchase for {product.name}</p>
                
                <div className="my-6 flex flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 w-full">
                  <span className="text-sm font-medium text-emerald-500 uppercase tracking-widest">Total Amount</span>
                  <span className="mt-1 text-4xl font-mono font-bold text-white">${product.price.toFixed(2)}</span>
                </div>

                <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/50 p-6 w-full">
                  <img 
                    src="https://i.supaimg.com/1d5b889b-6223-4256-a2e7-cb130244accd/4fc6033b-b421-4962-9ade-0153f7e7ac06.png" 
                    alt="Payment QR Code" 
                    className="h-48 w-48 rounded-lg mb-4 object-contain bg-white p-2"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-sm text-gray-400 text-center">Scan this QR code to pay.</p>
                </div>

                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Upload Payment Screenshot
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 py-8 transition-colors hover:border-emerald-500/50 hover:bg-white/10">
                    {screenshot ? (
                      <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                        <img src={screenshot} alt="Screenshot preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-400">Click to upload image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!screenshot || isSubmitting}
                  className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : user ? 'Submit Payment' : 'Login to Submit'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
