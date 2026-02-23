import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Search, Filter, Download, Edit, Eye, AlertTriangle } from 'lucide-react';

const InventoryModule = () => {
    const [activeTab, setActiveTab] = useState('All Items');

    const stockData = [
        { id: 1, name: 'Ray-Ban Aviator Classic', category: 'Montura', sku: 'RB3025', supplier: 'Luxottica', stock: 124, price: '$150.00', status: 'In Stock' },
        { id: 2, name: 'Lente Transitions Sig 8', category: 'Lente Of.', sku: 'TR8-GRY', supplier: 'Essilor', stock: 10, price: '$80.00', status: 'Low Stock' },
        { id: 3, name: 'Solución Limpiadora 60ml', category: 'Accesorio', sku: 'CLN-60', supplier: 'Avizor', stock: 0, price: '$12.00', status: 'Out of Stock' },
        { id: 4, name: 'Oakley Holbrook', category: 'Montura', sku: 'OK9102', supplier: 'Luxottica', stock: 45, price: '$140.00', status: 'In Stock' },
        { id: 5, name: 'Biofinity Toric (Caja)', category: 'Lente Cont.', sku: 'BIO-TOR', supplier: 'CooperVision', stock: 4, price: '$55.00', status: 'Low Stock' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Stock': return { color: 'var(--color-success)', bg: '#E6F9F4' };
            case 'Low Stock': return { color: 'var(--color-warning)', bg: '#FFF7E6' };
            case 'Out of Stock': return { color: 'var(--color-error)', bg: '#FEEEEE' };
            default: return { color: 'var(--color-text-secondary)', bg: '#F4F7FE' };
        }
    };

    const tabs = ['All Items', 'Frames', 'Lenses', 'Accessories', 'Supplies'];

    return (
        <div className="flex col gap-lg" style={{ paddingBottom: '40px' }}>
            {/* Metrics Section */}
            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#F4F7FE', padding: '12px', borderRadius: '50%' }}>
                        <Package size={24} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p className="text-sm">Total Items</p>
                        <h3 className="text-lg">1,240</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#FFF7E6', padding: '12px', borderRadius: '50%' }}>
                        <AlertCircle size={24} color="var(--color-warning)" />
                    </div>
                    <div>
                        <p className="text-sm">Low Stock</p>
                        <h3 className="text-lg">12</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#E6F9F4', padding: '12px', borderRadius: '50%' }}>
                        <Package size={24} color="var(--color-success)" />
                    </div>
                    <div>
                        <p className="text-sm">In Stock</p>
                        <h3 className="text-lg">1,223</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#FEEEEE', padding: '12px', borderRadius: '50%' }}>
                        <AlertCircle size={24} color="var(--color-error)" />
                    </div>
                    <div>
                        <p className="text-sm">Out of Stock</p>
                        <h3 className="text-lg">5</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card flex col gap-md">
                {/* Tabs */}
                <div className="tab-group">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center wrap gap-md">
                    <div className="input-group" style={{ width: '300px' }}>
                        <Search size={18} className="input-icon" />
                        <input type="text" placeholder="Search items..." className="w-full input-with-icon" />
                    </div>
                    <div className="flex gap-sm">
                        <button className="btn-ghost flex items-center gap-sm">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                        <button className="btn-ghost flex items-center gap-sm">
                            <Download size={18} />
                            <span>Export</span>
                        </button>
                        <button className="btn-primary flex items-center gap-sm">
                            <Plus size={18} />
                            <span>Add New Item</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E0E5F2' }}>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>SKU</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>PRODUCT NAME</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>CATEGORY</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>SUPPLIER</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>STOCK</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>PRICE</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>STATUS</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockData.map((item) => {
                                const statusStyle = getStatusColor(item.status);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F4F7FE' }}>
                                        <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>{item.sku}</td>
                                        <td style={{ padding: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>{item.name}</td>
                                        <td style={{ padding: '16px' }}>{item.category}</td>
                                        <td style={{ padding: '16px' }}>{item.supplier}</td>
                                        <td style={{ padding: '16px' }}>{item.stock}</td>
                                        <td style={{ padding: '16px' }}>{item.price}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: statusStyle.color,
                                                backgroundColor: statusStyle.bg
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div className="flex gap-sm">
                                                <button className="btn-icon">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholders */}
                <div className="flex justify-between items-center" style={{ marginTop: '20px', padding: '0 10px' }}>
                    <span className="text-sm">Showing 1-5 of 1,240 items</span>
                    <div className="flex gap-xs">
                        <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Previous</button>
                        <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Next</button>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="card flex col gap-md">
                <h3 className="text-md">Inventory Alerts</h3>
                <div className="flex col">
                    {stockData.filter(i => i.status !== 'In Stock').map(item => (
                        <div key={item.id} className="alert-item">
                            <div className="flex items-center gap-md">
                                <div style={{ background: '#FFF7E6', padding: '8px', borderRadius: '50%' }}>
                                    <AlertTriangle size={18} color="var(--color-warning)" />
                                </div>
                                <div>
                                    <p className="text-md" style={{ fontSize: '14px' }}>{item.name}</p>
                                    <p className="text-sm">{item.status} - Only {item.stock} remaining</p>
                                </div>
                            </div>
                            <button className="btn-ghost text-sm" style={{ padding: '6px 12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                                Reorder
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryModule;

