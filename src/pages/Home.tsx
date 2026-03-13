import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { Shield, Zap, Crosshair, Lock, RefreshCw, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  features: string[];
  status: string;
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      {!user && (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden border-b border-white/10 bg-black pt-24 pb-32">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#059669_0%,transparent_50%)] opacity-20"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-sans text-5xl font-extrabold tracking-tight sm:text-7xl"
              >
                DOMINATE WITH <span className="text-emerald-500">YEAGER</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
              >
                Premium hack and mod menus for elite players. Undetected, powerful, and constantly updated. Elevate your gameplay today.
              </motion.p>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-b border-white/10 bg-zinc-900/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Why Choose Yeager?</h2>
                <p className="mt-4 text-gray-400">The most trusted provider in the industry.</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-white/10 bg-black p-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Lock className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">100% Undetected</h3>
                  <p className="text-gray-400 text-sm">Our unique bypass methods ensure your account stays safe. We update our security protocols daily.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-white/10 bg-black p-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <RefreshCw className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Instant Updates</h3>
                  <p className="text-gray-400 text-sm">When the game updates, we update. Our team works 24/7 to ensure zero downtime for our users.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-black p-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Headphones className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Premium Support</h3>
                  <p className="text-gray-400 text-sm">Stuck? Need help setting up? Our dedicated support team is available around the clock to assist you.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Available Menus</h2>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 text-center">
            <Shield className="mb-4 h-12 w-12 text-gray-500" />
            <h3 className="text-xl font-medium text-white">No products available</h3>
            <p className="mt-2 text-gray-400">Check back later for new releases.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              >
                <div className="aspect-video w-full overflow-hidden bg-zinc-900">
                  <img 
                    src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/450`} 
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-400 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-6 flex-1">
                    <ul className="space-y-2">
                      {product.features?.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-300">
                          <Zap className="mr-2 h-4 w-4 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                      {(product.features?.length || 0) > 3 && (
                        <li className="text-sm text-gray-500 italic">+ {(product.features?.length || 0) - 3} more features</li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="mt-8 w-full rounded-xl bg-white/10 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 hover:text-black"
                  >
                    Purchase Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <CheckoutModal 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          product={selectedProduct} 
        />
      )}
    </div>
  );
};
