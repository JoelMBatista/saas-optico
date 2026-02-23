import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, currentModule, onChangeModule }) => {
    const getTitle = () => {
        switch (currentModule) {
            case 'pos': return 'Punto de Venta';
            case 'appointments': return 'Agenda';
            case 'inventory': return 'Inventario';
            case 'crm': return 'Pacientes & Rx';
            case 'engine': return 'Consultorio';
            case 'automation': return 'Automatización';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="app-container flex h-screen overflow-hidden bg-body">
            <Sidebar currentModule={currentModule} onChangeModule={onChangeModule} />

            <div className="main-content flex-1 col h-full overflow-hidden">
                <Header title={getTitle()} />

                <div className="content-scroll flex-1 overflow-y-auto" style={{ padding: '0 24px 24px 24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
