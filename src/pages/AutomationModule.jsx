import React from 'react';
import { MessageCircle, Mail, Calendar, Clock, Zap } from 'lucide-react';

const AutomationModule = () => {
    const flows = [
        {
            id: 1,
            title: 'Recordatorio de Cita Anual',
            type: 'WhatsApp',
            trigger: '11 meses después de última visita',
            active: true,
            stats: '142 enviados'
        },
        {
            id: 2,
            title: 'Entrega de Lentes Lista',
            type: 'Email + SMS',
            trigger: 'Cambio de estado a "Terminado"',
            active: true,
            stats: '840 enviados'
        },
        {
            id: 3,
            title: 'Seguimiento de Adaptación',
            type: 'WhatsApp',
            trigger: '7 días después de entrega',
            active: false,
            stats: '0 enviados'
        },
        {
            id: 4,
            title: 'Felicitación de Cumpleaños',
            type: 'Email',
            trigger: 'Fecha de nacimiento',
            active: true,
            stats: '56 enviados'
        },
    ];

    return (
        <div className="flex col gap-lg">
            <div className="flex col gap-sm">
                <h2 className="text-md" style={{ fontSize: '20px' }}>Automatización de Flujos</h2>
                <p className="text-sm">Gestiona las comunicaciones automáticas con tus pacientes.</p>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {flows.map((flow) => (
                    <div key={flow.id} className="card flex col gap-md" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-md">
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: flow.type.includes('WhatsApp') ? '#E0F7EF' : '#EFF4FB',
                                    color: flow.type.includes('WhatsApp') ? '#01B574' : '#4D7CFE'
                                }}>
                                    {flow.type.includes('WhatsApp') ? <MessageCircle size={24} /> : <Mail size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-md" style={{ fontSize: '16px' }}>{flow.title}</h3>
                                    <span className="text-sm" style={{ opacity: 0.8 }}>{flow.type}</span>
                                </div>
                            </div>

                            <div className="toggle-switch" style={{
                                width: '44px',
                                height: '24px',
                                background: flow.active ? 'var(--color-success)' : '#E0E5F2',
                                borderRadius: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: flow.active ? '22px' : '2px',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}></div>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: '#F4F7FE', margin: '8px 0' }}></div>

                        <div className="flex col gap-sm">
                            <div className="flex items-center gap-sm text-sm">
                                <Zap size={14} color="var(--color-warning)" />
                                <span style={{ fontWeight: 600 }}>Disparador:</span>
                                <span>{flow.trigger}</span>
                            </div>
                            <div className="flex items-center gap-sm text-sm">
                                <Clock size={14} color="var(--color-text-secondary)" />
                                <span style={{ fontWeight: 600 }}>Rendimiento:</span>
                                <span>{flow.stats}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutomationModule;
