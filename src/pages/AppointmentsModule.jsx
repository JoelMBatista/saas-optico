import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Users, Search, Filter, MoreVertical, X, Check, User, FileText, Activity, Save, ChevronLeft } from 'lucide-react';
import { OutlinedInput, OutlinedSelect, OutlinedTextArea } from '../components/ui/FormElements';

const AppointmentsModule = () => {
    const [activeTab, setActiveTab] = useState('Hoy');

    // Scheduling State
    const [apptDate, setApptDate] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [specialist, setSpecialist] = useState('Dr. Martinez (Optometría)');
    const [apptType, setApptType] = useState('');
    const [patientName, setPatientName] = useState('');
    const [note, setNote] = useState('');

    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '15:00', '15:30', '16:00', '16:30', '17:00'];

    const handleSchedule = () => {
        alert(`Cita agendada para ${patientName} el ${apptDate} a las ${apptTime} con ${specialist}`);
        // Reset or redirect logic here
    };

    // MOCK DATA
    const appointments = [
        { id: 1, time: '09:00 AM', patient: 'Maria Rodriguez', type: 'Examen Visual', doctor: 'Dr. Martinez', status: 'Registrado' },
        { id: 2, time: '09:45 AM', patient: 'Javier Mendez', type: 'Seguimiento', doctor: 'Dr. Lopez', status: 'Programado' },
        { id: 3, time: '10:30 AM', patient: 'Lucia Fer', type: 'Adaptación Lentes', doctor: 'Dr. Martinez', status: 'Programado' },
        { id: 4, time: '11:15 AM', patient: 'Carlos Ruiz', type: 'Examen Visual', doctor: 'Dr. Lopez', status: 'Programado' },
        { id: 5, time: '12:00 PM', patient: 'Ana Garcia', type: 'Entrega', doctor: 'Dr. Martinez', status: 'Programado' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Registrado': return { background: '#E6FDF9', color: '#05CD99' }; // Success-ish
            case 'Programado': return { background: '#F4F7FE', color: '#4318FF' }; // Primary-ish
            default: return { background: '#F4F7FE', color: '#A3AED0' };
        }
    };

    const tabs = ['Hoy', 'Próximas', 'Vista de Calendario', 'Historial'];

    return (
        <div className="flex col gap-lg" style={{ paddingBottom: '40px' }}>

            {/* 1. Metrics Section */}
            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#F4F7FE', padding: '12px', borderRadius: '50%' }}>
                        <Calendar size={24} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p className="text-sm">Citas Hoy</p>
                        <h3 className="text-lg">8</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#FFF7E6', padding: '12px', borderRadius: '50%' }}>
                        <Calendar size={24} color="var(--color-warning)" />
                    </div>
                    <div>
                        <p className="text-sm">Esta Semana</p>
                        <h3 className="text-lg">42</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#E6F9F4', padding: '12px', borderRadius: '50%' }}>
                        <CheckCircle size={24} color="var(--color-success)" />
                    </div>
                    <div>
                        <p className="text-sm">Completadas (Mes)</p>
                        <h3 className="text-lg">18</h3>
                    </div>
                </div>

                <div className="card flex items-center gap-md">
                    <div className="icon-box" style={{ background: '#F2EFFF', padding: '12px', borderRadius: '50%' }}>
                        <Clock size={24} color="var(--color-secondary)" />
                    </div>
                    <div>
                        <p className="text-sm">Duración Promedio</p>
                        <h3 className="text-lg">45 min</h3>
                    </div>
                </div>
            </div>

            {/* 2. Main Content & Listing */}
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

                {/* Toolbar & List View (Only when NOT in Calendar View) */}
                {activeTab !== 'Vista de Calendario' && (
                    <>
                        <div className="flex justify-between items-center wrap gap-md">
                            <div className="input-group" style={{ width: '300px' }}>
                                <Search size={18} className="input-icon" />
                                <input type="text" placeholder="Buscar pacientes..." className="w-full input-with-icon" />
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn-ghost flex items-center gap-sm">
                                    <User size={18} />
                                    <span>Doctor: Todos</span>
                                </button>
                                <button className="btn-ghost flex items-center gap-sm">
                                    <Filter size={18} />
                                    <span>Estado</span>
                                </button>
                            </div>
                        </div>

                        {/* Date Header */}
                        <h3 className="text-md" style={{ marginTop: '10px' }}>15 de Junio, 2023</h3>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E0E5F2' }}>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>HORA</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>PACIENTE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>TIPO</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>DOCTOR</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>ESTADO</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: '#A3AED0', fontWeight: 'bold' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => {
                                        const statusStyle = getStatusStyle(apt.status);
                                        return (
                                            <tr key={apt.id} style={{ borderBottom: '1px solid #F4F7FE' }}>
                                                <td style={{ padding: '16px', fontWeight: '600' }}>{apt.time}</td>
                                                <td style={{ padding: '16px', fontWeight: '600', color: 'var(--color-primary)' }}>{apt.patient}</td>
                                                <td style={{ padding: '16px' }}>{apt.type}</td>
                                                <td style={{ padding: '16px' }}>{apt.doctor}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: statusStyle.color,
                                                        backgroundColor: statusStyle.background
                                                    }}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <button className="btn-icon">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CALENDAR VIEW - SCHEDULING INTERFACE */}
                {activeTab === 'Vista de Calendario' && (
                    <div className="fade-in">
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>

                            {/* Left Column: Form & Schedule */}
                            <div className="flex col gap-md">
                                <div className="card flex col gap-md" style={{ padding: '24px', boxShadow: 'none', border: '1px solid #E0E5F2' }}>

                                    <h3 className="text-md" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px', marginBottom: '8px', fontSize: '16px' }}>
                                        Agendar Nueva Cita
                                    </h3>

                                    <div className="flex col gap-md">
                                        {/* Patient Name Input */}
                                        <OutlinedInput
                                            label="Nombre del Paciente"
                                            placeholder="Buscar o ingresar nombre..."
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            icon={<Search size={18} />}
                                        />

                                        {/* Quick Date Selector */}
                                        <div className="flex col gap-xs items-center">
                                            <label className="text-sm" style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '12px', textAlign: 'center', width: '100%' }}>Fecha</label>
                                            <div className="flex gap-sm justify-center" style={{ overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', width: '100%' }}>
                                                {Array.from({ length: 14 }).map((_, i) => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + i);
                                                    const isSelected = apptDate === d.toISOString().split('T')[0];
                                                    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
                                                    const dayNum = d.getDate();

                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => setApptDate(d.toISOString().split('T')[0])}
                                                            className="flex col items-center justify-center p-sm"
                                                            style={{
                                                                minWidth: '60px',
                                                                height: '70px',
                                                                borderRadius: '16px',
                                                                border: isSelected ? 'none' : '1px solid #F4F7FE',
                                                                background: isSelected ? 'var(--color-primary)' : 'white',
                                                                color: isSelected ? 'white' : 'var(--color-text-main)',
                                                                boxShadow: isSelected ? '0 4px 12px rgba(67, 24, 255, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                transform: isSelected ? 'translateY(-2px)' : 'none',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: isSelected ? 0.9 : 0.5 }}>{dayName}</span>
                                                            <span style={{ fontSize: '18px', fontWeight: '700' }}>{dayNum}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex col gap-xs">
                                            <label className="text-sm" style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '12px' }}>Horarios Disponibles</label>
                                            {!apptDate ? (
                                                <div style={{ padding: '24px', background: '#F8F9FA', borderRadius: '12px', textAlign: 'center', color: '#A3AED0', fontSize: '13px', border: '1px dashed #E0E5F2' }}>
                                                    Selecciona una fecha arriba para ver los horarios
                                                </div>
                                            ) : (
                                                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
                                                    {timeSlots.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setApptTime(time)}
                                                            className={apptTime === time ? 'btn-primary' : 'btn-ghost'}
                                                            style={{
                                                                borderRadius: '20px', // Pill shape
                                                                border: apptTime === time ? 'none' : '1px solid #F4F7FE',
                                                                background: apptTime === time ? 'var(--color-primary)' : 'white',
                                                                color: apptTime === time ? 'white' : 'var(--color-text-main)',
                                                                justifyContent: 'center',
                                                                padding: '10px 16px',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                boxShadow: apptTime === time ? '0 4px 12px rgba(67, 24, 255, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Specialist Selection - Cards */}
                                        <div className="flex col gap-xs">
                                            <label className="text-sm" style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '12px' }}>Especialista</label>
                                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                {['Dr. Martinez (Optometría)', 'Dra. Lopez (Oftalmología)'].map((spec) => (
                                                    <div
                                                        key={spec}
                                                        onClick={() => setSpecialist(spec)}
                                                        className="flex items-center gap-sm cursor-pointer"
                                                        style={{
                                                            padding: '16px',
                                                            borderRadius: '16px',
                                                            border: specialist === spec ? 'none' : '1px solid #F4F7FE',
                                                            background: specialist === spec ? 'var(--color-primary)' : 'white',
                                                            boxShadow: specialist === spec ? '0 8px 20px rgba(67, 24, 255, 0.25)' : '0 4px 12px rgba(0,0,0,0.03)',
                                                            transform: specialist === spec ? 'translateY(-2px)' : 'none',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '42px',
                                                            height: '42px',
                                                            borderRadius: '50%',
                                                            background: specialist === spec ? 'rgba(255,255,255,0.2)' : '#F4F7FE',
                                                            color: specialist === spec ? 'white' : '#A3AED0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px'
                                                        }}>
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '14px', fontWeight: '700', color: specialist === spec ? 'white' : 'var(--color-text-main)' }}>{spec.split('(')[0]}</p>
                                                            <p style={{ fontSize: '11px', color: specialist === spec ? 'rgba(255,255,255,0.8)' : '#A3AED0' }}>{spec.split('(')[1]?.replace(')', '')}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Appointment Type */}
                                        <div className="flex col gap-xs">
                                            <OutlinedInput
                                                label="Tipo de Consulta"
                                                placeholder="Ej. Examen Visual Completo, Revisión..."
                                                value={apptType}
                                                onChange={(e) => setApptType(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex col gap-xs">
                                            <OutlinedTextArea
                                                label="Notas Adicionales"
                                                placeholder="Detalles adicionales..."
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Appointment Summary */}
                            <div className="flex col gap-md">
                                <div className="card" style={{ padding: '24px', borderTop: '4px solid var(--color-primary)' }}>
                                    <h3 className="text-md" style={{ marginBottom: '20px', fontSize: '16px' }}>Resumen de Cita</h3>

                                    <div className="flex col gap-md">
                                        <div className="flex items-start gap-md">
                                            <div style={{ padding: '10px', background: 'rgba(67, 24, 255, 0.1)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm" style={{ color: '#A3AED0', fontSize: '12px' }}>Fecha y Hora</span>
                                                <p style={{ fontWeight: '600', fontSize: '15px' }}>
                                                    {apptDate || '--/--/----'} <br />
                                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{apptTime || '--:--'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-md">
                                            <div style={{ padding: '10px', background: '#E6FDF9', borderRadius: '8px', color: 'var(--color-success)' }}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm" style={{ color: '#A3AED0', fontSize: '12px' }}>Paciente</span>
                                                <p style={{ fontWeight: '600', fontSize: '14px' }}>{patientName || 'Sin seleccionar'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-md">
                                            <div style={{ padding: '10px', background: '#F2EFFF', borderRadius: '8px', color: '#7551FF' }}>
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm" style={{ color: '#A3AED0', fontSize: '12px' }}>Tipo de Servicio</span>
                                                <p style={{ fontWeight: '600', fontSize: '14px' }}>{apptType || '--'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid #E0E5F2', margin: '20px 0' }}></div>

                                    <button
                                        onClick={handleSchedule}
                                        disabled={!apptDate || !apptTime || !patientName}
                                        className={`btn-primary w-full flex items-center justify-center gap-sm ${(!apptDate || !apptTime || !patientName) ? 'disabled' : ''}`}
                                        style={{
                                            padding: '14px',
                                            opacity: (!apptDate || !apptTime || !patientName) ? 0.5 : 1,
                                            cursor: (!apptDate || !apptTime || !patientName) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <Calendar size={18} />
                                        <span>Agendar Cita</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* 3. Patient Detail / Action Form */}
            <div className="card flex col gap-md" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-md">Detalle de Cita</h3>
                        <p className="text-sm">Información del paciente seleccionado</p>
                    </div>
                    <div className="flex gap-sm">
                        <button className="btn-ghost text-error" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                            Cancelar
                        </button>
                        <button className="btn-ghost">
                            Reprogramar
                        </button>
                        <button className="btn-primary">
                            Registrar Entrada
                        </button>
                    </div>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginTop: '10px' }}>
                    {/* Patient Info */}
                    <div className="flex gap-md">
                        <div style={{ width: '48px', height: '48px', background: '#E0E5F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="#A3AED0" />
                        </div>
                        <div>
                            <h4 className="text-md">Maria Rodriguez</h4>
                            <p className="text-sm">ID: #PT-0921</p>
                        </div>
                    </div>

                    {/* Appointment Info */}
                    <div className="flex col gap-sm">
                        <div className="flex items-center gap-sm text-sm">
                            <Calendar size={16} />
                            <span style={{ fontWeight: '600' }}>15 Junio, 2023</span>
                        </div>
                        <div className="flex items-center gap-sm text-sm">
                            <Clock size={16} />
                            <span style={{ fontWeight: '600' }}>09:00 AM - 09:45 AM</span>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex col gap-sm">
                        <div className="flex items-center gap-sm text-sm">
                            <User size={16} />
                            <span style={{ fontWeight: '600' }}>Dr. Martinez</span>
                        </div>
                        <span className="text-sm" style={{ marginLeft: '24px' }}>Optometrista Principal</span>
                    </div>
                </div>

                {/* Notes */}
                <div style={{ marginTop: '16px', background: '#F4F7FE', padding: '16px', borderRadius: '8px' }}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
                        <FileText size={16} color="var(--color-text-secondary)" />
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>Notas Previas</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-main)' }}>
                        Paciente menciona dolores de cabeza ocasionales al leer por periodos prolongados.
                        Requiere revisión de formula actual.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsModule;
