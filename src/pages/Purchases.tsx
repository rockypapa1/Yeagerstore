import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Download, Clock, XCircle, CheckCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const Purchases: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort locally to avoid needing a composite index for where + orderBy
      fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please log in to view your purchases.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
          <ShoppingBag className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-gray-500" />
            <h3 className="text-xl font-medium text-white">No purchases yet</h3>
            <p className="mt-2 text-gray-400">Your bought hacks and menus will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={order.id} 
                className="flex flex-col sm:flex-row items-center justify-between rounded-xl border border-white/10 bg-black p-6 transition-all hover:border-emerald-500/30"
              >
                <div className="w-full sm:w-auto text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white">{order.productName}</h3>
                  <p className="text-sm text-gray-400 mt-1">Order ID: <span className="font-mono text-xs">{order.id}</span></p>
                  <p className="text-sm text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end w-full sm:w-auto">
                  <span className={`mb-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                    order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {order.status === 'pending' && <Clock className="h-3 w-3" />}
                    {order.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                    {order.status === 'rejected' && <XCircle className="h-3 w-3" />}
                    {order.status}
                  </span>
                  
                  {order.status === 'approved' && order.hackUrl && (
                    <a 
                      href={order.hackUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      Download Hack
                    </a>
                  )}
                  {order.status === 'pending' && (
                    <p className="text-xs text-gray-500 italic">Waiting for admin verification...</p>
                  )}
                  {order.status === 'rejected' && (
                    <p className="text-xs text-red-500 italic">Payment rejected. Contact support.</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
