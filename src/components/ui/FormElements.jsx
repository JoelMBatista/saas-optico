import React from 'react';

export const OutlinedInput = ({ label, type = "text", placeholder, defaultValue, icon, value, onChange, required = true, style }) => (
    <div className="flex col" style={{ position: 'relative', ...style }}>
        <label className="text-sm" style={{
            position: 'absolute',
            top: '-7px',
            left: '12px',
            background: 'white',
            padding: '0 4px',
            color: 'var(--color-primary)',
            fontSize: '10px',
            fontWeight: '600',
            zIndex: 1
        }}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
        <div className="flex items-center" style={{
            border: '1px solid #E0E5F2',
            borderRadius: '6px',
            padding: '6px 10px',
            background: 'white'
        }}>
            <input
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
                className="w-full"
                style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text-main)' }}
            />
            {icon && <div style={{ color: 'var(--color-primary)' }}>{icon}</div>}
        </div>
    </div>
);

export const OutlinedSelect = ({ label, options, value, onChange, style }) => (
    <div className="flex col" style={{ position: 'relative', ...style }}>
        <label className="text-sm" style={{
            position: 'absolute',
            top: '-7px',
            left: '12px',
            background: 'white',
            padding: '0 4px',
            color: 'var(--color-primary)',
            fontSize: '10px',
            fontWeight: '600',
            zIndex: 1
        }}>
            {label}
        </label>
        <div className="flex items-center" style={{
            border: '1px solid #E0E5F2',
            borderRadius: '6px',
            padding: '6px 10px',
            background: 'white',
        }}>
            <select
                className="w-full"
                value={value}
                onChange={onChange}
                style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text-main)', background: 'white' }}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    </div>
);

export const OutlinedTextArea = ({ label, placeholder, value, onChange, rows = 3, style }) => (
    <div className="flex col" style={{ position: 'relative', ...style }}>
        <label className="text-sm" style={{
            position: 'absolute',
            top: '-7px',
            left: '12px',
            background: 'white',
            padding: '0 4px',
            color: 'var(--color-primary)',
            fontSize: '10px',
            fontWeight: '600',
            zIndex: 1
        }}>
            {label}
        </label>
        <div className="flex items-center" style={{
            border: '1px solid #E0E5F2',
            borderRadius: '6px',
            padding: '8px 10px',
            background: 'white',
        }}>
            <textarea
                className="w-full"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text-main)', resize: 'none', fontFamily: 'inherit' }}
            />
        </div>
    </div>
);
