import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Calculator, Eye, RefreshCw, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, Printer, Search, User, Activity, FileText, Save, MessageCircle, Mail, Calendar, Sparkles, Disc, Trash2, X, ArrowRight, History } from 'lucide-react';
import StatusModal from '../components/ui/StatusModal';
import { usePatients } from '../context/PatientContext';
import { printPrescription, printLabOrder } from '../utils/printUtils';





// Helper component for inputs with custom visual steppers
// (Kept as internal helper for now, or could export if needed elsewhere)
const NumberInput = ({ value, onChange, placeholder, step = 0.25, error, forcePlus = false, suffix = '', min, max, className, style, readOnly = false }) => {
    const handleStep = (direction) => {
        if (readOnly) return;
        let current = parseFloat(value);
        if (isNaN(current)) current = 0;
        let nextVal = current + (direction * step);

        if (min !== undefined && nextVal < min) nextVal = min;
        if (max !== undefined && nextVal > max) nextVal = max;

        const isIntegerStep = Math.abs(step) >= 1;
        const decimals = isIntegerStep ? 0 : 2;
        let formatted = nextVal.toFixed(decimals);

        if (forcePlus && nextVal > 0) {
            formatted = '+' + formatted;
        }
        onChange(formatted);
    };

    return (
        <div className="relative" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
                disabled={readOnly}
                style={{
                    width: '100%',
                    fontSize: '14px',
                    padding: '2px 24px 2px 8px', // Reduced padding for compact h-7 (~28px) fit
                    borderRadius: '6px',
                    border: error ? '1px solid #FF5B5B' : '1px solid #E0E5F2',
                    height: '28px', // Force height explicitly to match h-7
                    opacity: readOnly ? 0.7 : 1,
                    cursor: readOnly ? 'default' : 'text',
                    ...style
                }}
            />
            <span style={{ position: 'absolute', right: '24px', color: '#A3AED0', pointerEvents: 'none', fontSize: '13px' }}>
                {suffix}
            </span>

            {!readOnly && (
                <div style={{ position: 'absolute', right: '2px', top: '2px', bottom: '2px', display: 'flex', flexDirection: 'column', width: '20px', borderLeft: '1px solid #F4F7FE' }}>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleStep(1)} tabIndex={-1} className="hover:bg-gray-100" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: 'none', color: '#A3AED0', borderTopRightRadius: '5px' }}><ChevronUp size={10} /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleStep(-1)} tabIndex={-1} className="hover:bg-gray-100" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: 'none', color: '#A3AED0', borderBottomRightRadius: '5px' }}><ChevronDown size={10} /></button>
                </div>
            )}
            {error && <span style={{ fontSize: '9px', color: '#FF5B5B', position: 'absolute', bottom: '-14px', left: 0 }}>{error}</span>}
        </div >
    );
};

// Specialized Rx Input with distinct visual cues
const RxInput = ({ value, onChange, placeholder, step = 0.25, error, type = 'sph', readOnly = false }) => {
    // type: 'sph' | 'cyl' | 'axis'
    const isAxis = type === 'axis';
    const isCyl = type === 'cyl';
    const isSph = type === 'sph';

    const handleStep = (direction) => {
        if (readOnly) return;
        let current = parseFloat(value);
        if (isNaN(current)) current = 0;

        let nextVal = current + (direction * step);

        if (isAxis) {
            if (nextVal < 0) nextVal = 180;
            if (nextVal > 180) nextVal = 0;
        }

        const decimals = isAxis ? 0 : 2;
        let formatted = nextVal.toFixed(decimals);

        if (!isAxis && nextVal > 0) formatted = '+' + formatted;

        onChange(formatted);
    };

    const getBorderColor = () => {
        if (error) return '#EF4444'; // Red-500
        if (isSph) return '#3B82F6'; // Blue-500
        if (isCyl) return '#EF4444'; // Red-500 (negative usually)
        return '#E5E7EB'; // Gray-200
    };

    const getBgColor = () => {
        if (readOnly) return '#F3F4F6';
        if (isSph) return '#EFF6FF'; // Blue-50
        if (isCyl) return '#FEF2F2'; // Red-50
        return '#FFFFFF';
    };

    return (
        <div className="relative group flex items-center h-9">
            {!readOnly && (
                <button
                    onClick={() => handleStep(-1)}
                    className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200 rounded-l-md text-gray-500 hover:text-gray-700 z-10 transition-colors"
                    tabIndex={-1}
                >
                    -
                </button>
            )}

            <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={readOnly}
                className="w-full h-full text-center font-bold text-sm outline-none transition-all placeholder-gray-300"
                style={{
                    paddingLeft: readOnly ? '8px' : '24px',
                    paddingRight: readOnly ? '8px' : '24px',
                    borderColor: getBorderColor(),
                    backgroundColor: getBgColor(),
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '6px',
                    color: '#1F2937'
                }}
            />

            {!readOnly && (
                <button
                    onClick={() => handleStep(1)}
                    className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200 rounded-r-md text-gray-500 hover:text-gray-700 z-10 transition-colors"
                    tabIndex={-1}
                >
                    +
                </button>
            )}

            {/* Type Indicator / Watermark */}
            {!value && !readOnly && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-gray-300 font-bold opacity-50">
                    {isSph ? 'SPH' : isCyl ? 'CYL' : 'EJE'}
                </span>
            )}
        </div>
    );
};

const InputRow = ({ eye, title, color, rx, errors, handleInputChange, readOnly }) => (
    <div style={{ display: 'contents' }}>
        <div className="flex items-center gap-xs" style={{ fontWeight: 'bold', color: color }}>
            {title}
        </div>
        <div className="field relative">
            <NumberInput value={rx[eye].sph} onChange={(val) => !readOnly && handleInputChange(eye, 'sph', val)} placeholder="+0.00" step={0.25} forcePlus={true} error={errors[`${eye}_sph`]} style={readOnly ? { pointerEvents: 'none', opacity: 0.7 } : {}} />
        </div>
        <div className="field relative">
            <NumberInput value={rx[eye].cyl} onChange={(val) => !readOnly && handleInputChange(eye, 'cyl', val)} placeholder="-0.00" step={-0.25} error={errors[`${eye}_cyl`]} style={readOnly ? { pointerEvents: 'none', opacity: 0.7 } : {}} />
        </div>
        <div className="field relative">
            <NumberInput value={rx[eye].axis} onChange={(val) => !readOnly && handleInputChange(eye, 'axis', val)} placeholder="180" step={1} min={0} max={180} suffix="°" error={errors[`${eye}_axis`]} style={readOnly ? { pointerEvents: 'none', opacity: 0.7 } : {}} />
        </div>
    </div>
);

// --- NEW HELPER COMPONENTS ---

const SnellenSelect = ({ value, onChange, placeholder = "20/...", className, style, readOnly = false }) => {
    const options = ["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/70", "20/80", "20/100", "20/200", "20/400", "CF", "HM", "PL", "NPL"];
    return (
        <div className="relative group flex items-center" style={{ width: '100%' }}>
            <select
                value={value}
                disabled={readOnly}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-2 py-1 bg-white border-b border-gray-200 text-[#2B3674] cursor-pointer focus:border-primary focus:outline-none transition-all hover:bg-gray-50 ${className || ''}`}
                style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    cursor: readOnly ? 'default' : 'pointer',
                    opacity: readOnly ? 0.7 : 1,
                    pointerEvents: readOnly ? 'none' : 'auto',
                    ...style
                }}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div >
    );
};


const VisualAcuityRow = ({ label, eyeColor, scValue, onScChange, ccValue, onCcChange, readOnly = false }) => {
    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '4px',
            padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}>
            <div className="flex items-center justify-center">
                <span style={{
                    fontSize: '11px', fontWeight: '800', color: 'white',
                    background: eyeColor || '#2B3674', padding: '2px 8px',
                    borderRadius: '20px', letterSpacing: '0.5px'
                }}>
                    {label}
                </span>
            </div>
            <SnellenSelect value={scValue} onChange={onScChange} readOnly={readOnly} />
            <SnellenSelect value={ccValue} onChange={onCcChange} readOnly={readOnly} />
        </div>
    );
};

