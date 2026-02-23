import React, { useState } from 'react';
import { PatientProvider } from './context/PatientContext';
import Layout from './components/Layout/Layout';
import InventoryModule from './pages/InventoryModule';
import CRMModule from './pages/CRMModule';
import OpticalEngineModule from './pages/OpticalEngineModule';
import AutomationModule from './pages/AutomationModule';

import DashboardModule from './pages/DashboardModule';
import AppointmentsModule from './pages/AppointmentsModule';
import POSModule from './pages/POSModule';

function App() {
    const [currentModule, setCurrentModule] = useState('inventory');
    const [consultationData, setConsultationData] = useState(null);

    const [crmActiveTab, setCrmActiveTab] = useState('patients');

    const handleStartConsultation = (data) => {
        setConsultationData(data);
        setCurrentModule('engine');
    };

    const renderModule = () => {
        switch (currentModule) {
            case 'dashboard': return <DashboardModule />;
            case 'pos': return <POSModule />;
            case 'appointments': return <AppointmentsModule />;
            case 'inventory': return <InventoryModule />;
            case 'crm': return (
                <CRMModule
                    onStartConsultation={handleStartConsultation}
                    initialTab={crmActiveTab}
                />
            );
            case 'engine': return (
                <OpticalEngineModule
                    patient={consultationData?.patient}
                    editMode={consultationData?.editMode}
                    readOnly={consultationData?.readOnly}
                    initialData={consultationData?.initialData}
                    onBack={(targetTab) => {
                        setConsultationData(null);
                        setCrmActiveTab(targetTab || 'patients');
                        setCurrentModule('crm');
                    }}
                />
            );
            case 'automation': return <AutomationModule />;
            default: return <DashboardModule />;
        }
    };

    return (
        <PatientProvider>
            <Layout
                currentModule={currentModule}
                onChangeModule={setCurrentModule}
            >
                {renderModule()}
            </Layout>
        </PatientProvider>
    );
}

export default App;
