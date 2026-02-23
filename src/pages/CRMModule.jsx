import React, { useState, useEffect } from 'react';
import { User, FileText, Plus, Search, Eye, Edit, Activity, ChevronDown, ChevronLeft, ChevronRight, Calendar, MessageCircle, Mail, Trash2, X, Save, Clock, Play, AlertCircle, Printer, ExternalLink } from 'lucide-react';
import OpticalEngineModule, { useOpticalEngine, OpticalEngineInput, OpticalEngineResult } from './OpticalEngineModule';
import StatusModal from '../components/ui/StatusModal';
import { usePatients } from '../context/PatientContext';
import { printPrescription, printLabOrder } from '../utils/printUtils';

// --- Sub-Components ---

// Patient Info Modal
const PatientInfoModal = ({ isOpen, patient, onClose }) => {
    if (!isOpen || !patient) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '32px',
                width: '90%', maxWidth: '600px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                maxHeight: '80vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2B3674' }}>Información del Paciente</h3>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>NOMBRE</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.name}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>CÉDULA</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.cedula || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>EDAD</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.age || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>TELÉFONO</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.phone || '--'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>EMAIL</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.email || '--'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>DIRECCIÓN</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.address || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>OCUPACIÓN</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.occupation || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>ÚLTIMA VISITA</label>
                        <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>{patient.lastControl || patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('es-ES') : '--'}</p>
                    </div>
                    {patient.notificationsEnabled && (
                        <div>
                            <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>NOTIFICACIONES</label>
                            <div className="flex gap-sm" style={{ marginTop: '4px' }}>
                                {patient.notifyWhatsapp && <MessageCircle size={18} color="var(--color-success)" />}
                                {patient.notifyEmail && <Mail size={18} color="var(--color-primary)" />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Clinical Data Modal
const ClinicalDataModal = ({ isOpen, patient, onClose, onEdit }) => {
    const [page, setPage] = useState(0);

    if (!isOpen || !patient) return null;

    // Mock History Data (Sorted Newest First)
    const history = [
        {
            id: 1,
            date: '15 Oct, 2023',
            type: 'Examen Visual Completo',
            specialist: 'Dr. Martinez',
            diagnosis: 'Miopía Simple OD / Astigmatismo OI',
            status: 'Finalizada',
            rx: {
                od: { sph: '-2.00', cyl: '-0.50', axis: '180', add: '+2.00' },
                oi: { sph: '-2.25', cyl: '-0.75', axis: '170', add: '+2.00' }
            }
        },
        {
            id: 2,
            date: '10 Sep, 2022',
            type: 'Renovación de Lentes',
            specialist: 'Dra. Lopez',
            diagnosis: 'Miopía Leve',
            status: 'Finalizada',
            rx: {
                od: { sph: '-1.50', cyl: '-0.50', axis: '180', add: '+1.75' },
                oi: { sph: '-1.75', cyl: '-0.50', axis: '175', add: '+1.75' }
            }
        },
        {
            id: 3,
            date: '05 Ene, 2021',
            type: 'Consulta General',
            specialist: 'Dr. Martinez',
            diagnosis: 'Control Rutinario',
            status: 'En Proceso', // Example for testing edit button visibility
            rx: null, // No Rx yet
            // SIMULATED PARTIAL STATE FOR "CONTINUAR EDICIÓN"
            detailedState: {
                triage: {
                    reason: 'Visión borrosa ocasional',
                    // Step 1 (Now Step 2 in UI? No, Triage is Step 2 based on previous code usually, but let's assume standard flow)
                    // Let's assume Triage is filled
                    ext_annexes: 'Sin particularidades',
                    ext_pupillary: 'Isocóricas',
                    ext_acc: 'Normal / Conservada',
                    ext_photomotor: 'Reactivo / Presente',
                    ext_consensual: 'Presente / Conservado',
                    // Partial Visual Acuity (Step 1 in new flow)
                    av_od_sc: '20/40', av_oi_sc: '20/50',
                    av_od_cc: '', av_oi_cc: '', // Incomplete
                    av_near_od_sc: '20/30', av_near_oi_sc: '20/30'
                },
                exam: {
                    // Empty for now, to trigger jump to this step or beyond
                },
                rx: {
                    od: { sph: '', cyl: '', axis: '' },
                    oi: { sph: '', cyl: '', axis: '' }
                }
            }
        },
    ];

    const currentRecord = history[page];

    const handlePrintReceta = () => {
        // Map currentRecord to expected format for printPrescription
        const printRx = currentRecord.rx;
        const printExam = { dip: '-', altura: '-' }; // Mock data doesn't have these, send placeholders
        
        // Ensure medications are sent explicitly if they exist in the record
        const printDiagnosis = { 
            plan: typeof currentRecord.diagnosis === 'string' ? currentRecord.diagnosis : currentRecord.diagnosis?.plan || 'Sin indicaciones.',
            medications: currentRecord.medications || [
                { name: "Systane Ultra", freq: "1 gota c/8h", duration: "1 mes" },
                { name: "Tobradex", freq: "1 gota c/12h", duration: "7 días" }
            ] // Added mock medications for demonstration from the history view
        }; 

        printPrescription(patient, printRx, printExam, printDiagnosis);
    };

    const handlePrintOrden = () => {
        // Map currentRecord to expected format for printLabOrder
        const printRx = currentRecord.rx;
        const printExam = { dip: '-', altura: '-' };
        const printDiagnosis = {
            lab_design: '-',
            lab_material: '-',
            lab_coating: '-'
        };

        printLabOrder(patient, printRx, printExam, printDiagnosis);
    };
    const totalPages = history.length;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '32px',
                width: '90%', maxWidth: '650px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2B3674' }}>Gestión Clínica</h3>
                        <p style={{ fontSize: '13px', color: '#A3AED0' }}>Historia #{currentRecord.id}</p>
                    </div>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex col gap-md">
                    {/* Record Info Header */}
                    <div className="flex justify-between items-center" style={{ padding: '16px', background: '#F4F7FE', borderRadius: '12px' }}>
                        <div className="flex items-center gap-md">
                            <div style={{ padding: '10px', background: 'white', borderRadius: '50%' }}>
                                <Calendar size={20} color="var(--color-primary)" />
                            </div>
                            <div>
                                <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px' }}>FECHA CONSULTA</label>
                                <p style={{ fontWeight: '700', color: '#2B3674', fontSize: '16px' }}>{currentRecord.date}</p>
                            </div>
                        </div>
                        <div className="flex col items-end">
                            <span style={{
                                fontSize: '12px',
                                background: currentRecord.status === 'Finalizada' ? '#E6FDF9' : '#FFF8E1',
                                color: currentRecord.status === 'Finalizada' ? 'var(--color-success)' : '#FFB547',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontWeight: '700',
                                marginBottom: '4px'
                            }}>
                                {currentRecord.status === 'Finalizada' ? 'FINALIZADA' : 'EN PROCESO'}
                            </span>
                            <span style={{ fontSize: '13px', color: '#A3AED0', fontWeight: '600' }}>{currentRecord.type}</span>
                        </div>
                    </div>

                    {/* Rx Grid & Diagnosis */}
                    <div className="card" style={{ padding: '24px', border: '1px solid #E0E5F2' }}>

                        {/* Diagnosis */}
                        <div style={{ marginBottom: '24px' }}>
                            <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px', display: 'block', marginBottom: '8px' }}>DIAGNÓSTICO PRINCIPAL</label>
                            <p style={{ fontWeight: '600', color: '#2B3674', fontSize: '15px', lineHeight: '1.5' }}>
                                {currentRecord.diagnosis}
                            </p>
                        </div>

                        {/* Rx Grid Compacto */}
                        {currentRecord.rx && (
                            <div>
                                <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600', fontSize: '11px', display: 'block', marginBottom: '12px' }}>FORMULA FINAL (RX)</label>
                                <div style={{ border: '1px solid #F4F7FE', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ background: '#F8F9FA' }}>
                                                <th style={{ padding: '10px', color: '#A3AED0', fontSize: '11px', fontWeight: '700' }}>OJO</th>
                                                <th style={{ padding: '10px', color: '#2B3674', fontWeight: '700' }}>ESFERA</th>
                                                <th style={{ padding: '10px', color: '#2B3674', fontWeight: '700' }}>CILINDRO</th>
                                                <th style={{ padding: '10px', color: '#2B3674', fontWeight: '700' }}>EJE</th>
                                                <th style={{ padding: '10px', color: '#2B3674', fontWeight: '700' }}>ADICIÓN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid #F4F7FE' }}>
                                                <td style={{ padding: '12px', fontWeight: '700', color: 'var(--color-primary)', background: '#F4F7FE' }}>OD</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.od.sph}</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.od.cyl}</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.od.axis}°</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.od.add}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '12px', fontWeight: '700', color: '#05CD99', background: '#E6FDF9' }}>OI</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.oi.sph}</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.oi.cyl}</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.oi.axis}°</td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#2B3674' }}>{currentRecord.rx.oi.add}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center" style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px solid #E0E5F2' }}>

                        {/* Pagination */}
                        <div className="flex gap-xs items-center">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="btn-icon"
                                style={{ width: '32px', height: '32px', opacity: page === 0 ? 0.5 : 1 }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2B3674', minWidth: '40px', textAlign: 'center' }}>
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="btn-icon"
                                style={{ width: '32px', height: '32px', opacity: page === totalPages - 1 ? 0.5 : 1 }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-sm">
                            {currentRecord.status === 'Finalizada' ? (
                                <>
                                    <button
                                        onClick={() => onEdit(currentRecord, true)}
                                        className="btn-ghost flex items-center gap-sm"
                                        title="Ver Detalles Completos"
                                    >
                                        <ExternalLink size={18} />
                                        <span className="hide-mobile">Detalles</span>
                                    </button>
                                    <button
                                        onClick={handlePrintReceta}
                                        className="btn-ghost flex items-center gap-sm"
                                        style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                    >
                                        <FileText size={18} />
                                        <span>Receta</span>
                                    </button>
                                    <button
                                        onClick={handlePrintOrden}
                                        className="btn-primary flex items-center gap-sm"
                                    >
                                        <Printer size={18} />
                                        <span>Orden Lab.</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => onEdit(currentRecord)}
                                    className="btn-primary flex items-center gap-sm"
                                    style={{ background: '#FFB547', color: 'black' }}
                                >
                                    <Edit size={16} />
                                    <span>Continuar Edición</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const PatientRxForm = ({ onBack }) => (
    <div className="flex col gap-lg fade-in" style={{ paddingBottom: '40px' }}>
        <div className="flex items-center gap-md">
            <button onClick={onBack} className="btn-icon" style={{ background: 'white' }}>
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-md" style={{ fontSize: '24px' }}>Formulario de Receta</h2>
        </div>
        <div className="card">
            <p>Contenido del formulario de receta...</p>
        </div>
    </div>
);

// Patient Profile Edit Page
const PatientProfile = ({ patient, onBack }) => {
    const { updatePatient } = usePatients();
    const [modalInfo, setModalInfo] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [formData, setFormData] = useState(patient || {});
    const [notificationsEnabled, setNotificationsEnabled] = useState(patient?.notificationsEnabled || false);
    const [notifyWhatsapp, setNotifyWhatsapp] = useState(patient?.notifyWhatsapp || false);
    const [notifyEmail, setNotifyEmail] = useState(patient?.notifyEmail || false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatCedula = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`;
    };

    const handleSave = () => {
        // Calculate age from birth date
        const calculateAge = (birthDate) => {
            if (!birthDate) return null;
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age + ' Años';
        };

        // Update patient data
        const updatedData = {
            ...formData,
            age: calculateAge(formData.birthDate),
            notificationsEnabled,
            notifyWhatsapp,
            notifyEmail
        };

        updatePatient(patient.id, updatedData);

        setModalInfo({
            isOpen: true,
            type: 'success',
            title: '¡Paciente Actualizado!',
            message: `Los datos de ${formData.name} se han actualizado correctamente.`
        });
    };

    return (
        <div className="flex col gap-md fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="flex items-center gap-md">
                <button onClick={onBack} className="btn-icon" style={{ background: 'white' }}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-md" style={{ fontSize: '24px' }}>Perfil del Paciente</h2>
            </div>

            {/* Top Info Cards */}
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '8px' }}>
                <div className="card h-full flex items-center" style={{ padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid #E0E5F2' }}>
                    <div className="flex items-center gap-sm">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#7551FF" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>ID Paciente:</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B3674' }}>{patient?.id || 'Generando...'}</span>
                        </div>
                    </div>
                </div>

                <div className="card h-full flex items-center" style={{ padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid #E0E5F2' }}>
                    <div className="flex items-center gap-sm">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={16} color="#7551FF" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Registro:</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B3674' }}>
                                {patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card h-full flex items-center" style={{ padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid #E0E5F2' }}>
                    <div className="flex items-center gap-sm">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={16} color="#7551FF" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Estado:</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#05CD99' }}>Registrado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Column 1: Datos Personales */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: '#2B3674' }}>Datos Personales</h3>
                    <div className="flex col gap-md">
                        <OutlinedInput
                            label="Nombre Completo"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Nombre completo del paciente"
                            required={true}
                        />
                        <OutlinedInput
                            label="Cédula"
                            value={formData.cedula || ''}
                            onChange={(e) => handleInputChange('cedula', formatCedula(e.target.value))}
                            placeholder="000-0000000-0"
                            required={true}
                        />
                        <OutlinedInput
                            label="Fecha de Nacimiento"
                            type="date"
                            value={formData.birthDate || ''}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            required={true}
                        />
                        <OutlinedSelect
                            label="Género"
                            value={formData.gender || 'Femenino'}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            options={['Femenino', 'Masculino']}
                        />
                        <OutlinedSelect
                            label="Estado Civil"
                            value={formData.civilStatus || 'Soltero/a'}
                            onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                            options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a']}
                        />
                        <OutlinedInput
                            label="Ocupación"
                            value={formData.occupation || ''}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            placeholder="Ej: Ingeniero"
                            required={true}
                        />
                        <OutlinedInput
                            label="Último Control"
                            type="date"
                            value={formData.lastControl || ''}
                            onChange={(e) => handleInputChange('lastControl', e.target.value)}
                        />
                        <OutlinedInput
                            label="Teléfono"
                            value={formData.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+52 (55) 0000 0000"
                            required={true}
                        />
                        <OutlinedInput
                            label="Correo Electrónico"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="cliente@email.com"
                            required={true}
                        />
                        <OutlinedInput
                            label="Dirección Completa"
                            value={formData.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Calle, Número, Colonia, Ciudad, Estado"
                            required={true}
                        />
                    </div>
                </div>

                {/* Column 2: Historial Médico */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: '#2B3674' }}>Historial Médico</h3>
                    <div className="flex col gap-md">
                        <OutlinedTextArea
                            label="Antecedentes Personales"
                            value={formData.personalHistory || ''}
                            onChange={(e) => handleInputChange('personalHistory', e.target.value)}
                            placeholder="Padre con hipertensión, madre con diabetes..."
                            rows={3}
                        />
                        <OutlinedTextArea
                            label="Antecedentes Familiares"
                            value={formData.familyHistory || ''}
                            onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                            placeholder="Alergia a la penicilina, no fumador..."
                            rows={3}
                        />
                        <OutlinedTextArea
                            label="Motivo de Consulta"
                            value={formData.consultationReason || ''}
                            onChange={(e) => handleInputChange('consultationReason', e.target.value)}
                            placeholder="Visión borrosa al leer..."
                            rows={2}
                        />
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#2B3674', marginBottom: '8px', display: 'block' }}>¿Es usuario de lentes?</label>
                            <div className="flex gap-md" style={{ marginTop: '8px' }}>
                                <label className="flex items-center gap-xs" style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="usesLenses"
                                        value="Si"
                                        checked={formData.usesLenses === 'Si'}
                                        onChange={(e) => handleInputChange('usesLenses', e.target.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '13px' }}>Sí</span>
                                </label>
                                <label className="flex items-center gap-xs" style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="usesLenses"
                                        value="No"
                                        checked={formData.usesLenses === 'No'}
                                        onChange={(e) => handleInputChange('usesLenses', e.target.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '13px' }}>No</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Receta Anterior & Notificaciones */}
                <div className="flex col gap-md">
                    <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Receta Anterior (Referencia)</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E0E5F2' }}>
                                        <th style={{ padding: '8px 4px', textAlign: 'left', color: '#4318FF', fontWeight: '700' }}></th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', color: '#4318FF', fontWeight: '700' }}>SPH</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', color: '#4318FF', fontWeight: '700' }}>CYL</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', color: '#4318FF', fontWeight: '700' }}>AXIS</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', color: '#4318FF', fontWeight: '700' }}>ADD</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', color: '#4318FF', fontWeight: '700' }}>PD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #F4F7FE' }}>
                                        <td style={{ padding: '8px 4px', fontWeight: '700', color: '#4318FF' }}>OD</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>-2.00</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>-0.50</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>180</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>+2.00</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>32</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 4px', fontWeight: '700', color: '#05CD99' }}>OS</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>-2.25</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>-0.75</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>170</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>+2.00</td>
                                        <td style={{ padding: '8px 4px', textAlign: 'center', color: '#2B3674', fontWeight: '600' }}>32</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Notificaciones</h3>
                        <div className="flex col gap-md">
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#A3AED0', marginBottom: '8px', display: 'block' }}>¿El paciente desea recibir notificaciones?</label>
                                <div className="flex items-center gap-sm" style={{ marginTop: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={notificationsEnabled}
                                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            {notificationsEnabled && (
                                <div className="flex col gap-sm">
                                    <div className="flex items-center gap-sm">
                                        <input
                                            type="checkbox"
                                            checked={notifyWhatsapp}
                                            onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <MessageCircle size={16} color="var(--color-success)" />
                                        <label style={{ fontSize: '13px' }}>WhatsApp</label>
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <input
                                            type="checkbox"
                                            checked={notifyEmail}
                                            onChange={(e) => setNotifyEmail(e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <Mail size={16} color="var(--color-primary)" />
                                        <label style={{ fontSize: '13px' }}>Correo Electrónico</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-between items-center" style={{ marginTop: '20px' }}>
                <button onClick={onBack} className="btn-ghost" style={{ padding: '12px 24px', fontSize: '14px' }}>
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-sm"
                    style={{ padding: '14px 32px', background: '#4318FF', fontSize: '14px', fontWeight: '600' }}
                >
                    Guardar Cambios
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Success Modal */}
            <StatusModal
                isOpen={modalInfo.isOpen}
                onClose={() => {
                    setModalInfo({ isOpen: false, type: 'success', title: '', message: '' });
                    onBack();
                }}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
            />
        </div>
    );
};

const PatientDetails = ({ patient, onBack }) => (
    <div className="flex col gap-lg fade-in" style={{ paddingBottom: '40px' }}>
        <div className="flex items-center gap-md">
            <button onClick={onBack} className="btn-icon" style={{ background: 'white' }}>
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-md" style={{ fontSize: '24px' }}>Detalles del Paciente: {patient?.name || 'Sin nombre'}</h2>
        </div>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {/* Personal Information Card */}
            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Información Personal</h3>
                <div className="flex col gap-md">
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Nombre Completo</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.name || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Cédula</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.cedula || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Edad</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.age || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Fecha de Nacimiento</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.birthDate || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Teléfono</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.phone || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Email</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.email || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Dirección</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.address || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Ocupación</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.occupation || '--'}</p>
                    </div>
                </div>
            </div>

            {/* Medical History Card */}
            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Historia Clínica</h3>
                <div className="flex col gap-md">
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Antecedentes Personales</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.personalHistory || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Antecedentes Familiares</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.familyHistory || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Motivo de Consulta</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.consultationReason || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Tipo de Consulta</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.consultationType || '--'}</p>
                    </div>
                    <div>
                        <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Usuario de Lentes</label>
                        <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient?.usesLenses || '--'}</p>
                    </div>
                </div>
            </div>

            {/* Notifications Card */}
            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Preferencias de Notificación</h3>
                <div className="flex col gap-md">
                    <div className="flex items-center gap-sm">
                        <MessageCircle size={18} color={patient?.notifyWhatsapp ? 'var(--color-success)' : '#A3AED0'} />
                        <span style={{ fontWeight: '600', color: patient?.notifyWhatsapp ? '#2B3674' : '#A3AED0' }}>
                            WhatsApp: {patient?.notifyWhatsapp ? 'Activado' : 'Desactivado'}
                        </span>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Mail size={18} color={patient?.notifyEmail ? 'var(--color-primary)' : '#A3AED0'} />
                        <span style={{ fontWeight: '600', color: patient?.notifyEmail ? '#2B3674' : '#A3AED0' }}>
                            Email: {patient?.notifyEmail ? 'Activado' : 'Desactivado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Appointment Card */}
            {patient?.appointment && (
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#2B3674' }}>Cita Programada</h3>
                    <div className="flex col gap-md">
                        <div>
                            <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Fecha</label>
                            <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient.appointment.date || '--'}</p>
                        </div>
                        <div>
                            <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Hora</label>
                            <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient.appointment.time || '--'}</p>
                        </div>
                        <div>
                            <label className="text-sm" style={{ color: '#A3AED0', fontWeight: '600' }}>Especialista</label>
                            <p style={{ fontWeight: '600', color: '#2B3674' }}>{patient.appointment.specialist || '--'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);


import { OutlinedInput, OutlinedSelect, OutlinedTextArea } from '../components/ui/FormElements';

const PatientWizard = ({ onBack, editMode = false, initialData = null }) => {
    const [step, setStep] = useState(1);
    const engine = useOpticalEngine();
    const { addPatient, updatePatient } = usePatients();
    const [modalInfo, setModalInfo] = useState({ isOpen: false, type: 'error', title: '', message: '' });

    // State for Appointment Step
    const [apptDate, setApptDate] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [specialist, setSpecialist] = useState('Dr. Martinez (Optometría)');
    const [apptType, setApptType] = useState('Examen Visual Completo');

    // Notification State
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
    const [notifyEmail, setNotifyEmail] = useState(true);

    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

    // Step 1 Form Data - Initialize with initialData if in edit mode
    const [formData, setFormData] = useState(initialData || {
        name: '',
        birthDate: '',
        gender: 'Femenino',
        civilStatus: 'Soltero/a',
        phone: '',
        email: '',
        address: '',
        occupation: '',
        lastControl: '',
        cedula: '',
        personalHistory: '',
        familyHistory: '',
        consultationReason: '',
        usesLenses: 'No',
        lensesDuration: '',
        lastRx: '',
        previousRx: {
            od: { sph: '', cyl: '', axis: '', add: '', pd: '' },
            os: { sph: '', cyl: '', axis: '', add: '', pd: '' }
        }
    });

    const formatCedula = (value) => {
        const digits = value.replace(/\D/g, '');
        const truncated = digits.slice(0, 11);
        if (truncated.length <= 3) return truncated;
        if (truncated.length <= 10) return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
        return `${truncated.slice(0, 3)}-${truncated.slice(3, 10)}-${truncated.slice(10)}`;
    };

    const handleCedulaChange = (e) => {
        const formatted = formatCedula(e.target.value);
        setFormData(prev => ({ ...prev, cedula: formatted }));
    };

    const handleFuncChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRxChange = (eye, field, value) => {
        setFormData(prev => ({
            ...prev,
            previousRx: {
                ...prev.previousRx,
                [eye]: {
                    ...prev.previousRx?.[eye],
                    [field]: value
                }
            }
        }));
    };

    const handleSave = () => {
        // Validation Logic
        const requiredFields = [
            { field: 'name', label: 'Nombre Completo' },
            { field: 'cedula', label: 'Cédula' },
            { field: 'birthDate', label: 'Fecha de Nacimiento' },
            { field: 'phone', label: 'Teléfono' },
            { field: 'email', label: 'Correo Electrónico' },
            { field: 'address', label: 'Dirección Completa' },
            { field: 'occupation', label: 'Ocupación' }
        ];

        const missing = requiredFields.find(f => !formData[f.field] || formData[f.field].trim() === '');

        if (missing) {
            setModalInfo({
                isOpen: true,
                type: 'error',
                title: 'Información Incompleta',
                message: `El campo "${missing.label}" es obligatorio. Por favor complete la información del paciente antes de continuar.`
            });
            return;
        }

        // Calculate age from birth date
        const calculateAge = (birthDate) => {
            if (!birthDate) return null;
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age + ' Años';
        };

        // Save patient data
        const patientData = {
            ...formData,
            age: calculateAge(formData.birthDate),
            notificationsEnabled,
            notifyWhatsapp,
            notifyEmail,
            appointment: null // Appointment scheduling moved to Calendar
        };

        addPatient(patientData);

        setModalInfo({
            isOpen: true,
            type: 'success',
            title: '¡Paciente Guardado!',
            message: `El perfil de ${formData.name} se ha guardado correctamente.`
        });
    };

    // Handler for saving in edit mode
    // Handler for saving in edit mode
    const handleSaveEdit = () => {
        // Check for changes
        const hasChanges = Object.keys(formData).some(key => {
            // Skip appointment field if it doesn't exist in one or both, or handle specially
            if (key === 'appointment') return false;
            return formData[key] !== initialData[key];
        });

        // Also check notification settings
        const notificationsChanged =
            notificationsEnabled !== (initialData.notificationsEnabled || false) ||
            notifyWhatsapp !== (initialData.notifyWhatsapp || true) || // Assuming default true map to initial
            notifyEmail !== (initialData.notifyEmail || true);

        if (!hasChanges && !notificationsChanged) {
            setModalInfo({
                isOpen: true,
                type: 'info',
                title: 'Sin Cambios',
                message: 'No has realizado ningún cambio en la información del paciente.'
            });
            return;
        }

        // Calculate age from birth date
        const calculateAge = (birthDate) => {
            if (!birthDate) return null;
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age + ' Años';
        };

        // Update patient data
        const updatedData = {
            ...formData,
            age: calculateAge(formData.birthDate),
            notificationsEnabled,
            notifyWhatsapp,
            notifyEmail
        };

        updatePatient(initialData.id, updatedData);

        setModalInfo({
            isOpen: true,
            type: 'success',
            title: '¡Paciente Actualizado!',
            message: `Los datos de ${formData.name} se han actualizado correctamente.`
        });
    };



    return (
        <div className="flex col gap-md fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header with Steps Indicator */}
            {/* Header with Steps Indicator */}
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-md">
                    <button onClick={onBack} className="btn-icon" style={{ background: 'white' }}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-md" style={{ fontSize: '24px' }}>
                            {editMode ? 'Editar Paciente' : 'Agregar Paciente'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS (Persistent) */}
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div className="card flex items-center gap-md" style={{ padding: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(67, 24, 255, 0.1)', color: 'var(--color-primary)' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-sm">ID Paciente</p>
                        <h3 className="text-md" style={{ fontSize: '18px' }}>{editMode && initialData?.id ? initialData.id : 'Generando...'}</h3>
                    </div>
                </div>
                <div className="card flex items-center gap-md" style={{ padding: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: '#E6FDF9', color: 'var(--color-success)' }}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm">Fecha de Registro</p>
                        <h3 className="text-md" style={{ fontSize: '18px' }}>{editMode && initialData?.registrationDate ? initialData.registrationDate : '15 Oct, 2023'}</h3>
                    </div>
                </div>
                <div className="card flex items-center gap-md" style={{ padding: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: '#F2EFFF', color: '#7551FF' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm">Estado</p>
                        <h3 className="text-md" style={{ fontSize: '18px' }}>{editMode ? 'Registrado' : 'Nuevo Ingreso'}</h3>
                    </div>
                </div>
            </div>

            {/* PATIENT PROFILE FORM */}
            <div className="flex col gap-md fade-in" style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>

                    {/* LEFT COLUMN: Personal Data */}
                    <div className="card fade-in" style={{ padding: '24px' }}>
                        <h3 className="text-md" style={{ marginBottom: '16px', color: 'var(--color-text-main)', borderBottom: '1px solid #F4F7FE', paddingBottom: '8px' }}>
                            Datos Personales
                        </h3>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <OutlinedInput
                                    label="Nombre Completo"
                                    placeholder="Nombre completo del paciente"
                                    value={formData.name}
                                    onChange={(e) => handleFuncChange('name', e.target.value)}
                                />
                            </div>
                            <OutlinedInput
                                label="Cédula"
                                placeholder="000-0000000-0"
                                value={formData.cedula}
                                onChange={handleCedulaChange}
                            />
                            <OutlinedInput
                                label="Fecha de Nacimiento"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleFuncChange('birthDate', e.target.value)}
                                icon={<Calendar size={18} />}
                            />
                            <OutlinedSelect
                                label="Género"
                                options={['Femenino', 'Masculino', 'No Binario', 'Otro']}
                                value={formData.gender}
                                onChange={(e) => handleFuncChange('gender', e.target.value)}
                            />
                            <OutlinedSelect
                                label="Estado Civil"
                                options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a']}
                                value={formData.civilStatus}
                                onChange={(e) => handleFuncChange('civilStatus', e.target.value)}
                            />
                            <OutlinedInput
                                label="Ocupación"
                                placeholder="Ej. Ingeniero"
                                value={formData.occupation}
                                onChange={(e) => handleFuncChange('occupation', e.target.value)}
                            />
                            <OutlinedInput
                                label="Último Control"
                                type="date"
                                value={formData.lastControl}
                                onChange={(e) => handleFuncChange('lastControl', e.target.value)}
                                icon={<Activity size={18} />}
                                required={false}
                            />
                            <OutlinedInput
                                label="Teléfono"
                                type="tel"
                                placeholder="+52 (55) 0000 0000"
                                value={formData.phone}
                                onChange={(e) => handleFuncChange('phone', e.target.value)}
                                icon={notificationsEnabled && notifyWhatsapp ? <MessageCircle size={18} color="var(--color-success)" /> : null}
                            />
                            <OutlinedInput
                                label="Correo Electrónico"
                                type="email"
                                placeholder="cliente@email.com"
                                value={formData.email}
                                onChange={(e) => handleFuncChange('email', e.target.value)}
                                icon={notificationsEnabled && notifyEmail ? <Mail size={18} color="var(--color-primary)" /> : null}
                            />
                            <div style={{ gridColumn: 'span 2' }}>
                                <OutlinedInput
                                    label="Dirección Completa"
                                    placeholder="Calle, Número, Colonia, Ciudad, Estado"
                                    value={formData.address}
                                    onChange={(e) => handleFuncChange('address', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-md" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4F7FE' }}>
                            <button onClick={onBack} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>Cancelar</button>
                            {editMode ? (
                                <button onClick={handleSaveEdit} className="btn-primary flex items-center gap-sm" style={{ padding: '10px 24px', fontSize: '13px' }}>
                                    <Save size={16} />
                                    <span>Guardar Cambios</span>
                                </button>
                            ) : (
                                <button onClick={handleSave} className="btn-primary flex items-center gap-sm" style={{ padding: '10px 24px', fontSize: '13px' }}>
                                    <Save size={16} />
                                    <span>Guardar Paciente</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Medical History & Rx */}
                    {/* Medical History */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 className="text-md" style={{ marginBottom: '20px', borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>
                            Historial Médico
                        </h3>
                        <div className="flex col gap-lg" style={{ gap: '24px' }}>
                            <OutlinedTextArea
                                label="Antecedentes Personales"
                                placeholder="Padre con hipertensión, madre con diabetes..."
                                value={formData.personalHistory}
                                onChange={(e) => handleFuncChange('personalHistory', e.target.value)}
                                rows={2}
                            />
                            <OutlinedTextArea
                                label="Antecedentes Familiares"
                                placeholder="Alergia a la penicilina, no fumador..."
                                value={formData.familyHistory}
                                onChange={(e) => handleFuncChange('familyHistory', e.target.value)}
                                rows={2}
                            />
                            <OutlinedTextArea
                                label="Motivo de Consulta"
                                placeholder="Visión borrosa al leer..."
                                value={formData.consultationReason}
                                onChange={(e) => handleFuncChange('consultationReason', e.target.value)}
                                rows={2}
                            />

                            {/* Lens Usage Section */}
                            <div className="flex col gap-sm" style={{ marginTop: '8px', padding: '16px', background: '#F8F9FA', borderRadius: '12px' }}>
                                <div className="flex items-center gap-md">
                                    <label className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>¿Es usuario de lentes?</label>
                                    <div className="flex items-center gap-md">
                                        <label className="flex items-center gap-xs cursor-pointer">
                                            <input
                                                type="radio"
                                                name="usesLenses"
                                                value="si"
                                                checked={formData.usesLenses === 'si'}
                                                onChange={(e) => handleFuncChange('usesLenses', e.target.value)}
                                                style={{ accentColor: 'var(--color-primary)' }}
                                            />
                                            <span className="text-sm">Si</span>
                                        </label>
                                        <label className="flex items-center gap-xs cursor-pointer">
                                            <input
                                                type="radio"
                                                name="usesLenses"
                                                value="no"
                                                checked={formData.usesLenses === 'no'}
                                                onChange={(e) => handleFuncChange('usesLenses', e.target.value)}
                                                style={{ accentColor: 'var(--color-primary)' }}
                                            />
                                            <span className="text-sm">No</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.usesLenses === 'si' && (
                                    <div className="grid fade-in" style={{ gridTemplateColumns: '1fr', gap: '60px', marginTop: '32px' }}>
                                        <OutlinedInput
                                            label="Tiempo"
                                            placeholder="Ej. 5 AÑOS"
                                            value={formData.lensesDuration}
                                            onChange={(e) => handleFuncChange('lensesDuration', e.target.value)}
                                            required={false}
                                        />
                                        <OutlinedInput
                                            label="T/Últimos lentes"
                                            placeholder="Ej. 2 AÑOS"
                                            value={formData.lastLensesDuration}
                                            onChange={(e) => handleFuncChange('lastLensesDuration', e.target.value)}
                                            required={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* RIGHT COLUMN: Previous Rx & Notifications */}
                    <div className="flex col gap-md">
                        {/* Previous Rx */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 className="text-md" style={{ marginBottom: '20px', borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>
                                Receta Anterior (Referencia)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(5, 1fr)', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                                <div></div>
                                <div className="text-sm" style={{ fontSize: '11px', color: '#A3AED0', fontWeight: 'bold' }}>SPH</div>
                                <div className="text-sm" style={{ fontSize: '11px', color: '#A3AED0', fontWeight: 'bold' }}>CYL</div>
                                <div className="text-sm" style={{ fontSize: '11px', color: '#A3AED0', fontWeight: 'bold' }}>AXIS</div>
                                <div className="text-sm" style={{ fontSize: '11px', color: '#A3AED0', fontWeight: 'bold' }}>ADD</div>
                                <div className="text-sm" style={{ fontSize: '11px', color: '#A3AED0', fontWeight: 'bold' }}>PD</div>

                                <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '12px' }}>OD</div>
                                {['sph', 'cyl', 'axis', 'add', 'pd'].map((field) => (
                                    <input
                                        key={`od-${field}`}
                                        type="text"
                                        value={formData.previousRx?.od?.[field] || ''}
                                        onChange={(e) => handleRxChange('od', field, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 4px',
                                            background: '#F4F7FE',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            border: '1px solid transparent',
                                            textAlign: 'center',
                                            outline: 'none'
                                        }}
                                        placeholder="--"
                                    />
                                ))}

                                <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '12px' }}>OS</div>
                                {['sph', 'cyl', 'axis', 'add', 'pd'].map((field) => (
                                    <input
                                        key={`os-${field}`}
                                        type="text"
                                        value={formData.previousRx?.os?.[field] || ''}
                                        onChange={(e) => handleRxChange('os', field, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 4px',
                                            background: '#F4F7FE',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            border: '1px solid transparent',
                                            textAlign: 'center',
                                            outline: 'none'
                                        }}
                                        placeholder="--"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: notificationsEnabled ? '20px' : '0' }}>
                                <div>
                                    <h3 className="text-md" style={{ color: 'var(--color-text-main)' }}>Notificaciones</h3>
                                    <p className="text-sm text-secondary" style={{ fontSize: '12px' }}>¿El paciente desea recibir recordatorios?</p>
                                </div>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                                    <input
                                        type="checkbox"
                                        checked={notificationsEnabled}
                                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: notificationsEnabled ? 'var(--color-primary)' : '#ccc',
                                        transition: '.4s',
                                        borderRadius: '34px'
                                    }}></span>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '16px',
                                        width: '16px',
                                        left: notificationsEnabled ? '20px' : '4px',
                                        bottom: '3px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%'
                                    }}></span>
                                </label>
                            </div>

                            {notificationsEnabled && (
                                <div className="grid fade-in" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fadeIn 0.3s ease-in-out' }}>
                                    {/* Whatsapp Option */}
                                    <div
                                        onClick={() => setNotifyWhatsapp(!notifyWhatsapp)}
                                        className="flex items-center gap-sm cursor-pointer"
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: notifyWhatsapp ? '1px solid var(--color-success)' : '1px solid #E0E5F2',
                                            background: notifyWhatsapp ? '#E6FDF9' : 'white',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            color: notifyWhatsapp ? 'var(--color-success)' : '#A3AED0',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            background: 'white'
                                        }}>
                                            <MessageCircle size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: notifyWhatsapp ? 'var(--color-success)' : 'var(--color-text-main)' }}>WhatsApp</p>
                                            <p style={{ fontSize: '11px', color: notifyWhatsapp ? 'var(--color-success)' : '#A3AED0', opacity: 0.8 }}>Mensajes directos</p>
                                        </div>
                                    </div>

                                    {/* Email Option */}
                                    <div
                                        onClick={() => setNotifyEmail(!notifyEmail)}
                                        className="flex items-center gap-sm cursor-pointer"
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: notifyEmail ? '1px solid var(--color-primary)' : '1px solid #E0E5F2',
                                            background: notifyEmail ? '#F4F7FE' : 'white',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            color: notifyEmail ? 'var(--color-primary)' : '#A3AED0',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            background: 'white'
                                        }}>
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: notifyEmail ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Email</p>
                                            <p style={{ fontSize: '11px', color: notifyEmail ? 'var(--color-primary)' : '#A3AED0', opacity: 0.8 }}>Boletines y citas</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </div>

            {/* Modal for Validation */}
            {/* Modal for Validation */}
            <StatusModal
                isOpen={modalInfo.isOpen}
                onClose={() => {
                    setModalInfo(prev => ({ ...prev, isOpen: false }));
                    if (modalInfo.type === 'success') {
                        onBack();
                    }
                }}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
            />
        </div >
    );
};

// --- Main Module ---

const CRMModule = ({ onStartConsultation, initialTab }) => {
    const [view, setView] = useState(initialTab === 'appointments' ? 'appointments' : 'list');
    const [activeTab, setActiveTab] = useState(initialTab === 'appointments' ? 'Próximas citas' : 'Todos los pacientes');

    useEffect(() => {
        if (initialTab) {
            if (initialTab === 'appointments') {
                setView('appointments');
                setActiveTab('Próximas citas');
            } else {
                setView('list');
                setActiveTab('Todos los pacientes');
            }
        }
    }, [initialTab]);
    const { getAllPatients, deletePatient } = usePatients();
    const [modalInfo, setModalInfo] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, patientId: null, patientName: '' });
    const [selectedPatientForView, setSelectedPatientForView] = useState(null);
    const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);
    const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
    const [showClinicalModal, setShowClinicalModal] = useState(false);
    const [clinicalPatient, setClinicalPatient] = useState(null);

    // Get real patients from context
    // Get real patients from context
    const patients = getAllPatients() || [];

    // --- MOCK DATA ENRICHMENT FOR VISUALIZATION ---
    // Create a derived list with mock appointment attributes for the "Próximas citas" tab
    const getEnrichedPatients = () => {
        if (activeTab !== 'Próximas citas') return patients;

        return patients.map((p, index) => {
            // Generate deterministic mock date/time based on index
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + (index % 5)); // Spread over next 5 days

            const hours = 9 + (index % 8); // 9 AM to 4 PM
            const minutes = (index % 2) * 30; // 00 or 30
            futureDate.setHours(hours, minutes, 0, 0);

            const statusOptions = ['Pendiente', 'Confirmado', 'Confirmado', 'Cancelado'];
            const status = statusOptions[index % 4];

            return {
                ...p,
                apptDate: futureDate,
                apptStatus: status,
                apptReason: ["Examen Visual Completo", "Ajuste de Montura", "Entrega de Lentes", "Consulta General"][index % 4]
            };
        }).sort((a, b) => a.apptDate - b.apptDate); // Sort Chronologically
    };

    const displayedPatients = getEnrichedPatients();

    const tabs = ['Todos los pacientes', 'Recientes', 'Próximas citas', 'Necesita seguimiento'];

    const handleAddPatient = () => {
        setView('record');
    };

    const handleViewDetails = (patient) => {
        setSelectedPatientForView(patient);
        setShowPatientInfoModal(true);
    };

    const handleEdit = (patient) => {
        setSelectedPatientForEdit(patient);
        setView('edit');
    };

    const handleClinicalManagement = (patient) => {
        setClinicalPatient(patient);
        setShowClinicalModal(true);
    };

    const handleEditInMotorOptico = (record, isReadOnly = false) => {
        setShowClinicalModal(false);

        // Construct initialData from the record if detailedState is not present
        let initialData = record.detailedState || null;

        if (!initialData && record.rx) {
            // Map legacy/simple record format to Optical Engine state structure
            initialData = {
                triage: { reason: record.type || '' },
                exam: {
                    // Default or map if available in record
                    dip: record.exam?.dip || '',
                    altura: record.exam?.altura || ''
                },
                rx: record.rx || { od: {}, oi: {} },
                diagnosis: {
                    diagnosisMain: record.diagnosis || '',
                    plan: record.plan || ''
                }
            };
        }

        // Use global navigation to switch to Optical Engine Module
        if (onStartConsultation) {
            onStartConsultation({
                patient: clinicalPatient, // Use the currently selected clinical patient
                editMode: true,
                readOnly: isReadOnly,
                initialData: initialData
            });
        }
    };

    const handleStartConsultation = (patient) => {
        if (onStartConsultation) {
            onStartConsultation({
                patient: patient,
                editMode: false,
                initialData: null
            });
        } else {
            console.warn("Navigation function not provided to CRMModule");
            // Fallback or error handling if needed, though App.jsx should provide it.
        }
    };

    if (view === 'record') return <PatientWizard onBack={() => setView('list')} />;
    if (view === 'edit') return <PatientWizard editMode={true} initialData={selectedPatientForEdit} onBack={() => setView('list')} />;



    // View: optical_edit removed as we now use global module navigation
    if (view === 'form') return <PatientRxForm onBack={() => setView('list')} />;
    if (view === 'details') return <PatientDetails patient={selectedPatientForView} onBack={() => setView('list')} />;

    return (
        <div className="flex col gap-lg" style={{ paddingBottom: '80px' }}>
            {/* Header Section */}
            <div className="flex justify-between items-center wrap gap-md">
                <h2 className="text-md" style={{ fontSize: '24px', flexShrink: 0 }}>Gestión de Pacientes</h2>

                <div className="flex items-center flex-1 justify-end gap-xl" style={{ minWidth: '0' }}>
                    <div className="input-group" style={{ maxWidth: '400px', width: '100%', marginRight: 'auto' }}>
                        <Search size={18} className="input-icon" />
                        <input type="text" placeholder="Buscar por nombre, ID o teléfono..." className="w-full input-with-icon" />
                    </div>
                    <button onClick={handleAddPatient} className="btn-primary flex items-center gap-sm" style={{ background: '#7551FF', whiteSpace: 'nowrap', marginLeft: '24px' }}>
                        <Plus size={18} />
                        <span>Añadir Nuevo Paciente</span>
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="card flex col gap-md">
                {/* Tabs */}
                <div className="tab-group" style={{ marginBottom: '10px' }}>
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

                {/* Patient List Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E0E5F2' }}>
                                {activeTab === 'Todos los pacientes' && (
                                    <>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>IDENTIFICACIÓN / CONTACTO</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>DATOS DEMOGRÁFICOS</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>HISTORIAL CLÍNICO</th>
                                    </>
                                )}
                                {activeTab === 'Próximas citas' && (
                                    <>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>PACIENTE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>FECHA Y HORA</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>MOTIVO</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>ESTADO CONFIRMACIÓN</th>
                                    </>
                                )}
                                {activeTab === 'Necesita seguimiento' && (
                                    <>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>PACIENTE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>MOTIVO DE ALERTA</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>ESTADO</th>
                                    </>
                                )}
                                <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold', textAlign: 'left', minWidth: '120px' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPatients.map((p, index) => {
                                // Mock Data Generation for new columns
                                const mockTime = ["09:00 AM", "10:30 AM", "03:00 PM", "04:15 PM"][index % 4];
                                const mockReason = ["Examen Visual Completo", "Ajuste de Montura", "Entrega de Lentes", "Consulta General"][index % 4];
                                const mockAlert = ["Control Anual", "Retiro de Lentes", "Revisión Glaucoma", "Pendiente Pago"][index % 4];
                                const mockStatus = ["Vencido hace 3 días", "Programado para mañana", "Sin confirmar", "Urgente"][index % 4];
                                const mockCedula = `001-${Math.floor(Math.random() * 1000000)}-${index}`;

                                // Helper for Rx Formatting
                                const formatRx = (patient) => {
                                    if (!patient.rx && !patient.lastRx) return "Sin registro reciente";
                                    // Assuming patient.rx might be an object or string. 
                                    // If object structure matches OpticalEngine: { od: {sph...}, oi: {sph...} }
                                    // For now, if it's a string, return as is (or parse if needed).
                                    // If it's undefined, use mock or empty.

                                    // Attempt to read from a hypothetical structured Rx or fallback to string
                                    const rxData = patient.currentRx || patient.rx;

                                    if (typeof rxData === 'object' && rxData !== null) {
                                        const od = rxData.od ? `OD: ${rxData.od.sph || '0.00'}` : '';
                                        const oi = rxData.oi ? `OI: ${rxData.oi.sph || '0.00'}` : '';
                                        return `${od} | ${oi}`;
                                    }
                                    return rxData || "OD: -0.50 | OI: -0.75"; // Default mock if empty for visualization
                                };

                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #F4F7FE' }}>

                                        {/* --- VIEW: TODOS LOS PACIENTES --- */}
                                        {activeTab === 'Todos los pacientes' && (
                                            <>
                                                {/* Identification (Cleaned) */}
                                                <td style={{ padding: '16px' }}>
                                                    <div className="flex items-center gap-md">
                                                        <div style={{ width: '40px', height: '40px', background: '#F4F7FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <User size={20} color="var(--color-primary)" />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{p.name}</p>
                                                            <div className="flex items-center gap-xs">
                                                                <span className="text-sm" style={{ fontSize: '11px', color: '#A3AED0' }}>
                                                                    {p.phone || `C.I. ${mockCedula}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Demographics (Fixed Age Text) */}
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>
                                                        {p.age ? p.age : 'N/A'}, {p.gender || 'Sin especificar'}
                                                    </div>
                                                </td>

                                                {/* Clinical History (Formatted Rx) */}
                                                <td style={{ padding: '16px' }}>
                                                    <div className="flex col gap-xs">
                                                        <div className="flex items-center gap-xs">
                                                            <span className="text-sm">Última Visita:</span>
                                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>{p.lastVisit || 'No registrada'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-xs">
                                                            <span className="text-sm">Rx:</span>
                                                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-primary)' }}>
                                                                {formatRx(p)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {/* --- VIEW: PRÓXIMAS CITAS --- */}
                                        {activeTab === 'Próximas citas' && (
                                            <>
                                                <td style={{ padding: '16px' }}>
                                                    <div className="flex items-center gap-md">
                                                        <div style={{ width: '40px', height: '40px', background: '#E6FDF9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Calendar size={20} color="var(--color-success)" />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{p.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Fecha y Hora (Time First, Date Below) */}
                                                <td style={{ padding: '16px' }}>
                                                    <div className="flex col gap-xs">
                                                        <div className="flex items-center gap-xs" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)' }}>
                                                            <Clock size={14} />
                                                            <span>
                                                                {p.apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#A3AED0', fontWeight: '500', textTransform: 'capitalize' }}>
                                                            {p.apptDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>{p.apptReason}</span>
                                                </td>
                                                {/* Estado de Confirmación */}
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        background: p.apptStatus === 'Confirmado' ? '#E6FDF9' :
                                                            p.apptStatus === 'Pendiente' ? '#FFF8E1' : '#FFF5F5',
                                                        color: p.apptStatus === 'Confirmado' ? 'var(--color-success)' :
                                                            p.apptStatus === 'Pendiente' ? '#FFB547' : '#FF5B5B'
                                                    }}>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'currentColor'
                                                        }}></div>
                                                        {p.apptStatus}
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {/* --- VIEW: NECESITA SEGUIMIENTO --- */}
                                        {activeTab === 'Necesita seguimiento' && (
                                            <>
                                                <td style={{ padding: '16px' }}>
                                                    <div className="flex items-center gap-md">
                                                        <div style={{ width: '40px', height: '40px', background: '#FFF4E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <AlertCircle size={20} color="#FF9800" />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{p.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', background: '#FFF4E5', color: '#FF9800', fontSize: '11px', fontWeight: 'bold' }}>
                                                        {mockAlert}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ fontSize: '13px', color: '#FF5B5B', fontWeight: '500' }}>{mockStatus}</span>
                                                </td>
                                            </>
                                        )}


                                        {/* --- ACTIONS COLUMN (Dynamic per View) --- */}
                                        <td style={{ padding: '16px' }}>
                                            <div className="flex gap-sm justify-start">
                                                {activeTab === 'Todos los pacientes' ? (
                                                    <>
                                                        <button className="btn-icon" title="Ver Detalles" onClick={() => handleViewDetails(p)}>
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="btn-icon" title="Editar" onClick={() => handleEdit(p)}>
                                                            <Edit size={18} />
                                                        </button>
                                                        <button className="btn-icon" title="Gestión Clínica" onClick={() => handleClinicalManagement(p)}>
                                                            <Activity size={18} />
                                                        </button>
                                                        {p.phone && (
                                                            <a href={`https://wa.me/${p.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(p.name)},%20nos%20comunicamos%20de%20SaaS%20%C3%93ptico%20Cloud.`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Enviar WhatsApp" style={{ color: '#25D366' }}>
                                                                <MessageCircle size={18} />
                                                            </a>
                                                        )}
                                                        {p.email && (
                                                            <a href={`mailto:${p.email}?subject=Información%20de%20su%20consulta`} className="btn-icon" title="Enviar Email" style={{ color: '#4285F4' }}>
                                                                <Mail size={18} />
                                                            </a>
                                                        )}
                                                        <button className="btn-icon" title="Eliminar" onClick={() => setDeleteConfirm({ isOpen: true, patientId: p.id, patientName: p.name })} style={{ color: '#FF5B5B' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : activeTab === 'Próximas citas' ? (
                                                    <>
                                                        <button
                                                            className={`btn-primary ${p.apptStatus !== 'Confirmado' ? 'disabled' : ''}`}
                                                            disabled={p.apptStatus !== 'Confirmado'}
                                                            style={{
                                                                padding: '6px 12px',
                                                                fontSize: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                opacity: p.apptStatus !== 'Confirmado' ? 0.5 : 1,
                                                                cursor: p.apptStatus !== 'Confirmado' ? 'not-allowed' : 'pointer',
                                                                background: p.apptStatus !== 'Confirmado' ? '#A3AED0' : ''
                                                            }}
                                                            onClick={() => handleStartConsultation(p)}
                                                        >
                                                            <Play size={14} /> Iniciar Consulta
                                                        </button>
                                                        {p.phone && (
                                                            <a href={`https://wa.me/${p.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(p.name)},%20le%20escribimos%20para%20recordarle%20su%20cita%20el%20d%C3%ADa%20${p.apptDate.toLocaleDateString('es-ES')}%20a%20las%20${p.apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}.`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Recordatorio WhatsApp" style={{ border: '1px solid #E0E5F2', background: 'white', color: '#25D366' }}>
                                                                <MessageCircle size={18} />
                                                            </a>
                                                        )}
                                                    </>
                                                ) : activeTab === 'Necesita seguimiento' ? (
                                                    <button
                                                        className="btn-icon"
                                                        title="Enviar Recordatorio"
                                                        style={{ background: 'var(--color-success)', color: 'white', border: 'none' }}
                                                        onClick={() => setModalInfo({
                                                            isOpen: true,
                                                            type: 'info',
                                                            title: 'Enviar Recordatorio',
                                                            message: `Seleccione el método de envío para ${p.name} (WhatsApp / Email).`
                                                        })}
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '20px', gap: '8px' }}>
                    <p className="text-sm">Mostrando {displayedPatients.length} paciente{displayedPatients.length !== 1 ? 's' : ''}</p>
                </div>
            </div>


            {/* Patient Info Modal */}
            <PatientInfoModal
                isOpen={showPatientInfoModal}
                patient={selectedPatientForView}
                onClose={() => setShowPatientInfoModal(false)}
            />

            {/* Clinical Data Modal */}
            <ClinicalDataModal
                isOpen={showClinicalModal}
                patient={clinicalPatient}
                onClose={() => setShowClinicalModal(false)}
                onEdit={handleEditInMotorOptico}
            />

            {/* Delete Confirmation Modal */}
            <StatusModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, patientId: null, patientName: '' })}
                title="¿Eliminar Paciente?"
                message={`¿Está seguro que desea eliminar a ${deleteConfirm.patientName}? Esta acción no se puede deshacer.`}
                type="warning"
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => {
                    deletePatient(deleteConfirm.patientId);
                    setDeleteConfirm({ isOpen: false, patientId: null, patientName: '' });
                    setModalInfo({
                        isOpen: true,
                        type: 'success',
                        title: '¡Paciente Eliminado!',
                        message: `${deleteConfirm.patientName} ha sido eliminado correctamente del sistema.`
                    });
                }}
            />

            {/* Success/Error Modal */}
            <StatusModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo({ isOpen: false, type: 'success', title: '', message: '' })}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
            />
        </div>
    );
};

export default CRMModule;