const EyeCanvas = ({ anomalies = [], onAddAnomaly, readOnly = false }) => {
    const handleClick = (e) => {
        if (readOnly) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        // Use standard consistent logic for coordinate calculation
        const x = e.nativeEvent.clientX - rect.left;
        const y = e.nativeEvent.clientY - rect.top;

        // Normalize to 0-100 range based on the viewBox/container size
        const nx = (x / rect.width) * 100;
        const ny = (y / rect.height) * 100;

        if (onAddAnomaly) onAddAnomaly({ x: nx, y: ny });
    };

    return (
        <div className="relative group" style={{ width: '300px', height: '150px', margin: '0 auto', cursor: 'crosshair' }}>
            {/* Detailed Eye SVG Representation */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" onClick={handleClick} className="drop-shadow-sm transition-all hover:drop-shadow-md">
                <defs>
                    <radialGradient id="irisGradientOD" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#8B6F47" />
                        <stop offset="80%" stopColor="#5D4E37" />
                        <stop offset="100%" stopColor="#3E2F1F" />
                    </radialGradient>
                    <radialGradient id="irisGradientOI" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#8B6F47" />
                        <stop offset="80%" stopColor="#5D4E37" />
                        <stop offset="100%" stopColor="#3E2F1F" />
                    </radialGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="scleraGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F4F7FE" />
                    </linearGradient>
                </defs>

                {/* OD (Right Eye - on Left of Screen) */}
                <g className="hover:opacity-95 transition-opacity">
                    {/* Eyebrow */}
                    <path d="M 20 35 Q 75 25 130 35" stroke="#2B3674" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* Eye Shape (Almond) - Sclera */}
                    <ellipse cx="75" cy="75" rx="60" ry="30" fill="url(#scleraGradient)" stroke="#2B3674" strokeWidth="1.5" />

                    {/* Iris */}
                    <circle cx="75" cy="75" r="22" fill="url(#irisGradientOD)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Pupil */}
                    <circle cx="75" cy="75" r="7" fill="#000000" />

                    {/* Reflection */}
                    <ellipse cx="80" cy="70" rx="4" ry="2.5" fill="rgba(255,255,255,0.6)" transform="rotate(-45 80 70)" />
                </g>

                {/* OI (Left Eye - on Right of Screen) */}
                <g className="hover:opacity-95 transition-opacity">
                    {/* Eyebrow */}
                    <path d="M 170 35 Q 225 25 280 35" stroke="#2B3674" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* Eye Shape (Almond) - Sclera */}
                    <ellipse cx="225" cy="75" rx="60" ry="30" fill="url(#scleraGradient)" stroke="#2B3674" strokeWidth="1.5" />

                    {/* Iris */}
                    <circle cx="225" cy="75" r="22" fill="url(#irisGradientOI)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Pupil */}
                    <circle cx="225" cy="75" r="7" fill="#000000" />

                    {/* Reflection */}
                    <ellipse cx="230" cy="70" rx="4" ry="2.5" fill="rgba(255,255,255,0.6)" transform="rotate(-45 230 70)" />
                </g>
            </svg>

            {/* OD Label Pill */}
            <div style={{
                position: 'absolute',
                top: '125px',
                left: '25%',
                transform: 'translate(-50%, 0)',
                fontSize: '11px', fontWeight: '800', color: 'white',
                background: 'var(--color-primary)', padding: '2px 8px',
                borderRadius: '12px', letterSpacing: '0.5px',
                pointerEvents: 'none'
            }}>OD</div>

            {/* OI Label Pill */}
            <div style={{
                position: 'absolute',
                top: '125px',
                left: '75%',
                transform: 'translate(-50%, 0)',
                fontSize: '11px', fontWeight: '800', color: 'white',
                background: 'var(--color-success)', padding: '2px 8px',
                borderRadius: '12px', letterSpacing: '0.5px',
                pointerEvents: 'none'
            }}>OI</div>

            {/* Render Anomalies with refined marker */}
            {anomalies.map((a, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${a.x}%`, top: `${a.y}%`,
                    width: '8px', height: '8px', background: '#E31A1A', borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 0 2px white, 0 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 10, pointerEvents: 'none'
                }} title="Anomalía marcada" />
            ))}
        </div>
    );
};

const MotilityCanvas = ({ observations = [], onAddObservation, readOnly = false }) => {
    const handleClick = (e) => {
        if (readOnly) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.nativeEvent.clientX - rect.left;
        const y = e.nativeEvent.clientY - rect.top;
        const nx = (x / rect.width) * 100;
        const ny = (y / rect.height) * 100;

        if (onAddObservation) {
            onAddObservation({ x: nx, y: ny, type: 'x' });
        }
    };

    return (
        <div className="relative w-full bg-[#FAFCFE] rounded-lg border border-gray-200 overflow-hidden flex flex-col" style={{ height: '220px' }}>
            {/* Canvas Area */}
            <div className="relative w-full flex-1 cursor-crosshair">
                <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" onClick={handleClick}>
                    {/* Clean H Pattern Grid */}
                    <line x1="150" y1="20" x2="150" y2="130" stroke="#E0E5F2" strokeWidth="2" />
                    <line x1="50" y1="75" x2="250" y2="75" stroke="#E0E5F2" strokeWidth="2" />

                    {/* Vertical Limit Markers */}
                    <line x1="50" y1="40" x2="50" y2="110" stroke="#E0E5F2" strokeWidth="2" />
                    <line x1="250" y1="40" x2="250" y2="110" stroke="#E0E5F2" strokeWidth="2" />

                    {/* Labels */}
                    <text x="50" y="30" fontSize="9" fill="#A3AED0" textAnchor="middle" fontWeight="bold">OD</text>
                    <text x="250" y="30" fontSize="9" fill="#A3AED0" textAnchor="middle" fontWeight="bold">OI</text>
                    <text x="150" y="15" fontSize="9" fill="#A3AED0" textAnchor="middle">SUP</text>
                    <text x="150" y="145" fontSize="9" fill="#A3AED0" textAnchor="middle">INF</text>

                    {/* Observations */}
                    {observations.map((obs, i) => (
                        <text key={i} x={`${obs.x}%`} y={`${obs.y}%`} fontSize="16" fill="#E31A1A" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none', fontWeight: 'bold' }}>
                            ×
                        </text>
                    ))}
                </svg>
            </div>

            {/* Bottom: Button (Centered, Triage Style) */}
            <div className="flex justify-center pb-2 z-20 border-t border-gray-100 pt-2 bg-white">
                {!readOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddObservation && onAddObservation(null, true); }}
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-1.5 rounded-full transition-colors cursor-pointer border border-red-100"
                    >
                        <Trash2 size={12} /> Limpiar Diagrama
                    </button>
                )}
            </div>
        </div>
    );
};

const CanvasModal = ({ isOpen, onClose, title, icon: Icon, children, onClear, confirmLabel = "Aceptar", description }) => {
    if (!isOpen) return null;

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const modalContent = (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                margin: 0,
                padding: 0
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-[480px] relative flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 1000000 }}
            >
                {/* Close Button - Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-cyan-50 flex items-center justify-center mb-6">
                    {Icon ? <Icon size={40} className="text-cyan-500" strokeWidth={2.5} /> : <Activity size={40} className="text-cyan-500" strokeWidth={2.5} />}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                    {title || "Examen"}
                </h2>

                {/* Description */}
                <p className="text-gray-500 text-center mb-8 text-sm">
                    {description || "Registre las observaciones en el diagrama inferior."}
                </p>

                {/* Canvas Content */}
                <div className="w-full mb-8">
                    {children}
                </div>

                {/* Action Buttons */}
                <div className="w-full flex gap-3">
                    {/* Clear Button (Optional) */}
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Limpiar
                        </button>
                    )}

                    {/* Confirm Button */}
                    <button
                        onClick={onClose}
                        className="flex-[2] bg-[#4318FF] hover:bg-[#3614d0] text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    return modalContent;
};

const FundusCanvas = ({ drawing = [], onDraw, readOnly = false }) => {
    // Simple point-based drawing for now (dots)
    const handleClick = (e) => {
        if (readOnly) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.nativeEvent.clientX - rect.left;
        const y = e.nativeEvent.clientY - rect.top;
        const nx = (x / rect.width) * 100;
        const ny = (y / rect.height) * 100;

        if (onDraw) {
            onDraw({ x: nx, y: ny });
        }
    };

    return (
        <div className="relative group" style={{ width: '100%', height: '200px', border: '1px solid #E0E5F2', borderRadius: '8px', background: '#FAFCFE' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" onClick={handleClick} className="cursor-crosshair">
                {/* OD Circle */}
                <circle cx="100" cy="100" r="80" fill="#FFE4E1" stroke="#FF9999" strokeWidth="1" opacity="0.5" />
                <text x="100" y="190" fontSize="12" fill="#FF9999" textAnchor="middle" fontWeight="bold">OD</text>

                {/* OI Circle */}
                <circle cx="300" cy="100" r="80" fill="#FFE4E1" stroke="#FF9999" strokeWidth="1" opacity="0.5" />
                <text x="300" y="190" fontSize="12" fill="#FF9999" textAnchor="middle" fontWeight="bold">OI</text>

                {/* Drawing Points */}
                {drawing.map((p, i) => (
                    <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="2" fill="#E31A1A" />
                ))}
            </svg>
        </div>
    );
};

const Accordion = ({ title, children, isOpen, onToggle }) => (
    <div style={{ border: '1px solid #E0E5F2', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
        <div
            onClick={onToggle}
            className="flex justify-between items-center cursor-pointer hover:bg-gray-50"
            style={{ padding: '12px 16px', background: isOpen ? '#F4F7FE' : 'white', borderBottom: isOpen ? '1px solid #E0E5F2' : 'none' }}
        >
            <span style={{ fontWeight: '700', color: '#2B3674', fontSize: '14px' }}>{title}</span>
            {isOpen ? <ChevronUp size={16} color="#A3AED0" /> : <ChevronDown size={16} color="#A3AED0" />}
        </div>
        {isOpen && <div style={{ padding: '16px', background: 'white' }}>{children}</div>}
    </div>
);

// Mock DB for Diagnosis
const DIAGNOSIS_DB = [
    "Miopía Simple", "Miopía Magna", "Hipermetropía", "Astigmatismo Miópico Simple",
    "Astigmatismo Miópico Compuesto", "Astigmatismo Hipermetrópico", "Presbicia",
    "Conjuntivitis Bacteriana", "Conjuntivitis Alérgica", "Blefaritis", "Pterigion", "Catarata Senil"
];

const DiagnosisSearch = ({ value, onChange, readOnly = false }) => {
    const [suggestions, setSuggestions] = useState([]);
    const textareaRef = useRef(null);

    // Auto-resize height
    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 45)}px`; // Min height ~45px
        }
    }, [value]);

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
        if (val.length > 2) {
            setSuggestions(DIAGNOSIS_DB.filter(d => d.toLowerCase().includes(val.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (s) => {
        onChange(s);
        setSuggestions([]);
    };

    return (
        <div className="relative" style={{ width: '100%' }}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={readOnly ? "Sin diagnóstico" : "Escriba para buscar diagnóstico..."}
                disabled={readOnly}
                rows={1}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E0E5F2',
                    fontSize: '14px',
                    resize: 'none',
                    overflow: 'hidden',
                    minHeight: '45px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                }}
            />
            {suggestions.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'white', border: '1px solid #E0E5F2', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto'
                }}>
                    {suggestions.map(s => (
                        <div
                            key={s}
                            onClick={() => handleSelect(s)}
                            style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}
                            className="hover:bg-gray-50"
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- EXPORTED HOOK ---
export const useOpticalEngine = (onError, initialData = null, readOnly = false, currentStep = 1) => {
    const initialEyeState = { sph: '', cyl: '', axis: '' };
    const [rx, setRx] = useState(() => {
        // Deep merge or default if initialData is empty/malformed
        const defaultEye = { sph: '', cyl: '', axis: '', add: '' };

        // Check if we have valid input data
        const sourceRx = initialData || {};

        // Ensure robust structure: Always have od and oi objects
        return {
            od: { ...defaultEye, ...(sourceRx.od || {}) },
            oi: { ...defaultEye, ...(sourceRx.oi || {}) }
        };
    });
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState({});

    const isValidStep = (value) => {
        if (value === '' || value === '-' || value === '+') return true;
        return Math.abs(parseFloat(value) % 0.25) < 0.01;
    };

    const isValidAxis = (value) => {
        if (value === '') return true;
        const num = parseFloat(value);
        return num >= 0 && num <= 180;
    };

    const handleInputChange = (eye, field, inputValue) => {
        let value = inputValue.replace(/,/g, '.');
        if (!/^[0-9.\-+]*$/.test(value)) return;
        setRx(prev => ({ ...prev, [eye]: { ...prev[eye], [field]: value } }));
        if (errors[`${eye}_${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${eye}_${field}`];
                return newErrors;
            });
        }
    };

    const calculateTransposition = (eyeData) => {
        const sph = parseFloat(eyeData.sph) || 0;
        const cyl = parseFloat(eyeData.cyl) || 0;
        const axis = parseFloat(eyeData.axis) || 0;
        if (cyl > 0) {
            const newSph = sph + cyl;
            const newCyl = cyl * -1;
            let newAxis = axis;
            if (axis > 90) newAxis = axis - 90;
            else newAxis = axis + 90;
            return { sph: newSph, cyl: newCyl, axis: newAxis };
        }
        return { sph: sph, cyl: cyl, axis: axis };
    };

    const validateInputs = () => {
        const newErrors = {};
        const eyes = ['od', 'oi'];
        eyes.forEach(eye => {
            const data = rx[eye];
            if (data.sph && !isValidStep(data.sph)) newErrors[`${eye}_sph`] = 'Múltiplo de 0.25';
            if (data.cyl && !isValidStep(data.cyl)) newErrors[`${eye}_cyl`] = 'Múltiplo de 0.25';
            if (data.axis && !isValidAxis(data.axis)) newErrors[`${eye}_axis`] = 'Entre 0-180°';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // --- Read-Only Mode Effect ---
    useEffect(() => {
        if (readOnly) {
            const inputs = document.querySelectorAll('input, select, textarea, button.btn-ghost');
            inputs.forEach(input => {
                // Determine if we should skip disabling this element
                // We want to keep navigation buttons (Next/Prev) and Print buttons enabled
                // We can identify them by class or parent context if needed.
                // For now, let's disable form elements.
                if (input.tagName === 'BUTTON') {
                    // Start simple: disable buttons that look like input controls or toggles
                    // But keep main navigation
                    if (input.classList.contains('btn-primary') || input.classList.contains('btn-secondary')) {
                        // Likely navigation or major actions - keep enabled for now, logic below handles specific step buttons
                        return;
                    }
                    // Disable detailed interactions
                    input.disabled = true;
                    input.style.opacity = '0.6';
                    input.style.pointerEvents = 'none';
                } else {
                    input.disabled = true;
                    input.style.opacity = '0.7';
                }
            });
        }
    }, [readOnly, currentStep]);

    const handleCalculate = () => {
        const hasValues = Object.keys(rx).some(eye => Object.values(rx[eye]).some(val => val !== ''));
        if (!hasValues) {
            if (onError) {
                onError('Debe ingresar al menos un valor.');
            } else {
                setErrors({ global: 'Debe ingresar al menos un valor.' });
            }
            return;
        }
        if (!validateInputs()) return;

        const resultOD = calculateTransposition(rx.od);
        const resultOI = calculateTransposition(rx.oi);
        const format = (n) => (n > 0 ? '+' : '') + n.toFixed(2);

        setResult({
            od: { sph: format(resultOD.sph), cyl: format(resultOD.cyl), axis: Math.round(resultOD.axis) + '°' },
            oi: { sph: format(resultOI.sph), cyl: format(resultOI.cyl), axis: Math.round(resultOI.axis) + '°' }
        });
        if (errors.global) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.global;
                return newErrors;
            });
        }
    };

    return { rx, result, errors, handleInputChange, handleCalculate, setRx, setResult, setErrors };
};


// --- EXPORTED SUB-COMPONENTS ---

export const OpticalEngineInput = ({ rx, errors, handleInputChange, handleCalculate, embed = false }) => (
    <div className="card" style={{ padding: '0px', border: '1px solid #E0E5F2', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid #F4F7FE' }}>
            <h3 className="text-md" style={{ fontSize: '16px', fontWeight: '700', color: '#2B3674' }}>Ingreso de Datos Rx</h3>
            <div className="text-sm flex items-center gap-xs" style={{ background: '#FFF8E1', color: '#B5850B', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '12px' }}>
                <AlertCircle size={14} />
                <span>Detecta Cilindro (+)</span>
            </div>
        </div>

        <div className="flex col gap-md" style={{ padding: '24px' }}>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gap: '16px', marginBottom: '-8px' }}>
                <div></div>
                <label className="text-sm font-bold text-center" style={{ color: '#A3AED0', fontSize: '12px' }}>Esfera (SPH)</label>
                <label className="text-sm font-bold text-center" style={{ color: '#A3AED0', fontSize: '12px' }}>Cilindro (CYL)</label>
                <label className="text-sm font-bold text-center" style={{ color: '#A3AED0', fontSize: '12px' }}>Eje (AXIS)</label>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <InputRow eye="od" title="OD" color="#4318FF" rx={rx} errors={errors} handleInputChange={handleInputChange} />
                <InputRow eye="oi" title="OI" color="#01B574" rx={rx} errors={errors} handleInputChange={handleInputChange} />
            </div>



            <button
                onClick={handleCalculate}
                className="btn-primary flex items-center justify-center hover-up"
                style={{
                    marginTop: '8px',
                    gap: '10px',
                    padding: '14px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    background: '#4318FF',
                    fontWeight: '600',
                    boxShadow: '0px 10px 20px rgba(67, 24, 255, 0.2)'
                }}
            >
                <RefreshCw size={18} />
                Generar Orden de Laboratorio
            </button>
        </div>
    </div>
);



// ... (existing helper components and hook omitted for brevity, logic remains same)

export const OpticalEngineResult = ({ result, onSave, embed = false }) => {
    return (
        <div className="card flex col hover-up" style={{
            background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0px 10px 30px rgba(67, 24, 255, 0.3)',
            height: '100%',
            minHeight: '280px'
        }}>
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Orden de Laboratorio</h3>
                        <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px', fontWeight: '400' }}>Listo para producción</p>
                    </div>
                    <div className="flex gap-sm">
                        <button onClick={onSave} className="btn-icon" title="Guardar en Ficha" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', borderRadius: '10px', backdropFilter: 'blur(10px)' }}>
                            <Save size={18} />
                        </button>
                        <button onClick={() => window.print()} className="btn-icon" title="Imprimir" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', borderRadius: '10px', backdropFilter: 'blur(10px)' }}>
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {result ? (
                    <div className="flex col gap-lg fade-in" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        {/* Result Block OD */}
                        <div className="result-block" style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px' }}>OD</span>
                                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.2)' }}></div>
                            </div>
                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Esfera</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.od.sph}</span></div>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cilindro</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.od.cyl}</span></div>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eje</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.od.axis}</span></div>
                            </div>
                        </div>

                        {/* Result Block OI */}
                        <div className="result-block" style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px' }}>OI</span>
                                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.2)' }}></div>
                            </div>
                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Esfera</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.oi.sph}</span></div>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cilindro</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.oi.cyl}</span></div>
                                <div><span style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eje</span><span className="text-md font-bold" style={{ display: 'block', fontSize: '16px' }}>{result.oi.axis}</span></div>
                            </div>
                        </div>


                    </div>
                ) : (
                    <div className="flex col items-center justify-center flex-1" style={{ opacity: 0.6, textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                        <RefreshCw size={56} style={{ marginBottom: '20px', opacity: 0.6 }} />
                        <p style={{ fontSize: '14px', lineHeight: '1.5', maxWidth: '80%' }}>Ingrese los valores y presione "Generar" para ver la orden calculada.</p>
                    </div>
                )}
            </div>

            {/* Ambient Background Elements */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '250px', height: '250px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
        </div>
    );

};


// --- CONSULTATION WIZARD COMPONENTS ---

const ConsultationStepHeader = ({ currentStep, onStepClick }) => {
    const steps = [
        { id: 1, title: 'Módulo de Refracción 1.0', icon: '👁️' },
        { id: 2, title: 'Módulo de Refracción 1.2', icon: '📋' },
        { id: 3, title: 'Módulo oculomotor 1.0', icon: '🤸' },
        { id: 4, title: 'Módulo oculomotor 1.2', icon: '🔦' },
        { id: 5, title: 'Módulo oculomotor 1.3', icon: '👓' },
        { id: 6, title: 'Diagnóstico', icon: '✅' }
    ];

    return (
        <div className="flex items-center gap-md overflow-x-auto" style={{ marginBottom: '20px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #E0E5F2' }}>
            {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;
                return (
                    <div
                        key={step.id}
                        onClick={() => onStepClick(step.id)}
                        className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${isActive ? 'flex-1' : ''}`}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: isActive ? 'var(--color-primary)' : (isPassed ? '#F4F7FE' : 'transparent'),
                            color: isActive ? 'white' : (isPassed ? 'var(--color-primary)' : '#A3AED0'),
                            fontWeight: isActive ? '700' : '600',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                            minWidth: isActive ? '140px' : 'auto',
                            justifyContent: isActive ? 'center' : 'flex-start',
                            border: isActive ? 'none' : (isPassed ? '1px solid transparent' : '1px solid transparent')
                        }}
                    >
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: isActive ? 'rgba(255,255,255,0.2)' : (isPassed ? '#E0E5F2' : '#F4F7FE'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', color: isActive ? 'white' : (isPassed ? 'var(--color-primary)' : '#A3AED0')
                        }}>
                            {isPassed ? '✓' : step.id}
                        </div>
                        {isActive && <span>{step.title}</span>}
                    </div>
                );
            })}
        </div>
    );
};

// --- HELPER: Smart Diagnosis Logic ---
const calculateSmartDiagnosis = (rx, exam) => {
    const parts = [];

    // Helper to extract values from string input (e.g. "-1.00 -0.50 x 90")
    const parseRxString = (str) => {
        if (!str || typeof str !== 'string') return { sph: 0, cyl: 0 };
        const matches = str.match(/[-+]?\d*\.?\d+/g);
        if (!matches) return { sph: 0, cyl: 0 };
        return {
            sph: parseFloat(matches[0] || 0),
            cyl: parseFloat(matches[1] || 0)
        };
    };

    let sphOD = 0, cylOD = 0, addOD = 0;
    let sphOI = 0, cylOI = 0, addOI = 0;

    // OD - Safe Access
    if (rx?.od?.sph) {
        sphOD = parseFloat(rx.od.sph);
        cylOD = parseFloat(rx.od.cyl);
    } else {
        const parsed = parseRxString(exam?.rx_od_vl);
        sphOD = parsed.sph;
        cylOD = parsed.cyl;
    }

    // OI - Safe Access
    if (rx?.oi?.sph) {
        sphOI = parseFloat(rx.oi.sph);
        cylOI = parseFloat(rx.oi.cyl);
    } else {
        const parsed = parseRxString(exam?.rx_oi_vl);
        sphOI = parsed.sph;
        cylOI = parsed.cyl;
    }

    addOD = parseFloat(rx?.od?.add || exam?.rx_od_add || 0);
    addOI = parseFloat(rx?.oi?.add || exam?.rx_oi_add || 0);

    // Rule 1: Myopia / Hyperopia
    if (sphOD < -0.25 || sphOI < -0.25) parts.push("Miopía (H52.1)"); // Added threshold
    if (sphOD > 0.25 || sphOI > 0.25) parts.push("Hipermetropía (H52.0)");

    // Rule 2: Astigmatismo
    if (Math.abs(cylOD) > 0.25 || Math.abs(cylOI) > 0.25) parts.push("Astigmatismo (H52.2)");

    // Rule 3: Presbicia
    if (addOD > 0.75 || addOI > 0.75) parts.push("Presbicia (H52.4)"); // Threshold usually +0.75 or +1.00

    // Rule 4: Anisometropia
    if (Math.abs(sphOD - sphOI) > 2.0) parts.push("Anisometropía (H52.3)");

    return [...new Set(parts)].join(" + ");
};


// --- COMPONENT: Final Action Modal ---
const FinalActionModal = ({ isOpen, onClose, onPrintRx, onPrintLab, onFinish }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Save size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Finalizar Consulta</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Seleccione una acción para continuar. La consulta no se guardará hasta que inicie una nueva.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={onPrintRx}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
                    >
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold text-gray-800">Imprimir Receta</span>
                            <span className="block text-[10px] text-gray-400">Para el Paciente</span>
                        </div>
                    </button>

                    <button
                        onClick={onPrintLab}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
                    >
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                            <Printer size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold text-gray-800">Imprimir Orden de Lab</span>
                            <span className="block text-[10px] text-gray-400">Copia interna para taller</span>
                        </div>
                    </button>

                    <button
                        onClick={() => onFinish('appointments')}
                        className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold mt-2 shadow-lg shadow-blue-200 group"
                    >
                        Iniciar Nueva Consulta
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};




const ConsultationWizard = ({ patient, onFinish, initialData = {}, readOnly = false, onExit }) => {
    // Ensure initialData is never null to prevent crashes
    const safeData = initialData || {};
    const safeTriage = safeData.triage || {};
    const safeExam = safeData.exam || {};
    const safeRx = safeData.rx || {};
    const safeDiagnosis = safeData.diagnosis || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [isMotilityModalOpen, setIsMotilityModalOpen] = useState(false);
    const [isFinalActionModalOpen, setIsFinalActionModalOpen] = useState(false);

    const [isFundusModalOpen, setIsFundusModalOpen] = useState(false);
    const [isAnomaliesModalOpen, setIsAnomaliesModalOpen] = useState(false);

    // --- Step 1: Triage & AV State ---
    const [triage, setTriage] = useState(() => {
        const defaults = {
            reason: patient?.consultationReason || '',
            ext_annexes: '', ext_annexes_obs: '',
            ext_pupillary: '', ext_pupillary_obs: '',
            ext_acc: '', ext_acc_obs: '',
            ext_photomotor: '', ext_photomotor_obs: '',
            ext_consensual: '', ext_consensual_obs: '',
            anomalies: [],
            av_od_sc: '', av_oi_sc: '',
            av_od_cc: '', av_oi_cc: '',
            av_near_od_sc: '', av_near_oi_sc: '',
            av_near_od_cc: '', av_near_oi_cc: '',
            av_both_sc: '', av_both_cc: '',
            av_ph_od: '', av_ph_oi: '',
            lensometry_od: '', lensometry_oi: ''
        };
        const merged = { ...defaults, ...safeTriage };
        // Strictly enforce arrays are not null
        merged.anomalies = merged.anomalies || [];
        // Ensure reason is populated if missing in safeTriage but present in patient
        if (!merged.reason) merged.reason = patient?.consultationReason || '';
        return merged;
    });

    // --- Step 2: Refraction State (Engine Hook) ---
    // We lift the engine state here so it persists when switching steps
    const { rx, result, errors, handleInputChange, handleCalculate, setRx } = useOpticalEngine((msg) => alert(msg), safeRx, readOnly, currentStep);

    // --- Step 2: Deep Exam State ---
    const [exam, setExam] = useState(() => {
        const defaults = {
            coverTest_6m: '', coverTest_50cm: '', coverTest_30cm: '',
            ppc_6m: '', ppc_50cm: '', ppc_30cm: '',
            exam_20cm: '', rfp: '', rfn: '',
            ductions: '', versions: '', kappa: '', hirschberg: '',
            motilityDrawing: [],
            acc_amp_od: '', acc_amp_oi: '',
            acc_flex_od: '', acc_flex_oi: '',
            kerato_od: '', kerato_oi: '',
            retino_static_od: '', retino_static_oi: '',
            retino_dynamic_od: '', retino_dynamic_oi: '',
            retino_cycloplegic_od: '', retino_cycloplegic_oi: '',
            retino_other_od: '', retino_other_oi: '',
            rx_od_vl: '', rx_oi_vl: '',
            rx_od_add: '', rx_oi_add: '',
            rx_od_iop: '', rx_oi_iop: '',
            fundusDrawing: [],
            dip: '', altura: '',
            subjetivo_od: '', subjetivo_oi: '',
            afinacion_od: '', afinacion_oi: '',
            fundus_od_text: '', fundus_oi_text: ''
        };
        const merged = { ...defaults, ...safeExam };
        // Strictly enforce arrays are not null
        merged.motilityDrawing = merged.motilityDrawing || [];
        merged.fundusDrawing = merged.fundusDrawing || [];
        return merged;
    });

    // --- Step 3: Diagnosis State ---
    const [diagnosis, setDiagnosis] = useState({
        diagnosisMain: safeDiagnosis.diagnosisMain || '',
        plan: safeDiagnosis.plan || '',
        nextControl: safeDiagnosis.nextControl || '',
        lab_design: safeDiagnosis.lab_design || '', // Progresivo, Mono, etc.
        lab_material: safeDiagnosis.lab_material || '', // Poly, CR39, etc.
        lab_coating: safeDiagnosis.lab_coating || '', // AR, Blue, etc.
        medications: safeDiagnosis.medications || [], // Array of {name, freq, duration}
        ...safeDiagnosis
    });

    // Sync state with patient prop & initialData
    useEffect(() => {
        if (patient) {
            setTriage(prev => ({ ...prev, reason: prev.reason || patient.consultationReason || '' }));
        }

        // Hydrate from initialData if present (Edit Mode / Continue)
        if (initialData) {
            if (initialData.triage) {
                setTriage(prev => {
                    const next = { ...prev, ...initialData.triage };
                    // Protect arrays
                    next.anomalies = next.anomalies || [];
                    return next;
                });
            }
            if (initialData.exam) {
                setExam(prev => {
                    const next = { ...prev, ...initialData.exam };
                    // Protect arrays
                    next.motilityDrawing = next.motilityDrawing || [];
                    next.fundusDrawing = next.fundusDrawing || [];
                    return next;
                });
            }
            if (initialData.diagnosis) setDiagnosis(prev => ({ ...prev, ...initialData.diagnosis }));

            // Handle Rx hydration from both legacy/CRM format (top-level) and finalized format (refraction object)
            if (initialData.rx || initialData.refraction?.rx) {
                const sourceRx = initialData.rx || initialData.refraction.rx || {};
                const defaultEye = { sph: '', cyl: '', axis: '' };
                setRx({
                    od: { ...defaultEye, ...(sourceRx.od || {}) },
                    oi: { ...defaultEye, ...(sourceRx.oi || {}) }
                });
            }

            if (initialData.refraction?.result) setResult(initialData.refraction.result);
        }
    }, [patient, initialData]);

    // Smart Navigation: Auto-jump to first incomplete step
    useEffect(() => {
        if (!initialData) return;

        // Give a small delay to ensure state is hydrated before validating
        const timer = setTimeout(() => {
            // Check steps 1 through 5 to find the first incomplete one
            // We use the validateStep function logic but we need to pass the *hydrated* data 
            // Since validateStep uses current state, we rely on the state update from the previous effect being scheduled.
            // However, effects run after render. To be safe, we can check the initialData object directly or 
            // wait for the next render cycle. 

            // Actually, we can just check the initialData structure directly for the jump logic to avoid race conditions with state updates

            const checkStep = (step, data) => {
                // Re-implementing simplified validation check against data object
                const triage = data.triage || {};
                const exam = data.exam || {};
                const rx = data.rx || data.refraction?.rx || {};
                const diagnosis = data.diagnosis || {};

                const isAnyFilled = (fields, source) => fields.some(f => source[f] && source[f].trim().length > 0);

                if (step === 1) { // Visual Acuity
                    return (triage.av_od_sc && triage.av_od_sc !== '') || (triage.av_oi_sc && triage.av_oi_sc !== '') ||
                        (triage.av_od_cc && triage.av_od_cc !== '') || (triage.av_oi_cc && triage.av_oi_cc !== '');
                }
                if (step === 2) { // External Exam
                    const fields = ['ext_annexes', 'ext_pupillary', 'ext_acc', 'ext_photomotor', 'ext_consensual'];
                    return isAnyFilled(fields, triage);
                }
                if (step === 3) { // Oculomotor
                    const fields = ['ppc_6m', 'ppc_50cm', 'ppc_30cm', 'exam_20cm', 'rfp', 'rfn', 'ductions', 'versions', 'kappa', 'hirschberg'];
                    const hasMotility = exam.motilityDrawing && exam.motilityDrawing.length > 0;
                    return isAnyFilled(fields, exam) || hasMotility;
                }
                if (step === 4) { // Retino/Kerato
                    const fields = ['acc_amp_od', 'acc_amp_oi', 'acc_flex_od', 'acc_flex_oi', 'kerato_od', 'kerato_oi', 'retino_static_od', 'retino_static_oi'];
                    return isAnyFilled(fields, exam);
                }
                if (step === 5) { // Refraction
                    const hasDip = exam.dip && exam.dip.trim().length > 0;
                    const fields = ['subjetivo_od', 'subjetivo_oi', 'rx_od_vl', 'rx_oi_vl'];
                    return hasDip && isAnyFilled(fields, exam);
                }
                return true;
            };

            for (let i = 1; i <= 6; i++) {
                if (!checkStep(i, initialData)) {
                    setCurrentStep(i);
                    return;
                }
            }
            // If all are "valid" (partial data might be enough to pass validation), go to last step or remain at 1?
            // If it's fully done, maybe go to Diagnosis (6)
            setCurrentStep(6);

        }, 100);

        return () => clearTimeout(timer);
    }, [initialData]);

    const handleTriageChange = (field, value) => {
        setTriage(prev => ({ ...prev, [field]: value }));
    };

    const handleExamChange = (field, value) => {
        setExam(prev => ({ ...prev, [field]: value }));
    };

    const handleRetinoChange = (eye, field, value) => {
        setExam(prev => ({
            ...prev,
            [`retino_${eye}`]: { ...prev[`retino_${eye}`], [field]: value }
        }));
    };

    const handleDiagnosisChange = (field, value) => {
        setDiagnosis(prev => ({ ...prev, [field]: value }));
    };

    const handleAddMedication = () => {
        setDiagnosis(prev => ({
            ...prev,
            medications: [...(prev.medications || []), { name: '', freq: '', duration: '' }]
        }));
    };

    const handleUpdateMedication = (index, field, value) => {
        setDiagnosis(prev => {
            const newMeds = [...(prev.medications || [])];
            newMeds[index] = { ...newMeds[index], [field]: value };
            return { ...prev, medications: newMeds };
        });
    };

    const handleRemoveMedication = (index) => {
        setDiagnosis(prev => ({
            ...prev,
            medications: (prev.medications || []).filter((_, i) => i !== index)
        }));
    };

    const validateStep = (step) => {
        // Helper to check if any field in a list has a value
        const isAnyFilled = (fields, obj = exam) => fields.some(f => obj[f] && obj[f].trim().length > 0);

        if (step === 1) {
            // Step 1: Agudeza Visual (Formerly Step 2)
            // Require at least one Visual Acuity value (SC or CC)
            return (triage.av_od_sc && triage.av_od_sc !== '') ||
                (triage.av_oi_sc && triage.av_oi_sc !== '') ||
                (triage.av_od_cc && triage.av_od_cc !== '') ||
                (triage.av_oi_cc && triage.av_oi_cc !== '');
        }

        if (step === 2) {
            // Step 2: Triage / Examen Externo
            // REQUIRE at least one dropdown selected (same logic as Step 1)
            const triageFields = [
                'ext_annexes', 'ext_pupillary', 'ext_acc',
                'ext_photomotor', 'ext_consensual'
            ];
            // Check triage object, not exam
            return isAnyFilled(triageFields, triage);
        }

        if (step === 3) {
            // Step 3: Oculomotor
            // Require at least one observation in PPC, Motility, or specific tests
            // Note: Cover Test inputs might be mapped to ppc vars in current UI or separate, 
            // checking all relevant oculomotor fields found in the active UI.
            const oculomotorFields = [
                'ppc_6m', 'ppc_50cm', 'ppc_30cm', 'exam_20cm', 'rfp', 'rfn',
                'ductions', 'versions', 'kappa', 'hirschberg'
            ];
            const hasMotility = exam.motilityDrawing && exam.motilityDrawing.length > 0;
            return isAnyFilled(oculomotorFields) || hasMotility;
        }

        if (step === 4) {
            // Step 4: Retinoscopy & Queratometría & ACC
            // Require at least one value from the objective exam
            const objectiveFields = [
                'acc_amp_od', 'acc_amp_oi', 'acc_flex_od', 'acc_flex_oi',
                'kerato_od', 'kerato_oi',
                'retino_static_od', 'retino_static_oi',
                'retino_dynamic_od', 'retino_dynamic_oi',
                'retino_cycloplegic_od', 'retino_cycloplegic_oi',
                'retino_other_od', 'retino_other_oi'
            ];
            return isAnyFilled(objectiveFields);
        }

        if (step === 5) {
            // Step 5: Refraction & Rx Final
            // REQUIRE DIP, ALTURA and at least one Refraction Value (Subjective or Final Rx)
            const hasDip = exam.dip && exam.dip.trim().length > 0;
            const hasAltura = exam.altura && exam.altura.trim().length > 0;

            const refractionFields = [
                'subjetivo_od', 'subjetivo_oi',
                'afinacion_od', 'afinacion_oi',
                'rx_od_vl', 'rx_oi_vl',
                'rx_od_add', 'rx_oi_add' // Optional but counts if filled
            ];

            return hasDip && hasAltura && isAnyFilled(refractionFields);
        }

        if (step === 6) {
            // Step 6: Diagnosis & Lab Specs
            // Require Main Diagnosis AND Lab Specs
            const hasDiagnosis = diagnosis.diagnosisMain && diagnosis.diagnosisMain.trim().length > 0;
            const hasLabSpecs = diagnosis.lab_design && diagnosis.lab_material && diagnosis.lab_coating;
            return hasDiagnosis && hasLabSpecs;
        }

        return true;
    };

    const handleNext = () => {
        // Validation removed temporarily
        // if (!validateStep(currentStep)) {
        //     // Optional: Show error
        //     return;
        // }
        if (currentStep < 6) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleFinalize = () => {
        setIsFinalActionModalOpen(true);
    };

    const confirmFinalize = (targetTab) => {
        const fullRecord = {
            patientId: patient?.id,
            date: new Date().toISOString(),
            triage,
            exam, // Include the full exam state
            diagnosis,
            refraction: { rx, result }
        };
        // console.log("Finalizing Consultation:", fullRecord);
        if (onFinish) onFinish(fullRecord, targetTab);
        setIsFinalActionModalOpen(false);
    };

    // --- NEXT CONTROL LOGIC ---
    // ----------------------------------------------------------------------

    const calculateNextControl = () => {
        // Dependencies
        const age = patient?.age_years || 30; // Default to adult if age missing
        const diagMain = diagnosis.diagnosisMain?.toLowerCase() || '';

        const hasHighMyopia = rx ? Object.values(rx).some(eye => {
            if (!eye) return false;
            const sph = parseFloat(eye.sph) || 0;
            const cyl = parseFloat(eye.cyl) || 0;
            return (sph + cyl) <= -6.00;
        }) : false;

        // Rules Engine
        let rules = [
            // High Priority
            {
                condition: () => diagMain.includes('glaucoma') || diagMain.includes('sospecha de glaucoma') || diagMain.includes('retinopatía') || diagMain.includes('catarata'),
                days: 120, // 4 months avg
                reason: 'Protocolo de Patología (Glaucoma/Retina/Catarata)'
            },
            {
                condition: () => diagMain.includes('ambliopía') || diagMain.includes('estrabismo'),
                days: 90, // 3 months
                reason: 'Control Terapia Visual / Ambliopía'
            },
            {
                condition: () => diagMain.includes('progresivo') || diagMain.includes('adaptación') || diagMain.includes('lentes de contacto'),
                days: 15, // 15 days
                reason: 'Control de Adaptación (Lentes/LC)'
            },
            // Medium Priority
            {
                condition: () => age < 12,
                days: 180, // 6 months
                reason: 'Control Pediátrico (Desarrollo Visual)'
            },
            {
                condition: () => hasHighMyopia || diagMain.includes('miopía magna') || diagMain.includes('miopía progresiva'),
                days: 180,
                reason: 'Control Miopía Magna/Progresiva'
            },
            {
                condition: () => diagMain.includes('contacto'), // General LC user if not caught by adaptation
                days: 180,
                reason: 'Control Usuario Lentes de Contacto'
            }
        ];

        // Default Low Priority
        let selectedRule = rules.find(r => r.condition());

        let daysToAdd = 365; // Default 1 year
        let reasonObj = 'Control Anual Estándar';

        if (selectedRule) {
            daysToAdd = selectedRule.days;
            reasonObj = selectedRule.reason;
        }

        // Calculate Date
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysToAdd);

        const dateStr = futureDate.toISOString().split('T')[0];

        return { date: dateStr, reason: reasonObj };
    };

    // Auto-update Next Control Effect
    useLayoutEffect(() => {
        const { date, reason } = calculateNextControl();

        // Only update if different to avoid loops
        if (diagnosis.nextControl !== date || diagnosis.nextControlReason !== reason) {
            setDiagnosis(prev => ({
                ...prev,
                nextControl: date,
                nextControlReason: reason
            }));
        }
    }, [diagnosis.diagnosisMain, patient?.age_years, rx]);

    const handlePrintPrescription = () => {
        printPrescription(patient, rx, exam, diagnosis);
    };

    const handlePrintOrder = () => {
        printLabOrder(patient, rx, exam, diagnosis);
    };

    return (
        <div className="card fade-in" style={{
            padding: '16px',
            border: '1px solid #E0E5F2',
            borderRadius: '16px',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '745px',
            maxHeight: '745px',
            width: '100%',
            maxWidth: '100%'
        }}>
            <ConsultationStepHeader
                currentStep={currentStep}
                onStepClick={(step) => {
                    // Allow navigating back; allow forward only if current step is valid and targeting next step (prevent jump)
                    if (step < currentStep) setCurrentStep(step);
                    else if (step === currentStep + 1) setCurrentStep(step); // Removed validation check
                }}
            />

            <div style={{ width: '100%', marginBottom: '4px', paddingRight: '4px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                {/* STEP 2: TRIAGE (Formerly Step 1) */}
                {currentStep === 2 && (
                    <div className="fade-in flex col gap-md">
                        <h3 className="text-md font-bold text-primary" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>Examen Externo</h3>

                        {/* Motivo de Consulta Removed per user request */}

                        {/* Examen Externo & Eye Canvas */}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start', height: '500px' }}>
                            {/* Left Col: Anexos, Reflejo, ACC */}
                            <div className="flex col gap-md" style={{ height: '100%', maxHeight: '500px' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-[#2B3674]">Examen Externo</span>
                                    <button
                                        onClick={() => {
                                            const normalState = {
                                                ext_annexes: 'Sin particularidades',
                                                ext_pupillary: 'Isocóricas',
                                                ext_acc: 'Normal / Conservada',
                                                ext_photomotor: 'Reactivo / Presente',
                                                ext_consensual: 'Presente / Conservado',
                                                ext_annexes_obs: '', ext_pupillary_obs: '',
                                                ext_acc_obs: '', ext_photomotor_obs: '', ext_consensual_obs: ''
                                            };
                                            Object.keys(normalState).forEach(k => handleTriageChange(k, normalState[k]));
                                        }}
                                        disabled={readOnly}
                                        className="btn-ghost text-xs py-1 px-3 h-auto flex items-center gap-1 font-bold text-success hover:bg-green-50 rounded-lg transition-colors"
                                        style={readOnly ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(1)' } : {}}
                                    >
                                        Todo Normal
                                    </button>
                                </div>

                                {/* Scrollable Fields Container */}
                                <div className="flex col gap-2" style={{ flex: '1', overflowY: 'auto', paddingRight: '4px' }}>
                                    {[
                                        {
                                            label: 'Anexos Oculares', key: 'ext_annexes', defaultVal: 'Sin particularidades',
                                            options: ['Sin particularidades', 'Blefaritis', 'Ptosis', 'Chalazión / Orzuelo', 'Ectropión / Entropión', 'Triquiasis', 'Hiperemia', 'Otros']
                                        },
                                        {
                                            label: 'Reflejo Pupilar', key: 'ext_pupillary', defaultVal: 'Isocóricas',
                                            options: ['Isocóricas', 'Anisocóricas', 'Mióticas', 'Midriáticas', 'Discoria']
                                        },
                                        {
                                            label: 'ACC', key: 'ext_acc', defaultVal: 'Normal / Conservada',
                                            options: ['Normal / Conservada', 'Lenta / Perezosa', 'Deficiente', 'Ausente / Arreactiva']
                                        }
                                    ].map((field) => {
                                        const isDefault = !triage[field.key] || triage[field.key] === field.defaultVal;
                                        const obsKey = `${field.key}_obs`;

                                        return (
                                            <div key={field.key} className="flex col gap-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isDefault ? 'bg-success' : 'bg-warning'}`}></div>
                                                        <span className="text-xs font-bold text-[#2B3674]">{field.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={triage[field.key] || ''}
                                                            onChange={(e) => handleTriageChange(field.key, e.target.value)}
                                                            className="w-full h-auto min-h-[38px] py-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#2B3674] cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none text-ellipsis overflow-hidden"
                                                            style={{ backgroundImage: 'none', ...(readOnly ? { opacity: 0.7, pointerEvents: 'none', backgroundColor: '#F9FAFB' } : {}) }}
                                                            disabled={readOnly}
                                                        >
                                                            <option value="" disabled>Seleccionar...</option>
                                                            {field.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                            <ChevronDown size={14} className="text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isDefault && (
                                                    <div className="flex flex-col gap-1 mt-1 fade-in w-full">
                                                        <span className="text-[10px] font-bold text-gray-400 pl-1 uppercase tracking-wide">Observaciones</span>
                                                        <input
                                                            type="text"
                                                            placeholder="Especifique detalles..."
                                                            className="w-full h-auto min-h-[38px] py-2 px-3 bg-white border border-warning/50 rounded-lg text-xs text-gray-700 focus:border-warning focus:ring-1 focus:ring-warning outline-none transition-all placeholder:text-gray-300"
                                                            value={triage[obsKey] || ''}
                                                            onChange={(e) => handleTriageChange(obsKey, e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Col: Fotomotor, Consensual, Map */}
                            <div className="flex col gap-md" style={{ height: '100%', maxHeight: '500px' }}>
                                <div className="h-[28px] mb-2"></div>

                                {/* Scrollable Fields Container */}
                                <div className="flex col gap-2" style={{ flex: '1', overflowY: 'auto', paddingRight: '4px' }}>
                                    {[
                                        {
                                            label: 'Fotomotor', key: 'ext_photomotor', defaultVal: 'Reactivo / Presente',
                                            options: ['Reactivo / Presente', 'Hiporreactivo / Lento', 'Arreactivo / Ausente', 'Paradójico']
                                        },
                                        {
                                            label: 'Consensual', key: 'ext_consensual', defaultVal: 'Presente / Conservado',
                                            options: ['Presente / Conservado', 'Ausente', 'Lento']
                                        }
                                    ].map((field) => {
                                        const isDefault = !triage[field.key] || triage[field.key] === field.defaultVal;
                                        const obsKey = `${field.key}_obs`;

                                        return (
                                            <div key={field.key} className="flex col gap-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isDefault ? 'bg-success' : 'bg-warning'}`}></div>
                                                        <span className="text-xs font-bold text-[#2B3674]">{field.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={triage[field.key] || ''}
                                                            onChange={(e) => handleTriageChange(field.key, e.target.value)}
                                                            className="w-full h-auto min-h-[38px] py-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#2B3674] cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none text-ellipsis overflow-hidden"
                                                            style={{ backgroundImage: 'none', ...(readOnly ? { opacity: 0.7, pointerEvents: 'none', backgroundColor: '#F9FAFB' } : {}) }}
                                                            disabled={readOnly}
                                                        >
                                                            <option value="" disabled>Seleccionar...</option>
                                                            {field.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                            <ChevronDown size={14} className="text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isDefault && (
                                                    <div className="flex flex-col gap-1 mt-1 fade-in w-full">
                                                        <span className="text-[10px] font-bold text-gray-400 pl-1 uppercase tracking-wide">Observaciones</span>
                                                        <input
                                                            type="text"
                                                            placeholder="Especifique detalles..."
                                                            className="w-full h-auto min-h-[38px] py-2 px-3 bg-white border border-warning/50 rounded-lg text-xs text-gray-700 focus:border-warning focus:ring-1 focus:ring-warning outline-none transition-all placeholder:text-gray-300"
                                                            value={triage[obsKey] || ''}
                                                            onChange={(e) => handleTriageChange(obsKey, e.target.value)}
                                                            disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Fixed Map Card - Now inside scrollable flow */}
                                    <div className="rounded-lg border border-gray-200 overflow-hidden w-full bg-white shadow-sm p-4 flex flex-col items-center justify-center gap-2" style={{ flexShrink: 0 }}>
                                        <span className="text-sm font-bold text-[#2B3674]">Mapa de Anomalías</span>

                                        <button
                                            onClick={() => setIsAnomaliesModalOpen(true)}
                                            className={`w-full h-[38px] px-4 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all border flex items-center justify-center gap-2 ${(triage.anomalies && triage.anomalies.length > 0)
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-emerald-200'
                                                : 'bg-gradient-to-r from-[#2B3674] to-blue-700 text-white border-transparent shadow-blue-200'
                                                }`}
                                        >
                                            {(triage.anomalies && triage.anomalies.length > 0) ? (
                                                <>
                                                    <Sparkles size={14} className="text-white" />
                                                    <span className="drop-shadow-sm text-white">Editar Mapa</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={14} className="text-blue-100" />
                                                    <span className="drop-shadow-sm text-white">Dibujar Anomalías</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-gray-400">Marque hallazgos físicos (cicatrices, pterigion, etc.)</p>

                                        {/* Modal Component */}

                                        <CanvasModal
                                            isOpen={isAnomaliesModalOpen}
                                            onClose={() => setIsAnomaliesModalOpen(false)}
                                            title="Mapa de Anomalías Externas"
                                            description="Marque hallazgos físicos (cicatrices, pterigion, etc.)"
                                            icon={Eye}
                                            onClear={() => handleTriageChange('anomalies', [])}
                                        >
                                            <EyeCanvas
                                                anomalies={triage.anomalies || []}
                                                readOnly={readOnly}
                                                onAddAnomaly={(a) => handleTriageChange('anomalies', [...(triage.anomalies || []), a])}
                                            />
                                        </CanvasModal>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 1: AGUDEZA VISUAL (Formerly Step 2) */}
                {currentStep === 1 && (
                    <div className="fade-in flex col gap-md">
                        <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>
                            <h3 className="text-md font-bold text-primary">Agudeza Visual</h3>
                            <button
                                onClick={() => {
                                    handleTriageChange('av_oi_sc', triage.av_od_sc);
                                    handleTriageChange('av_oi_cc', triage.av_od_cc);
                                    handleTriageChange('av_near_oi_sc', triage.av_near_od_sc);
                                    handleTriageChange('av_near_oi_cc', triage.av_near_od_cc);
                                }}
                                disabled={readOnly}
                                className="btn-ghost text-xs py-1 px-3 h-auto"
                                style={readOnly ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                            >
                                Copiar OD a OI
                            </button>
                        </div>

                        {patient?.lastRx && patient.lastRx !== '--' && (
                            <div className="mb-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3 shadow-sm w-fit">
                                <div className="p-1.5 bg-white rounded-md shadow-sm">
                                    <History size={14} className="text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-blue-800 uppercase tracking-widest">Rx Anterior (Referencia)</span>
                                    <span className="text-xs font-semibold text-blue-900">{patient.lastRx}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-lg w-full pr-2">

                            {/* Main Grid: Lejana & Próxima & Pinhole SIDE BY SIDE */}
                            <div className="grid grid-cols-3 gap-4 items-start">

                                {/* Section: Lejana */}
                                <div className="p-md bg-white rounded-xl border border-gray-100 shadow-sm h-full">
                                    <div className="flex items-center mb-md">
                                        <span className="text-sm font-bold text-main">Visión Lejana (6m)</span>
                                    </div>
                                    {/* Header Row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '4px', marginBottom: '4px', padding: '0 8px' }}>
                                        <div></div>
                                        <div className="text-left text-[9px] tracking-wider font-bold text-gray-400 pl-2">Sin Corrección</div>
                                        <div className="text-left text-[9px] tracking-wider font-bold text-gray-400 pl-2">Con Corrección</div>
                                    </div>
                                    <VisualAcuityRow
                                        label="OD"
                                        eyeColor="var(--color-primary)"
                                        scValue={triage.av_od_sc} onScChange={(v) => handleTriageChange('av_od_sc', v)}
                                        ccValue={triage.av_od_cc} onCcChange={(v) => handleTriageChange('av_od_cc', v)}
                                        readOnly={readOnly}
                                    />
                                    <VisualAcuityRow
                                        label="OI"
                                        eyeColor="var(--color-success)"
                                        scValue={triage.av_oi_sc} onScChange={(v) => handleTriageChange('av_oi_sc', v)}
                                        ccValue={triage.av_oi_cc} onCcChange={(v) => handleTriageChange('av_oi_cc', v)}
                                        readOnly={readOnly}
                                    />
                                </div>

                                {/* Section: Próxima */}
                                <div className="p-md bg-white rounded-xl border border-gray-100 shadow-sm h-full">
                                    <div className="flex items-center mb-md">
                                        <span className="text-sm font-bold text-main">Visión Próxima (40cm)</span>
                                    </div>
                                    {/* Header Row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '4px', marginBottom: '4px', padding: '0 8px' }}>
                                        <div></div>
                                        <div className="text-center text-[9px] tracking-wider font-bold text-gray-400">Sin Corrección</div>
                                        <div className="text-center text-[9px] tracking-wider font-bold text-gray-400">Con Corrección</div>
                                    </div>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '4px',
                                        padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div className="flex items-center justify-center">
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', color: 'white',
                                                background: 'var(--color-primary)', padding: '2px 8px',
                                                borderRadius: '20px', letterSpacing: '0.5px'
                                            }}>
                                                OD
                                            </span>
                                        </div>
                                        <SnellenSelect value={triage.av_near_od_sc} onChange={(v) => handleTriageChange('av_near_od_sc', v)} readOnly={readOnly} />
                                        <SnellenSelect value={triage.av_near_od_cc} onChange={(v) => handleTriageChange('av_near_od_cc', v)} readOnly={readOnly} />
                                    </div>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '4px',
                                        padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div className="flex items-center justify-center">
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', color: 'white',
                                                background: 'var(--color-success)', padding: '2px 8px',
                                                borderRadius: '20px', letterSpacing: '0.5px'
                                            }}>
                                                OI
                                            </span>
                                        </div>
                                        <SnellenSelect value={triage.av_near_oi_sc} onChange={(v) => handleTriageChange('av_near_oi_sc', v)} readOnly={readOnly} />
                                        <SnellenSelect value={triage.av_near_oi_cc} onChange={(v) => handleTriageChange('av_near_oi_cc', v)} readOnly={readOnly} />
                                    </div>
                                </div>

                                {/* Section: Pinhole (NEW CARD) */}
                                <div className="p-md bg-white rounded-xl border border-gray-100 shadow-sm h-full">
                                    <div className="flex items-center mb-md">
                                        <span className="text-sm font-bold text-main">Pinhole (PH)</span>
                                    </div>
                                    {/* Header Row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px', marginBottom: '4px', padding: '0 8px' }}>
                                        <div></div>
                                        <div className="text-[9px]">&nbsp;</div>
                                    </div>

                                    {/* OD Row */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px', alignItems: 'center', marginBottom: '4px',
                                        padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '42px'
                                    }}> {/* Matching height approx */}
                                        <div className="flex items-center justify-center">
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', color: 'white',
                                                background: 'var(--color-primary)', padding: '2px 8px',
                                                borderRadius: '20px', letterSpacing: '0.5px'
                                            }}>
                                                OD
                                            </span>
                                        </div>
                                        <div className="flex gap-3 w-full justify-center">
                                            <div className="flex gap-2 w-full justify-center bg-[#F4F7FE] p-1 rounded-lg">
                                                {['Si', 'No'].map(opt => {
                                                    const isActive = triage.av_ph_od === opt;
                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleTriageChange('av_ph_od', opt)}
                                                            disabled={readOnly}
                                                            className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all duration-200 ${isActive
                                                                ? (opt === 'Si' ? 'bg-green-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md')
                                                                : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                            style={readOnly ? { opacity: 0.6, cursor: 'default' } : {}}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* OI Row */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px', alignItems: 'center', marginBottom: '4px',
                                        padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)', height: '42px'
                                    }}>
                                        <div className="flex items-center justify-center">
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', color: 'white',
                                                background: 'var(--color-success)', padding: '2px 8px',
                                                borderRadius: '20px', letterSpacing: '0.5px'
                                            }}>
                                                OI
                                            </span>
                                        </div>
                                        <div className="flex gap-3 w-full justify-center">
                                            <div className="flex gap-2 w-full justify-center bg-[#F4F7FE] p-1 rounded-lg">
                                                {['Si', 'No'].map(opt => {
                                                    const isActive = triage.av_ph_oi === opt;
                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleTriageChange('av_ph_oi', opt)}
                                                            disabled={readOnly}
                                                            className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all duration-200 ${isActive
                                                                ? (opt === 'Si' ? 'bg-green-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md')
                                                                : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                            style={readOnly ? { opacity: 0.6, cursor: 'default' } : {}}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Binocular / Otros */}
                            <div className="p-md bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center mb-md">
                                    <span className="text-sm font-bold text-main">Binocular / Otros</span>
                                </div>
                                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-xs">Ambos Ojos (AO)</label>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
                                            padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)', alignItems: 'center', height: '100%'
                                        }}>
                                            <div className="flex col gap-xs">
                                                <span className="text-[9px] font-bold text-gray-400 text-center">Sin Corrección</span>
                                                <SnellenSelect placeholder="20/..." value={triage.av_both_sc} onChange={(v) => handleTriageChange('av_both_sc', v)} readOnly={readOnly} />
                                            </div>
                                            <div className="flex col gap-xs">
                                                <span className="text-[9px] font-bold text-gray-400 text-center">Con Corrección</span>
                                                <SnellenSelect placeholder="20/..." value={triage.av_both_cc} onChange={(v) => handleTriageChange('av_both_cc', v)} readOnly={readOnly} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-xs">Lensometría (Esferas)</label>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
                                            padding: '4px 8px', borderRadius: '8px', background: 'white', border: '1px solid #F4F7FE',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)', alignItems: 'center', height: '100%'
                                        }}>
                                            <div className="flex col gap-xs">
                                                <span style={{
                                                    fontSize: '11px', fontWeight: '800', color: 'white',
                                                    background: 'var(--color-primary)', padding: '2px 8px',
                                                    borderRadius: '12px', letterSpacing: '0.5px',
                                                    width: 'fit-content'
                                                }}>OD</span>
                                                <input
                                                    type="text" placeholder="OD" className="input-field"
                                                    style={{
                                                        background: '#F4F7FE', border: '1px solid transparent', borderRadius: '6px',
                                                        fontSize: '13px', fontWeight: '600', color: '#2B3674', padding: '0 8px',
                                                        height: '32px', width: '100%',
                                                        opacity: readOnly ? 0.7 : 1, pointerEvents: readOnly ? 'none' : 'auto'
                                                    }}
                                                    disabled={readOnly}
                                                    value={triage.lensometry_od} onChange={(e) => handleTriageChange('lensometry_od', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex col gap-xs">
                                                <span style={{
                                                    fontSize: '11px', fontWeight: '800', color: 'white',
                                                    background: 'var(--color-success)', padding: '2px 8px',
                                                    borderRadius: '12px', letterSpacing: '0.5px',
                                                    width: 'fit-content'
                                                }}>OI</span>
                                                <input
                                                    type="text" placeholder="OI" className="input-field"
                                                    style={{
                                                        background: '#F4F7FE', border: '1px solid transparent', borderRadius: '6px',
                                                        fontSize: '13px', fontWeight: '600', color: '#2B3674', padding: '0 8px',
                                                        height: '32px', width: '100%',
                                                        opacity: readOnly ? 0.7 : 1, pointerEvents: readOnly ? 'none' : 'auto'
                                                    }}
                                                    disabled={readOnly}
                                                    value={triage.lensometry_oi} onChange={(e) => handleTriageChange('lensometry_oi', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REFRACTION & DEEP EXAM (HIDDEN - DEPRECATED) */}
                {
                    // Step 3 (Refraction) removed or hidden
                    false && (
                        <div className="fade-in flex col gap-md">
                            <h3 className="text-md font-bold text-primary" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>Examen Profundo y Refracción</h3>

                            {/* Block A: Módulo Oculomotor */}
                            <Accordion title="A. Módulo Oculomotor" isOpen={openSection === 'block_a'} onToggle={() => setOpenSection(openSection === 'block_a' ? '' : 'block_a')}>
                                <div className="flex col gap-lg">
                                    {/* Cover Test Grid */}
                                    <div>
                                        <label className="text-sm font-bold text-gray block mb-2">Cover Test</label>
                                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                            <div className="flex col gap-1">
                                                <span className="text-xs text-center text-gray-500 font-bold">Lejos (6m)</span>
                                                <input
                                                    type="text" placeholder="Ort/Exo/Endo..."
                                                    className="input-field p-2 text-sm text-center"
                                                    value={exam.coverTest_6m} onChange={(e) => handleExamChange('coverTest_6m', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex col gap-1">
                                                <span className="text-xs text-center text-gray-500 font-bold">Intermedia (50cm)</span>
                                                <input
                                                    type="text" placeholder="Ort/Exo/Endo..."
                                                    className="input-field p-2 text-sm text-center"
                                                    value={exam.coverTest_50cm} onChange={(e) => handleExamChange('coverTest_50cm', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex col gap-1">
                                                <span className="text-xs text-center text-gray-500 font-bold">Cerca (30cm)</span>
                                                <input
                                                    type="text" placeholder="Ort/Exo/Endo..."
                                                    className="input-field p-2 text-sm text-center"
                                                    value={exam.coverTest_30cm} onChange={(e) => handleExamChange('coverTest_30cm', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Motility Diagram & Metrics */}
                                    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px' }}>
                                        <div className="flex col gap-2">
                                            <label className="text-sm font-bold text-gray block">Diagrama de Motilidad</label>
                                            <MotilityCanvas
                                                observations={exam.motilityDrawing}
                                                onAddObservation={(obs, removeLast) => {
                                                    if (removeLast) {
                                                        const newObs = [...(exam.motilityDrawing || [])];
                                                        newObs.pop();
                                                        handleExamChange('motilityDrawing', newObs);
                                                    } else {
                                                        handleExamChange('motilityDrawing', [...(exam.motilityDrawing || []), obs]);
                                                    }
                                                }}
                                            />
                                            <p className="text-[10px] text-gray-400 italic text-center">Click para marcar desviación (X)</p>
                                        </div>
                                        <div className="flex col gap-3">
                                            {[
                                                { label: 'PPC (cm)', key: 'ppc', ph: 'ej: 8/10 cm' },
                                                { label: 'Ducciones', key: 'ductions', ph: 'Normales' },
                                                { label: 'Versiones', key: 'versions', ph: 'Normales' },
                                                { label: 'Ángulo Kappa', key: 'kappa', ph: 'Centrado' },
                                                { label: 'Hirschberg', key: 'hirschberg', ph: 'Simétrico' },
                                            ].map(field => (
                                                <div key={field.key} className="grid" style={{ gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
                                                    <span className="text-xs font-bold text-gray">{field.label}:</span>
                                                    <input
                                                        type="text"
                                                        placeholder={field.ph}
                                                        value={exam[field.key]}
                                                        onChange={(e) => handleExamChange(field.key, e.target.value)}
                                                        className="input-field p-1 text-sm border-b border-gray-200 focus:border-primary bg-transparent"
                                                        style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* Block B: Retinoscopía y Queratometría */}
                            <Accordion title="B. Retinoscopía y Queratometría" isOpen={openSection === 'block_b'} onToggle={() => setOpenSection(openSection === 'block_b' ? '' : 'block_b')}>
                                <div className="flex col gap-md">
                                    {/* Type Selector */}
                                    <div className="flex gap-4 mb-2">
                                        {['Estatica', 'Dinamica', 'Cicloplejica'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="retinoType"
                                                    checked={exam.retinoType === type}
                                                    onChange={() => handleExamChange('retinoType', type)}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm font-medium">{type}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Grid */}
                                    <div className="grid" style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                                        <div></div>
                                        <div className="text-center text-xs font-bold text-gray bg-gray-50 p-1 rounded">Esfera</div>
                                        <div className="text-center text-xs font-bold text-gray bg-gray-50 p-1 rounded">Cilindro</div>
                                        <div className="text-center text-xs font-bold text-gray bg-gray-50 p-1 rounded">Eje</div>

                                        <div className="font-bold text-primary text-sm flex items-center justify-center h-full bg-blue-50 rounded px-2">OD</div>
                                        <NumberInput value={exam.retino_od.sph} onChange={(v) => handleRetinoChange('od', 'sph', v)} placeholder="+0.00" step={0.25} forcePlus={true} />
                                        <NumberInput value={exam.retino_od.cyl} onChange={(v) => handleRetinoChange('od', 'cyl', v)} placeholder="-0.00" step={-0.25} />
                                        <NumberInput value={exam.retino_od.axis} onChange={(v) => handleRetinoChange('od', 'axis', v)} placeholder="180" step={5} min={0} max={180} suffix="°" />

                                        <div className="font-bold text-success text-sm flex items-center justify-center h-full bg-green-50 rounded px-2">OI</div>
                                        <NumberInput value={exam.retino_oi.sph} onChange={(v) => handleRetinoChange('oi', 'sph', v)} placeholder="+0.00" step={0.25} forcePlus={true} />
                                        <NumberInput value={exam.retino_oi.cyl} onChange={(v) => handleRetinoChange('oi', 'cyl', v)} placeholder="-0.00" step={-0.25} />
                                        <NumberInput value={exam.retino_oi.axis} onChange={(v) => handleRetinoChange('oi', 'axis', v)} placeholder="180" step={5} min={0} max={180} suffix="°" />
                                    </div>
                                </div>
                            </Accordion>

                            {/* Block C: Rx Final y Fondo de Ojo */}
                            <Accordion title="C. Rx Final y Fondo de Ojo" isOpen={openSection === 'block_c'} onToggle={() => setOpenSection(openSection === 'block_c' ? '' : 'block_c')}>
                                <div className="flex col gap-lg">
                                    {/* Main Rx Input (Reusing functionality) */}
                                    <OpticalEngineInput
                                        rx={rx}
                                        errors={errors}
                                        handleInputChange={handleInputChange}
                                        handleCalculate={handleCalculate}
                                        embed={true}
                                    />

                                    {/* Computed Results Warning/Display */}
                                    {result && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
                                            <Activity size={14} />
                                            <b>Cálculo Listo:</b>
                                            <span>OD: {result.od.sph} {result.od.cyl} x {result.od.axis}</span> |
                                            <span>OI: {result.oi.sph} {result.oi.cyl} x {result.oi.axis}</span>
                                        </div>
                                    )}

                                    {/* Extra Rx Fields: VL, ADD, IOP */}
                                    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px', alignItems: 'start' }}>
                                        {/* Left: Fundus Drawing */}
                                        <div>
                                            <label className="text-sm font-bold text-gray block mb-2">Fondo de Ojo / Retina</label>
                                            <FundusCanvas
                                                drawing={exam.fundusDrawing}
                                                onDraw={(p, remove) => {
                                                    if (remove) {
                                                        const newD = [...(exam.fundusDrawing || [])];
                                                        newD.pop();
                                                        handleExamChange('fundusDrawing', newD);
                                                    } else {
                                                        handleExamChange('fundusDrawing', [...(exam.fundusDrawing || []), p]);
                                                    }
                                                }}
                                            />
                                            <p className="text-[10px] text-gray-400 italic text-center mt-1">Dibujar anomalías (Puntos)</p>
                                        </div>

                                        {/* Right: Extra Fields Table */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-sm font-bold text-gray block mb-4 border-b border-gray-200 pb-2">Datos Complementarios</label>

                                            <div className="grid" style={{ gridTemplateColumns: '50px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <div></div>
                                                <div className="text-center text-xs font-bold text-primary">OD</div>
                                                <div className="text-center text-xs font-bold text-success">OI</div>
                                            </div>

                                            {/* Row VL */}
                                            <div className="grid mb-3" style={{ gridTemplateColumns: '50px 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                                                <span className="text-xs font-bold text-gray">A. Visual</span>
                                                <input type="text" className="input-field p-1 text-center text-sm" placeholder="20/20" value={exam.rx_od_vl} onChange={(e) => handleExamChange('rx_od_vl', e.target.value)} />
                                                <input type="text" className="input-field p-1 text-center text-sm" placeholder="20/20" value={exam.rx_oi_vl} onChange={(e) => handleExamChange('rx_oi_vl', e.target.value)} />
                                            </div>

                                            {/* Row ADD */}
                                            <div className="grid mb-3" style={{ gridTemplateColumns: '50px 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                                                <span className="text-xs font-bold text-gray">ADD</span>
                                                <NumberInput value={exam.rx_od_add} onChange={(v) => handleExamChange('rx_od_add', v)} placeholder="+2.00" step={0.25} forcePlus={true} />
                                                <NumberInput value={exam.rx_oi_add} onChange={(v) => handleExamChange('rx_oi_add', v)} placeholder="+2.00" step={0.25} forcePlus={true} />
                                            </div>

                                            {/* Row IOP */}
                                            <div className="grid" style={{ gridTemplateColumns: '50px 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                                                <span className="text-xs font-bold text-gray">PIO</span>
                                                <input type="number" className="input-field p-1 text-center text-sm" placeholder="mmHg" value={exam.rx_od_iop} onChange={(e) => handleExamChange('rx_od_iop', e.target.value)} />
                                                <input type="number" className="input-field p-1 text-center text-sm" placeholder="mmHg" value={exam.rx_oi_iop} onChange={(e) => handleExamChange('rx_oi_iop', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>
                        </div>
                    )
                }


                {/* STEP 3: MOTOR OCULAR (Block A) */}
                {/* STEP 3: OCULOMOTOR */}
                {
                    currentStep === 3 && (
                        <div className="fade-in flex col gap-md">
                            <h3 className="text-md font-bold text-primary" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>Módulo Oculomotor</h3>

                            {/* Unified Layout: Table + Motility Side-by-Side */}
                            {/* Unified Layout: Table + Motility Side-by-Side */}

                            {/* Unified Layout: Table + Motility Side-by-Side */}
                            <div className="h-[500px] overflow-y-auto pr-2">
                                <div className="flex gap-2 items-start">

                                    {/* Unified Table: Cover Test & PPC */}
                                    <div className="rounded-lg border border-gray-200 overflow-hidden w-fit bg-white shadow-sm h-fit">
                                        <table className="w-auto border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    {/* Col 1: Cover Test (Labels) */}
                                                    <th className="p-1 px-3 text-center border-r border-gray-100 w-[200px]">
                                                        <span className="text-sm font-bold text-[#2B3674] uppercase">Cover Test</span>
                                                    </th>
                                                    {/* Col 2: PPC (Inputs) */}
                                                    <th className="p-1 px-3 text-center w-[200px]">
                                                        <span className="text-sm font-bold text-[#2B3674] uppercase">PPC</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* 6m */}
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        6m
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.ppc_6m} onChange={(e) => handleExamChange('ppc_6m', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                                {/* 50cm */}
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        50cm
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.ppc_50cm} onChange={(e) => handleExamChange('ppc_50cm', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                                {/* 30cm */}
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        30cm
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.ppc_30cm} onChange={(e) => handleExamChange('ppc_30cm', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                                {/* 20cm */}
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        20cm
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        {/* Using generic exam_20cm here mapped to the single input column */}
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.exam_20cm} onChange={(e) => handleExamChange('exam_20cm', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                                {/* RFP */}
                                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        RFP
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.rfp} onChange={(e) => handleExamChange('rfp', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                                {/* RFN */}
                                                <tr className="last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">
                                                        RFN
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-"
                                                            value={exam.rfn} onChange={(e) => handleExamChange('rfn', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Right Side Group: Motility + Pruebas Adicionales (Side by Side) */}
                                    <div className="flex gap-2 items-start">
                                        {/* Pruebas Adicionales Table */}
                                        <div className="rounded-lg border border-gray-200 overflow-hidden w-fit bg-white shadow-sm h-fit">
                                            <table className="w-auto border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="p-1 px-3 text-center border-r border-gray-100 w-[160px]">
                                                            <span className="text-sm font-bold text-[#2B3674] uppercase">Pruebas Adic.</span>
                                                        </th>
                                                        <th className="p-1 px-3 text-center w-[160px]">
                                                            <span className="text-sm font-bold text-[#2B3674] uppercase">Resultados</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">Ducciones</td>
                                                        <td className="p-1 align-middle"><input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-" value={exam.ductions} onChange={(e) => handleExamChange('ductions', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} /></td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">Versiones</td>
                                                        <td className="p-1 align-middle"><input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-" value={exam.versions} onChange={(e) => handleExamChange('versions', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} /></td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">Ángulo Kappa</td>
                                                        <td className="p-1 align-middle"><input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-" value={exam.kappa} onChange={(e) => handleExamChange('kappa', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} /></td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-1 bg-gray-50/30 font-bold text-xs text-gray-500 text-center align-middle border-r border-gray-100">Test de Hirschberg</td>
                                                        <td className="p-1 align-middle"><input type="text" className="input-field w-full text-center h-7 text-sm" placeholder="-" value={exam.hirschberg} onChange={(e) => handleExamChange('hirschberg', e.target.value)} disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}} /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Motility Diagram */}
                                        {/* Motility Diagram - wrapper simplified */}
                                        {/* Motility Diagram - Modal Trigger */}
                                        <div className="rounded-lg border border-gray-200 overflow-hidden w-[300px] bg-white shadow-sm p-4 flex flex-col items-center justify-center gap-2">
                                            <span className="text-sm font-bold text-[#2B3674]">Motilidad Ocular</span>
                                            <button
                                                onClick={() => setIsMotilityModalOpen(true)}
                                                className={`w-full h-[38px] px-4 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all border flex items-center justify-center gap-2 ${(exam.motilityDrawing && exam.motilityDrawing.length > 0)
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-emerald-200'
                                                    : 'bg-gradient-to-r from-[#2B3674] to-blue-700 text-white border-transparent shadow-blue-200'
                                                    }`}
                                            >
                                                {(exam.motilityDrawing && exam.motilityDrawing.length > 0) ? (
                                                    <>
                                                        <Sparkles size={14} className="text-white" />
                                                        <span className="drop-shadow-sm text-white">Editar Motilidad</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Activity size={14} className="text-blue-100" />
                                                        <span className="drop-shadow-sm text-white">Introducir Motilidad</span>
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-gray-400">Registre hallazgos y marque el diagrama</p>

                                            {/* Modal Component */}
                                            <CanvasModal
                                                isOpen={isMotilityModalOpen}
                                                onClose={() => setIsMotilityModalOpen(false)}
                                                title="Motilidad Ocular"
                                                description="Haga clic en el diagrama para marcar las anomalías."
                                                icon={Activity}
                                                onClear={() => handleExamChange('motilityDrawing', [])}
                                            >
                                                <MotilityCanvas
                                                    observations={exam.motilityDrawing}
                                                    readOnly={readOnly}
                                                    onAddObservation={(obs, removeLast) => {
                                                        if (removeLast) {
                                                            const newObs = [...(exam.motilityDrawing || [])];
                                                            newObs.pop();
                                                            handleExamChange('motilityDrawing', newObs);
                                                        } else {
                                                            handleExamChange('motilityDrawing', [...(exam.motilityDrawing || []), obs]);
                                                        }
                                                    }}
                                                />
                                            </CanvasModal>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    )
                }

                {/* STEP 4: RETINOSCOPIA (Block B) */}
                {
                    currentStep === 4 && (
                        <div className="fade-in flex col gap-md">
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '8px' }}>
                                <h3 className="text-md font-bold text-primary">Retinoscopía y Queratometría</h3>
                            </div>

                            {patient?.lastRx && patient.lastRx !== '--' && (
                                <div className="mb-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3 shadow-sm w-fit">
                                    <div className="p-1.5 bg-white rounded-md shadow-sm">
                                        <History size={14} className="text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-blue-800 uppercase tracking-widest">Rx Anterior (Referencia)</span>
                                        <span className="text-xs font-semibold text-blue-900">{patient.lastRx}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 items-start w-fit pr-2">
                                {/* Col 1: Retinoscopía */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Retinoscopia</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ flex: '1', paddingRight: '2px' }}>
                                        {[
                                            { label: 'Estática', keyOD: 'retino_static_od', keyOI: 'retino_static_oi' },
                                            { label: 'Dinámica', keyOD: 'retino_dynamic_od', keyOI: 'retino_dynamic_oi' },
                                            { label: 'Cicloplégica', keyOD: 'retino_cycloplegic_od', keyOI: 'retino_cycloplegic_oi' },
                                            { label: 'Otra', keyOD: 'retino_other_od', keyOI: 'retino_other_oi' }
                                        ].map((test) => (
                                            <div key={test.label} className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-bold text-gray-500">{test.label}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {/* OD ROW */}
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                        <input
                                                            type="text"
                                                            className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                            placeholder="Esf / Cil x Eje"
                                                            value={exam[test.keyOD]}
                                                            onChange={(e) => handleExamChange(test.keyOD, e.target.value)}
                                                        />
                                                    </div>
                                                    {/* OI ROW */}
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                        <input
                                                            type="text"
                                                            className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                            placeholder="Esf / Cil x Eje"
                                                            value={exam[test.keyOI]}
                                                            onChange={(e) => handleExamChange(test.keyOI, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                {/* Queratometría */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Queratometría</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ paddingRight: '2px' }}>
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-gray-500">Valores K</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {/* OD ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                        placeholder="D1 / D2 @ Eje"
                                                        value={exam.kerato_od}
                                                        onChange={(e) => handleExamChange('kerato_od', e.target.value)}
                                                    />
                                                </div>
                                                {/* OI ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                        placeholder="D1 / D2 @ Eje"
                                                        value={exam.kerato_oi}
                                                        onChange={(e) => handleExamChange('kerato_oi', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acomodación (ACC) - Moved here */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Acomodación (ACC)</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ paddingRight: '2px' }}>
                                        {[
                                            { label: 'Amplitud', keyOD: 'acc_amp_od', keyOI: 'acc_amp_oi' },
                                            { label: 'Flexibilidad', keyOD: 'acc_flex_od', keyOI: 'acc_flex_oi' }
                                        ].map((test) => (
                                            <div key={test.label} className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-bold text-gray-500">{test.label}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {/* OD ROW */}
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                        <input
                                                            type="text"
                                                            className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                            placeholder="-"
                                                            value={exam[test.keyOD]}
                                                            onChange={(e) => handleExamChange(test.keyOD, e.target.value)}
                                                        />
                                                    </div>
                                                    {/* OI ROW */}
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                        <input
                                                            type="text"
                                                            className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                            placeholder="-"
                                                            value={exam[test.keyOI]}
                                                            onChange={(e) => handleExamChange(test.keyOI, e.target.value)}
                                                            disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                            </div>
                        </div>
                    )
                }

                {/* STEP 5: REFRACCIÓN Y FONDO */}
                {
                    currentStep === 5 && (
                        <div className="fade-in flex col gap-md w-full">
                            <h3 className="text-md font-bold text-primary" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>Rx Final y Fondo de Ojo</h3>

                            <div className="flex gap-2 items-start w-fit pr-2">
                                {/* Col 1: Refracción A */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Refracción A</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ flex: '1', paddingRight: '2px' }}>
                                        {/* DIP Card */}
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="grid grid-cols-2 gap-2 mb-0.5">
                                                <span className="text-xs font-bold text-gray-500 text-center">DIP</span>
                                                <span className="text-xs font-bold text-gray-500 text-center">Altura</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    className="w-full h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                    placeholder="mm"
                                                    value={exam.dip}
                                                    onChange={(e) => handleExamChange('dip', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                    placeholder="mm"
                                                    value={exam.altura}
                                                    onChange={(e) => handleExamChange('altura', e.target.value)}
                                                    disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                />
                                            </div>
                                        </div>

                                        {/* Subjetivo Card */}
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-gray-500">Subjetivo</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {/* OD ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                        value={exam.subjetivo_od}
                                                        onChange={(e) => handleExamChange('subjetivo_od', e.target.value)}
                                                    />
                                                </div>
                                                {/* OI ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                        value={exam.subjetivo_oi}
                                                        onChange={(e) => handleExamChange('subjetivo_oi', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Col 2: Refracción B */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Refracción B</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ flex: '1', paddingRight: '2px' }}>
                                        {/* Afinación Card */}
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-gray-500">Afinación</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {/* OD ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                        value={exam.afinacion_od}
                                                        onChange={(e) => handleExamChange('afinacion_od', e.target.value)}
                                                    />
                                                </div>
                                                {/* OI ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                        value={exam.afinacion_oi}
                                                        onChange={(e) => handleExamChange('afinacion_oi', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rx Final Card (Structured) */}
                                        <div className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-blue-100 shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-[#2B3674] flex items-center gap-2">
                                                    <Activity size={16} className="text-blue-500" />
                                                    Rx Final
                                                </span>
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                                    Edición
                                                </span>
                                            </div>

                                            {/* Header */}
                                            <div className="grid grid-cols-4 gap-3 mb-1 px-1">
                                                <div></div>
                                                <span className="text-[11px] text-center font-bold text-gray-400">Esfera</span>
                                                <span className="text-[11px] text-center font-bold text-gray-400">Cilindro</span>
                                                <span className="text-[11px] text-center font-bold text-gray-400">Eje</span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* OD ROW */}
                                                <div className="grid grid-cols-4 gap-3 items-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-sm">OD</div>
                                                    </div>
                                                    <RxInput value={rx.od.sph} onChange={(v) => handleInputChange('od', 'sph', v)} placeholder="+0.00" step={0.25} type="sph" error={errors.od_sph} readOnly={readOnly} />
                                                    <RxInput value={rx.od.cyl} onChange={(v) => handleInputChange('od', 'cyl', v)} placeholder="-0.00" step={-0.25} type="cyl" error={errors.od_cyl} readOnly={readOnly} />
                                                    <RxInput value={rx.od.axis} onChange={(v) => handleInputChange('od', 'axis', v)} placeholder="180" step={5} type="axis" min={0} max={180} error={errors.od_axis} readOnly={readOnly} />
                                                </div>
                                                {/* OI ROW */}
                                                <div className="grid grid-cols-4 gap-3 items-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200 shadow-sm">OI</div>
                                                    </div>
                                                    <RxInput value={rx.oi.sph} onChange={(v) => handleInputChange('oi', 'sph', v)} placeholder="+0.00" step={0.25} type="sph" error={errors.oi_sph} readOnly={readOnly} />
                                                    <RxInput value={rx.oi.cyl} onChange={(v) => handleInputChange('oi', 'cyl', v)} placeholder="-0.00" step={-0.25} type="cyl" error={errors.oi_cyl} readOnly={readOnly} />
                                                    <RxInput value={rx.oi.axis} onChange={(v) => handleInputChange('oi', 'axis', v)} placeholder="180" step={5} type="axis" min={0} max={180} error={errors.oi_axis} readOnly={readOnly} />
                                                </div>
                                            </div>

                                            {/* Calculate Button */}
                                            <button
                                                onClick={handleCalculate}
                                                className="mt-3 w-full py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98]"
                                                title="Calcular Transposición"
                                            >
                                                <RefreshCw size={14} /> Transponer Valores
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Col 3: Complementarios & Fondo */}
                                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-main">Complementarios</span>
                                    </div>
                                    <div className="flex flex-col gap-1" style={{ flex: '1', paddingRight: '2px' }}>
                                        {/* ADD Card */}
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-gray-500">ADD</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-8 flex-none bg-gray-400 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">AO</div>
                                                <input
                                                    type="text"
                                                    className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                    placeholder="+2.00"
                                                    value={exam.rx_od_add}
                                                    onChange={(e) => handleExamChange('rx_od_add', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* PIO Card */}
                                        <div className="flex flex-col gap-1 p-1 bg-white rounded-lg border border-[#F4F7FE] shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-gray-500">PIO (mmHg)</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {/* OD ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OD</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                        placeholder="mmHg"
                                                        value={exam.rx_od_iop}
                                                        onChange={(e) => handleExamChange('rx_od_iop', e.target.value)}
                                                    />
                                                </div>
                                                {/* OI ROW */}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 flex-none bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded text-center shadow-sm">OI</div>
                                                    <input
                                                        type="text"
                                                        className="w-[160px] flex-none h-8 bg-[#F4F7FE] rounded-lg text-center text-sm font-medium text-[#2B3674] border-none outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-400"
                                                        placeholder="mmHg"
                                                        value={exam.rx_oi_iop}
                                                        onChange={(e) => handleExamChange('rx_oi_iop', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        {/* Fundus Card */}
                                        <div className="rounded-lg border border-gray-200 overflow-hidden w-full bg-white shadow-sm p-4 flex flex-col items-center justify-center gap-2">
                                            <span className="text-sm font-bold text-[#2B3674]">Fondo de Ojo</span>
                                            <button
                                                onClick={() => setIsFundusModalOpen(true)}
                                                className={`w-full h-[38px] px-4 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all border flex items-center justify-center gap-2 ${(exam.fundusDrawing && exam.fundusDrawing.length > 0)
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-emerald-200'
                                                    : 'bg-gradient-to-r from-[#2B3674] to-blue-700 text-white border-transparent shadow-blue-200'
                                                    }`}
                                            >
                                                {(exam.fundusDrawing && exam.fundusDrawing.length > 0) ? (
                                                    <>
                                                        <Sparkles size={14} className="text-white" />
                                                        <span className="drop-shadow-sm text-white">Editar Fondo de Ojos</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={14} className="text-blue-100" />
                                                        <span className="drop-shadow-sm text-white">Dibujar Fondo de Ojos</span>
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-gray-400">Registre hallazgos y marque el diagrama</p>
                                            <CanvasModal
                                                isOpen={isFundusModalOpen}
                                                onClose={() => setIsFundusModalOpen(false)}
                                                title="Fondo de Ojos"
                                                description="Registre hallazgos y marque el diagrama."
                                                icon={Eye}
                                                onClear={() => handleExamChange('fundusDrawing', [])}
                                            >
                                                <div className="grid grid-cols-2 gap-4 mb-4 w-full">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-xs text-[#2B3674]">Ojo Derecho (AD)</span>
                                                        <textarea
                                                            className="input-field w-full text-sm p-2 resize-none h-[80px] border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                            placeholder="Descripción OD..."
                                                            value={exam.fundus_od_text}
                                                            onChange={(e) => handleExamChange('fundus_od_text', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-xs text-[#2B3674]">Ojo Izquierdo (OI)</span>
                                                        <textarea
                                                            className="input-field w-full text-sm p-2 resize-none h-[80px] border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                            placeholder="Descripción OI..."
                                                            value={exam.fundus_oi_text}
                                                            onChange={(e) => handleExamChange('fundus_oi_text', e.target.value)}
                                                            disabled={readOnly} style={readOnly ? { opacity: 0.7 } : {}}
                                                        />
                                                    </div>
                                                </div>
                                                <FundusCanvas
                                                    drawing={exam.fundusDrawing}
                                                    readOnly={readOnly}
                                                    onDraw={(p, remove) => {
                                                        if (remove) {
                                                            const newD = [...(exam.fundusDrawing || [])];
                                                            newD.pop();
                                                            handleExamChange('fundusDrawing', newD);
                                                        } else {
                                                            handleExamChange('fundusDrawing', [...(exam.fundusDrawing || []), p]);
                                                        }
                                                    }}
                                                />
                                            </CanvasModal>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* STEP 6: DIAGNOSIS */}
                {
                    currentStep === 6 && (
                        <div className="fade-in flex col gap-md">
                            <h3 className="text-md font-bold text-primary" style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: '12px' }}>Diagnóstico y Plan</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
                                {/* Left Col: Analysis & Diagnosis */}
                                <div className="flex col gap-3">
                                    <div className="flex col gap-4" style={{ flex: '1', overflowY: 'auto', paddingRight: '4px' }}>

                                        {/* Suggested Diagnosis Badge */}
                                        {/* Suggested Diagnosis Badge */}
                                        {/* Suggested Diagnosis Badge */}
                                        {rx && (() => {
                                            const smartDiagnosis = calculateSmartDiagnosis(rx, exam);
                                            const hasFindings = !!smartDiagnosis;
                                            return (
                                                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white p-1.5 rounded-full shadow-sm">
                                                            <Sparkles size={16} className="text-purple-600" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Análisis IA</span>
                                                            <span className={`text-sm font-bold ${hasFindings ? 'text-purple-700' : 'text-gray-500'}`}>
                                                                {smartDiagnosis || "Sin hallazgos significativos"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (hasFindings && !readOnly) {
                                                                handleDiagnosisChange('diagnosisMain', smartDiagnosis);
                                                            }
                                                        }}
                                                        disabled={!hasFindings || readOnly}
                                                        className={`text-xs font-bold border px-3 py-1.5 rounded-lg transition-colors shadow-sm ${hasFindings && !readOnly
                                                            ? 'text-purple-600 border-purple-200 bg-white hover:bg-purple-100 cursor-pointer'
                                                            : 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                                            }`}
                                                    >
                                                        Usar Sugerencia
                                                    </button>
                                                </div>
                                            );
                                        })()}

                                        {/* Diagnosis Card */}
                                        <div className="flex col gap-1 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#2B3674]">Diagnóstico Principal (CIE-10)</span>
                                            </div>
                                            <DiagnosisSearch
                                                value={diagnosis.diagnosisMain}
                                                onChange={(val) => handleDiagnosisChange('diagnosisMain', val)}
                                                readOnly={readOnly}
                                            />
                                        </div>

                                        {/* Next Control Card */}
                                        <div className="flex col gap-1 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#2B3674]">Próximo Control</span>
                                            </div>
                                            <input
                                                type="date"
                                                className="input-field w-full h-[45px] px-3 border border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
                                                value={diagnosis.nextControl}
                                                onChange={(e) => handleDiagnosisChange('nextControl', e.target.value)}
                                                disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                            />
                                            {diagnosis.nextControlReason && (
                                                <div className="mt-1 p-2 bg-blue-50 text-blue-700 text-[10px] rounded-lg border border-blue-100 flex gap-2 items-start">
                                                    <AlertCircle size={12} className="mt-0.5 flex-none" />
                                                    <span className="font-semibold">{diagnosis.nextControlReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Treatment Plan */}
                                <div className="flex col gap-3">
                                    <div className="flex col gap-2" style={{ flex: '1', overflowY: 'auto', paddingRight: '4px' }}>

                                        {/* Lab Specs Card */}
                                        <div className="flex col gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-bold text-[#2B3674]">Especificaciones de Laboratorio</label>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {/* Design */}
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-gray-400 font-bold">Diseño</span>
                                                    <select
                                                        className="input-field w-full h-[38px] px-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                                                        value={diagnosis.lab_design}
                                                        onChange={(e) => handleDiagnosisChange('lab_design', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Monofocal">Monofocal</option>
                                                        <option value="Bifocal">Bifocal</option>
                                                        <option value="Progresivo">Progresivo</option>
                                                        <option value="Ocupacional">Ocupacional</option>
                                                    </select>
                                                </div>
                                                {/* Material */}
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-gray-400 font-bold">Material</span>
                                                    <select
                                                        className="input-field w-full h-[38px] px-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                                                        value={diagnosis.lab_material}
                                                        onChange={(e) => handleDiagnosisChange('lab_material', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="CR39">CR39</option>
                                                        <option value="Policarbonato">Policarbonato</option>
                                                        <option value="Alto Índice 1.67">Alto Índice 1.67</option>
                                                        <option value="Trivex">Trivex</option>
                                                    </select>
                                                </div>
                                                {/* Coating */}
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-gray-400 font-bold">Tratamiento</span>
                                                    <select
                                                        className="input-field w-full h-[38px] px-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                                                        value={diagnosis.lab_coating}
                                                        onChange={(e) => handleDiagnosisChange('lab_coating', e.target.value)}
                                                        disabled={readOnly} style={readOnly ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Blanco">Blanco</option>
                                                        <option value="Antirreflejo (AR)">Antirreflejo (AR)</option>
                                                        <option value="Filtro Azul">Filtro Azul</option>
                                                        <option value="Fotocromático">Fotocromático</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex col gap-2">
                                            {/* Receta Médica Card */}
                                            <div className="flex col gap-2 p-3 bg-green-50/50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-xs font-bold text-[#2B3674]">Receta Médica (Fármacos)</label>
                                                    {!readOnly && (
                                                        <button
                                                            onClick={handleAddMedication}
                                                            className="text-xs font-bold text-green-600 bg-white border border-green-200 hover:bg-green-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                                                        >
                                                            <span className="text-lg leading-none mt-[-2px]">+</span> Añadir
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex col gap-2">
                                                    {(!diagnosis.medications || diagnosis.medications.length === 0) && (
                                                        <div className="text-xs text-gray-400 italic text-center py-2 bg-white/50 rounded-lg border border-dashed border-green-200">
                                                            No se han indicado fármacos.
                                                        </div>
                                                    )}
                                                    {(diagnosis.medications || []).map((med, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-green-100 relative pr-6">
                                                            {!readOnly && (
                                                                <button onClick={() => handleRemoveMedication(idx)} className="absolute top-2 right-1 text-gray-300 hover:text-red-500">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                            <input
                                                                type="text"
                                                                placeholder="Medicamento (Ej. Hyabak 0.15%)"
                                                                className="input-field w-full h-[32px] px-2 border border-gray-200 rounded-lg text-[11px] bg-white outline-none focus:border-green-500"
                                                                value={med.name}
                                                                onChange={(e) => handleUpdateMedication(idx, 'name', e.target.value)}
                                                                disabled={readOnly} style={readOnly ? { pointerEvents: 'none' } : {}}
                                                            />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Frec. (Ej. 1 gota c/8h)"
                                                                    className="input-field w-full h-[32px] px-2 border border-gray-200 rounded-lg text-[11px] bg-white outline-none focus:border-green-500"
                                                                    value={med.freq}
                                                                    onChange={(e) => handleUpdateMedication(idx, 'freq', e.target.value)}
                                                                    disabled={readOnly} style={readOnly ? { pointerEvents: 'none' } : {}}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Dur. (Ej. 15 días)"
                                                                    className="input-field w-full h-[32px] px-2 border border-gray-200 rounded-lg text-[11px] bg-white outline-none focus:border-green-500"
                                                                    value={med.duration}
                                                                    onChange={(e) => handleUpdateMedication(idx, 'duration', e.target.value)}
                                                                    disabled={readOnly} style={readOnly ? { pointerEvents: 'none' } : {}}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Treatment Plan Card */}
                                            <div className="flex col gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-xs font-bold text-[#2B3674]">Indicaciones Generales</label>
                                                </div>

                                                <textarea
                                                    className="input-field w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none resize-none text-sm leading-relaxed bg-white"
                                                    rows={4}
                                                    style={{ minHeight: '100px', flex: 1, ...(readOnly ? { opacity: 0.7 } : {}) }}
                                                    placeholder="Escriba recomendaciones de uso de lentes, higiene visual, etc..."
                                                    value={diagnosis.plan}
                                                    onChange={(e) => handleDiagnosisChange('plan', e.target.value)}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Summary of Rx to Confirm - PROFESSIONAL MEDICAL PRESCRIPTION STYLE */}
                {
                    (currentStep === 5 || currentStep === 6) && result && (
                        <div className="fade-in mt-1 w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden relative">
                            {/* Decorative Top Border */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                            <div className="p-2 relative">
                                {/* Medical Icon Watermark */}
                                <FileText className="absolute top-2 right-4 text-gray-50 opacity-10 rotate-12" size={40} />

                                {/* Header */}
                                <div className="flex items-center gap-2 mb-0.5 border-b border-gray-100 pb-0.5">
                                    <div className="bg-blue-50 p-1 rounded-lg">
                                        <FileText size={12} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">Receta Final Generada</h4>
                                        <p className="text-[8px] text-gray-400 font-medium leading-none">Documento de Referencia Clínica</p>
                                    </div>
                                </div>

                                {/* Prescription Body */}
                                <div className="grid gap-0.5">
                                    {/* OD Row */}
                                    <div className="flex items-center justify-between p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-blue-600 w-5">OD</div>
                                            <div className="flex gap-3 font-mono text-[10px] text-gray-700 font-bold">
                                                <span className="min-w-[30px] text-right">{result.od.sph}</span>
                                                <span className="min-w-[30px] text-right">{result.od.cyl}</span>
                                                <span className="text-gray-400 font-normal">x</span>
                                                <span className="min-w-[15px] text-left">{result.od.axis}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OI Row */}
                                    <div className="flex items-center justify-between p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-green-600 w-5">OI</div>
                                            <div className="flex gap-3 font-mono text-[10px] text-gray-700 font-bold">
                                                <span className="min-w-[30px] text-right">{result.oi.sph}</span>
                                                <span className="min-w-[30px] text-right">{result.oi.cyl}</span>
                                                <span className="text-gray-400 font-normal">x</span>
                                                <span className="min-w-[15px] text-left">{result.oi.axis}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-0.5 flex justify-end">
                                    <span className="text-[7px] text-gray-400 italic">Cálculo de transposición verificado</span>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >


            {/* Navigation Footer */}
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid #E0E5F2', paddingTop: '16px', marginTop: 'auto' }}>
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                    style={{
                        opacity: currentStep === 1 ? 0 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto',
                        padding: '8px 16px', borderRadius: '8px',
                        color: '#A3AED0', fontWeight: '600', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'transparent', border: 'none', cursor: 'pointer'
                    }}
                >
                    <ChevronLeft size={16} />
                    <span>Atrás</span>
                </button>
                <div className="flex gap-sm">
                    {/* Logic for Buttons: Steps 1-5 show "Siguiente", Step 6 shows "Finalizar" */}
                    {currentStep < 6 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary hover-up"
                            style={{ padding: '10px 24px', background: 'var(--color-primary)' }}
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={readOnly ? onExit : handleFinalize}
                            className="btn-primary hover-up"
                            style={{
                                padding: '10px 24px',
                                background: readOnly ? '#6c757d' : 'var(--color-success)',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {readOnly ? <ArrowRight size={16} /> : <Save size={16} />}
                            {readOnly ? 'Salir' : 'Finalizar'}
                        </button>
                    )}
                </div>
            </div >

            {/* Final Action Modal */}
            <FinalActionModal
                isOpen={isFinalActionModalOpen}
                onClose={() => setIsFinalActionModalOpen(false)}
                onFinish={confirmFinalize}
                onPrintRx={handlePrintPrescription}
                onPrintLab={handlePrintOrder}
            />
        </div >
    );
};


// --- DEFAULT EXPORT WRAPPER (Maintenance of previous behavior) ---
const OpticalEngineModule = ({ embed = false, withPatientInfo = true, editMode = false, readOnly = false, initialData = null, onBack, patient = null }) => {
    const [modalInfo, setModalInfo] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const handleError = (message) => {
        setModalInfo({
            isOpen: true,
            type: 'error',
            title: 'Campos Incompletos',
            message: message
        });
    };

    const { rx, result, errors, handleInputChange, handleCalculate, setRx, setResult } = useOpticalEngine(handleError, initialData?.rx || initialData, readOnly);
    const { getAllPatients } = usePatients();

    // Get real patients from context with fallback to empty array
    const allPatients = getAllPatients() || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(patient || null);
    // Removed useEffect to prevent potential loops/issues, relying on mount or explicit selection logic


    const filteredPatients = allPatients.filter(p =>
        (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p?.id || '').toString().includes(searchTerm)
    );

    const handleSearchSelect = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm('');
        setShowResults(false);
    };

    const handleSaveResult = (wizardData = null) => {
        if (!selectedPatient && !editMode) {
            setModalInfo({
                isOpen: true,
                type: 'error',
                title: 'Atención',
                message: 'Por favor, seleccione un paciente primero para guardar el resultado en su ficha.'
            });
            return false;
        }

        // Use wizardData if available, otherwise fallback to hook state
        const currentRx = wizardData?.refraction?.rx || rx;
        const currentResult = wizardData?.refraction?.result || result;

        // REMOVED VALIDATION per user request to ensure flow completes
        // if (!currentResult) { ... }

        if (editMode && initialData) {
            // Check against initialData structure (assuming initialData matches the full record structure or just rx depending on context)
            // For simplicity in wizard mode, we might skip deep comparison or implement it later if needed for strict "no changes" check.
            // If we want to keep it simple:
            const initialRx = initialData.refraction?.rx || initialData; // Handle different structures if any
            const isSameAsInitial = JSON.stringify(currentRx) === JSON.stringify(initialRx);

            if (isSameAsInitial) {
                setModalInfo({
                    isOpen: true,
                    type: 'info',
                    title: 'Sin Cambios',
                    message: 'No se han detectado cambios en la receta original.'
                });
                return false;
            }
        }

        // Mock Save Operation
        console.log("Saving Result for:", editMode ? "Clinical Edit" : selectedPatient.name);
        console.log("RX Data:", currentRx);
        console.log("Calculated Result:", currentResult);
        if (wizardData) console.log("Full Wizard Data:", wizardData);

        // NOTA: Ya no mostramos el modal de éxito aquí porque lo maneja handleWizardFinish con el loading
        // Solo retornamos true para indicar que la lógica de guardado pasó correctamente
        return true;
    };

    const handleWizardFinish = (wizardData, targetTab) => {
        // console.log("Wizard Finalized Data:", wizardData);

        // 1. Mostrar estado de carga (Loading Spinner)
        setModalInfo({
            isOpen: true,
            type: 'loading',
            title: 'Guardando Consulta',
            message: 'Guardando consulta... espere un momento...'
        });

        // 2. Simular guardado asíncrono
        setTimeout(() => {
            const success = handleSaveResult(wizardData); // Realiza la "grabación" mock pasando los datos del wizard

            if (success) {
                // 3. Mostrar estado de éxito (Check)
                setModalInfo({
                    isOpen: true,
                    type: 'success',
                    title: '¡Consulta Finalizada!',
                    message: `La consulta del paciente ${selectedPatient?.name || ''} ha sido finalizada con éxito`,
                    showButton: false // Ocultar botón "Aceptar"
                });

                // 4. Redirigir después de mostrar el éxito
                setTimeout(() => {
                    if (targetTab && onBack) {
                        onBack(targetTab);
                    } else {
                        setModalInfo({ isOpen: false });
                        // Reset internal state if no redirect happens (though it should)
                        setSelectedPatient(null);
                        setSearchTerm('');
                        setShowResults(false);
                        setRx({ od: { sph: '', cyl: '', axis: '', add: '' }, oi: { sph: '', cyl: '', axis: '', add: '' } });
                        setResult(null);
                    }
                }, 4000); // 4 segundos para ver el mensaje de éxito
            } else {
                // Si falla (handleSaveResult devuelve false), NO cerramos el modal arbitrariamente.
                // handleSaveResult ya habrá configurado el modal con el mensaje de error correspondiente.
                // setModalInfo({ isOpen: false }); // REMOVIDO para no ocultar el error
            }
        }, 2000); // 2 segundos de loading
    };

    return (
        <div className={`flex col gap-md ${embed ? '' : 'fade-in'}`}>
            {!embed && (
                <div className="flex items-center gap-sm">
                    <div style={{ padding: '8px', background: 'var(--color-primary)', borderRadius: '8px', color: 'white' }}>
                        <Eye size={20} />
                    </div>
                    <div>
                        <h2 className="text-md" style={{ fontSize: '20px' }}>Consultorio</h2>
                        <p className="text-sm" style={{ opacity: 0.7, fontSize: '12px' }}>Algoritmo de transposición y validación de laboratorio</p>
                    </div>
                </div>
            )}

            {/* Conditional Cards */}
            {/* Top Cards Removed - Moved to Sidebar for consistent layout */}

            {withPatientInfo && (
                <div className="grid fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(0, 1.5fr)', gap: '24px', margin: '0 0', alignItems: 'start' }}>

                    {/* LEFT COLUMN: Patient Context (Search, Info, History) */}
                    <div className="flex col gap-md">
                        {/* Standard Metrics Cards (Moved to Sidebar) */}
                        {/* Standard Metrics Cards (Moved to Sidebar) */}
                        {/* Standard Metrics Cards (Normal Mode) */}
                        {!editMode && (
                            <div className="grid fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {/* Citas Hoy */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
                                        <div style={{ padding: '6px', background: '#F4F7FE', borderRadius: '6px' }}>
                                            <Calendar size={16} color="var(--color-primary)" />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Citas Hoy</span>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2B3674' }}>8</div>
                                </div>

                                {/* Esta Semana */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
                                        <div style={{ padding: '6px', background: '#FFF8E1', borderRadius: '6px' }}>
                                            <Calendar size={16} color="#FFB547" />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Esta Semana</span>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2B3674' }}>42</div>
                                </div>

                                {/* Completadas */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
                                        <div style={{ padding: '6px', background: '#E6FDF9', borderRadius: '6px' }}>
                                            <Activity size={16} color="var(--color-success)" />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Completadas (Mes)</span>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2B3674' }}>18</div>
                                </div>

                                {/* Duración Promedio */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
                                        <div style={{ padding: '6px', background: '#F4F7FE', borderRadius: '6px' }}>
                                            <Activity size={16} color="#A3AED0" />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A3AED0', fontWeight: '600' }}>Duración Promedio</span>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2B3674' }}>45 min</div>
                                </div>
                            </div>
                        )}

                        {/* Edit Mode Patient Summary Cards (Replaces Metrics) */}
                        {editMode && selectedPatient && (
                            <div className="grid fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                {/* Card ID */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ padding: '8px', background: '#F4F7FE', borderRadius: '50%', color: 'var(--color-primary)' }}>
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#A3AED0', fontWeight: '600', textTransform: 'uppercase' }}>ID Paciente</p>
                                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#2B3674' }}>{selectedPatient.id}</h3>
                                        </div>
                                    </div>
                                </div>
                                {/* Card Name */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ padding: '8px', background: '#E6FDF9', borderRadius: '50%', color: 'var(--color-success)' }}>
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#A3AED0', fontWeight: '600', textTransform: 'uppercase' }}>Nombre</p>
                                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#2B3674' }}>{selectedPatient.name}</h3>
                                        </div>
                                    </div>
                                </div>
                                {/* Card Diagnosis */}
                                <div className="card hover-up" style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ padding: '8px', background: '#FFF8E1', borderRadius: '50%', color: '#FFB547' }}>
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#A3AED0', fontWeight: '600', textTransform: 'uppercase' }}>Diagnóstico</p>
                                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#2B3674' }}>
                                                {selectedPatient.currentRecord?.diagnosis || (readOnly ? initialData?.diagnosis?.diagnosisMain || 'Sin diagnóstico' : 'Pendiente')}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative" style={{ zIndex: 10 }}>
                            <div className="flex items-center gap-sm" style={{ background: 'white', padding: '12px 16px', borderRadius: '16px', border: '1px solid #E0E5F2', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <Search size={20} color="#A3AED0" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por nombre o ID..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#2B3674' }}
                                    onFocus={() => setShowResults(true)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchTerm && (
                                <div className="card fade-in" style={{ position: 'absolute', top: '110%', left: 0, right: 0, padding: '8px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 20 }}>
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleSearchSelect(p)}
                                                className="flex items-center gap-md cursor-pointer"
                                                style={{ padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#F4F7FE'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ width: '32px', height: '32px', background: '#F4F7FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#2B3674' }}>{p.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#A3AED0' }}>{p.age} • {p.occupation}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '12px', textAlign: 'center', color: '#A3AED0', fontSize: '13px' }}>No se encontraron pacientes</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Personal Info */}
                        <div className="card" style={{ padding: '16px', border: '1px solid #E0E5F2', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)', borderRadius: '12px' }}>
                            <h3 className="text-md flex items-center gap-xs" style={{ marginBottom: '12px', color: '#2B3674', fontSize: '14px', fontWeight: '700' }}>
                                <User size={16} color="var(--color-primary)" /> Información del Paciente
                            </h3>
                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#A3AED0', marginBottom: '4px' }}>Nombre</label>
                                    <div style={{ padding: '8px 12px', background: '#F8F9FA', borderRadius: '8px', fontSize: '14px', color: '#2B3674', fontWeight: '600', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPatient?.name || '--'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#A3AED0', marginBottom: '4px' }}>Edad</label>
                                    <div style={{ padding: '8px 12px', background: '#F8F9FA', borderRadius: '8px', fontSize: '14px', color: '#2B3674', fontWeight: '600', minHeight: '36px' }}>
                                        {selectedPatient?.age || '--'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#A3AED0', marginBottom: '4px' }}>Ocupación</label>
                                    <div style={{ padding: '8px 12px', background: '#F8F9FA', borderRadius: '8px', fontSize: '14px', color: '#2B3674', fontWeight: '600', minHeight: '36px' }}>
                                        {selectedPatient?.occupation || '--'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#A3AED0', marginBottom: '4px' }}>Notificaciones</label>
                                    <div style={{ padding: '8px 12px', background: '#F8F9FA', borderRadius: '8px', fontSize: '14px', color: '#2B3674', fontWeight: '600', minHeight: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {selectedPatient?.notificationsEnabled ? (
                                            <>
                                                {selectedPatient.notifyWhatsapp && <MessageCircle size={16} color="var(--color-success)" />}
                                                {selectedPatient.notifyEmail && <Mail size={16} color="var(--color-primary)" />}
                                                {!selectedPatient.notifyWhatsapp && !selectedPatient.notifyEmail && <span style={{ fontSize: '12px', color: '#A3AED0' }}>--</span>}
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#A3AED0' }}>--</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Summary (History) */}
                        <div className="card" style={{ padding: '16px', border: '1px solid #E0E5F2', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)', borderRadius: '12px', background: 'linear-gradient(135deg, #fff 0%, #F4F7FE 100%)' }}>
                            <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                                <h3 className="text-md flex items-center gap-xs" style={{ color: '#2B3674', fontSize: '14px', fontWeight: '700' }}>
                                    <Activity size={16} color="#FF69B4" /> Historia Clínica
                                </h3>
                                {selectedPatient && (
                                    <span style={{ background: '#E0E5F2', color: '#2B3674', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                                        {selectedPatient.consultationType}
                                    </span>
                                )}
                            </div>
                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {selectedPatient && (!selectedPatient.consultationReason && !selectedPatient.personalHistory && !selectedPatient.familyHistory) ? (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: '#FF5B5B', fontWeight: '600', background: '#FFF5F5', borderRadius: '12px' }}>
                                        Sin historia clínica
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ fontSize: '11px', color: '#A3AED0', display: 'block', fontWeight: '600' }}>MOTIVO DE CONSULTA</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568', display: 'block', minHeight: '20px' }}>{selectedPatient?.consultationReason || '--'}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#A3AED0', display: 'block', fontWeight: '600' }}>ANT. PERSONALES</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568', display: 'block', minHeight: '20px' }}>{selectedPatient?.personalHistory || '--'}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#A3AED0', display: 'block', fontWeight: '600' }}>ANT. FAMILIARES</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568', display: 'block', minHeight: '20px' }}>{selectedPatient?.familyHistory || '--'}</span>
                                        </div>
                                        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #CDD5E0' }}>
                                            <span style={{ fontSize: '11px', color: '#A3AED0', display: 'block', fontWeight: '600' }}>USUARIO DE LENTES</span>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', display: 'block', minHeight: '20px' }}>
                                                {selectedPatient?.usesLenses || '--'}
                                                {selectedPatient?.usesLenses === 'Si' && selectedPatient?.lensesDuration ? ` (${selectedPatient.lensesDuration})` : ''}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #CDD5E0' }}>
                                            <span style={{ fontSize: '11px', color: '#A3AED0', display: 'block', fontWeight: '600' }}>ÚLTIMA Rx</span>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', display: 'block', minHeight: '20px' }}>{selectedPatient?.lastRx || '--'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Consultation Wizard */}
                    <div className="flex col" style={{ height: '100%' }}>
                        {selectedPatient ? (
                            <ConsultationWizard
                                patient={selectedPatient}
                                onFinish={handleWizardFinish}
                                initialData={initialData}
                                readOnly={readOnly}
                                onExit={onBack}
                            />
                        ) : (
                            <div className="card flex items-center justify-center p-xl" style={{ height: '100%', minHeight: '400px', border: '2px dashed #E0E5F2', borderRadius: '16px', background: '#FAFCFE', color: '#A3AED0' }}>
                                <div className="text-center">
                                    <User size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                    <p>Seleccione un paciente para iniciar la consulta</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Edit Mode Wizard Container (Full Width) */}
            {!withPatientInfo && editMode && selectedPatient && (
                <div className="fade-in" style={{ marginTop: '20px' }}>
                    <ConsultationWizard
                        patient={selectedPatient}
                        onFinish={handleWizardFinish}
                        initialData={initialData}
                        readOnly={readOnly}
                        onExit={onBack}
                    />
                </div>
            )}

            {/* Optical Engine Section - Always Visible */}
            {/* Optical Engine Section - REMOVED per redesign request */}
            {/* <OpticalEngineInput /> and <OpticalEngineResult /> were here */}

            <StatusModal
                isOpen={modalInfo.isOpen}
                onClose={() => {
                    setModalInfo(prev => ({ ...prev, isOpen: false }));
                    if (modalInfo.type === 'success') {
                        if (editMode && onBack) {
                            onBack();
                        } else if (modalInfo.redirectTab) {
                            if (onBack) onBack(modalInfo.redirectTab);
                        } else {
                            setSelectedPatient(null);
                            setSearchTerm('');

                            setShowResults(false);
                            setRx({
                                od: { sph: '', cyl: '', axis: '', add: '' },
                                oi: { sph: '', cyl: '', axis: '', add: '' }
                            });
                            setResult(null);
                        }
                    }
                }}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
                showButton={modalInfo.showButton}
            />
        </div >
    );
};

export default OpticalEngineModule;
