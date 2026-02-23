import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, CreditCard } from 'lucide-react';

const POSModule = () => {
    const [cart, setCart] = useState([
        { id: 1, name: 'Ray-Ban Aviator', price: 1500, qty: 1 },
        { id: 2, name: 'Lente Transitions', price: 800, qty: 1 },
    ]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="flex gap-lg h-full" style={{ height: 'calc(100vh - 140px)' }}>

            {/* Product Catalog Area */}
            <div className="flex col gap-md flex-1">
                <div className="flex items-center gap-md mb-4">
                    <h2 className="text-md" style={{ fontSize: '20px' }}>Punto de Venta</h2>
                    <div className="search-bar flex items-center flex-1" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        border: '1px solid #E0E5F2'
                    }}>
                        <Search size={18} color="var(--color-text-secondary)" />
                        <input
                            type="text"
                            placeholder="Buscar productos por nombre o SKU..."
                            style={{ width: '100%', marginLeft: '8px', background: 'transparent', border: 'none', padding: 0 }}
                        />
                    </div>
                </div>

                {/* Mock Product Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', overflowY: 'auto' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card flex col gap-sm" style={{ padding: '16px', cursor: 'pointer' }}>
                            <div style={{ height: '120px', background: '#F4F7FE', borderRadius: '8px', marginBottom: '8px' }}></div>
                            <h4 style={{ fontWeight: 600 }}>Montura Modelo #{i}00</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-primary" style={{ fontWeight: 'bold' }}>$1,200</span>
                                <button className="btn-icon" style={{ background: 'var(--color-primary)', color: 'white', width: '28px', height: '28px' }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="card flex col" style={{ width: '380px', height: '100%', padding: '24px' }}>
                <div className="flex items-center gap-md mb-6">
                    <ShoppingCart size={20} />
                    <h3 className="text-md">Carrito de Compra</h3>
                    <span className="text-sm ml-auto" style={{ background: '#F4F7FE', padding: '4px 8px', borderRadius: '12px' }}>{cart.length} items</span>
                </div>

                <div className="cart-items flex-1 overflow-y-auto flex col gap-md pr-2">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid #F4F7FE' }}>
                            <div>
                                <p style={{ fontWeight: 600 }}>{item.name}</p>
                                <p className="text-sm text-primary">${item.price}</p>
                            </div>
                            <div className="flex items-center gap-sm">
                                <div style={{ padding: '4px 8px', background: '#F4F7FE', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>x{item.qty}</div>
                                <Trash2 size={16} color="var(--color-error)" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="summary" style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '2px solid #F4F7FE' }}>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm">Subtotal</span>
                        <span>${total}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span className="text-sm">Impuesto (16%)</span>
                        <span>${(total * 0.16).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-6" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>${(total * 1.16).toFixed(2)}</span>
                    </div>

                    <button className="btn-primary flex items-center justify-center gap-md" style={{ width: '100%', padding: '16px' }}>
                        <CreditCard size={20} />
                        <span>Procesar Pago</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSModule;
