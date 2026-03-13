import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Shield, Package, ShoppingCart, CheckCircle, XCircle, Clock, Plus, Trash2, Edit, DollarSign, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    features: '',
    status: 'active',
    hackUrl: ''
  });

  useEffect(() => {
    if (!isAdmin) return;

    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQ, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const productsQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(productsQ, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-gray-400">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, productId?: string) => {
    try {
      const updateData: any = { status };
      if (status === 'approved' && productId) {
        const product = products.find(p => p.id === productId);
        if (product && product.hackUrl) {
          updateData.hackUrl = product.hackUrl;
        }
      }
      await updateDoc(doc(db, 'orders', orderId), updateData);
      toast.success(`Order ${status} successfully!`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status.");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = newProduct.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      
      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), {
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${newProduct.name}/800/450`,
          features: featuresArray,
          status: newProduct.status,
          hackUrl: newProduct.hackUrl
        });
      } else {
        await addDoc(collection(db, 'products'), {
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${newProduct.name}/800/450`,
          features: featuresArray,
          status: newProduct.status,
          hackUrl: newProduct.hackUrl,
          createdAt: new Date().toISOString()
        });
      }
      
      setIsAddingProduct(false);
      setEditingProductId(null);
      setNewProduct({ name: '', description: '', price: 0, imageUrl: '', features: '', status: 'active', hackUrl: '' });
      toast.success(editingProductId ? "Product updated!" : "Product added!");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product.");
    }
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      features: product.features.join(', '),
      status: product.status,
      hackUrl: product.hackUrl || ''
    });
    setEditingProductId(product.id);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast.success("Product deleted!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      }
    }
  };

  const totalRevenue = orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.price, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              <Package className="h-4 w-4" />
              Products
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending Orders</p>
                <p className="text-2xl font-bold text-white">{pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400">No orders found.</p>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <div key={order.id} className="flex flex-col md:flex-row overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-emerald-400">{order.productName}</h3>
                        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {order.status === 'pending' && <Clock className="h-3 w-3" />}
                          {order.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                          {order.status === 'rejected' && <XCircle className="h-3 w-3" />}
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block text-gray-500">User Email</span>
                          <span className="text-white">{order.userEmail}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Price</span>
                          <span className="text-white font-mono">${order.price.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Date</span>
                          <span className="text-white">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Order ID</span>
                          <span className="text-white font-mono text-xs">{order.id}</span>
                        </div>
                      </div>
                      
                      {order.status === 'pending' && (
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'approved', order.productId)}
                            className="flex-1 rounded-lg bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20 border border-emerald-500/20"
                          >
                            Approve Order
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                            className="flex-1 rounded-lg bg-red-500/10 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20 border border-red-500/20"
                          >
                            Reject Order
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 bg-zinc-900/50 p-6 flex flex-col items-center justify-center">
                      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Payment Screenshot</span>
                      {order.screenshotUrl ? (
                        <a href={order.screenshotUrl} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-lg border border-white/10 transition-transform hover:scale-105">
                          <img src={order.screenshotUrl} alt="Payment Proof" className="w-full h-auto object-cover" />
                        </a>
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-white/20 text-gray-500">
                          No screenshot
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manage Products</h2>
              <button
                onClick={() => {
                  if (isAddingProduct) {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                    setNewProduct({ name: '', description: '', price: 0, imageUrl: '', features: '', status: 'active' });
                  } else {
                    setIsAddingProduct(true);
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
              >
                {isAddingProduct ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isAddingProduct ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {isAddingProduct && (
              <form onSubmit={handleAddProduct} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-lg">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Product Name</label>
                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Price ($)</label>
                    <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.valueAsNumber})} className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-400">Description</label>
                    <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" rows={3}></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-400">Features (comma separated)</label>
                    <input required type="text" value={newProduct.features} onChange={e => setNewProduct({...newProduct, features: e.target.value})} placeholder="Aimbot, ESP, No Recoil" className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-400">Image URL (optional)</label>
                    <input type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://..." className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-400">Hack/Download URL</label>
                    <input required type="url" value={newProduct.hackUrl} onChange={e => setNewProduct({...newProduct, hackUrl: e.target.value})} placeholder="https://mega.nz/..." className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="mt-6 w-full rounded-lg bg-emerald-500 py-3 font-bold text-black hover:bg-emerald-400">
                  {editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </form>
            )}

            <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-300">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                      <td className="px-6 py-4 font-mono">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEditProduct(product)} className="text-blue-500 hover:text-blue-400 mr-4">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-400">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No products found. Add one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
