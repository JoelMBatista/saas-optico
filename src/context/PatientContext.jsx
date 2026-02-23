import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const usePatients = () => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatients must be used within a PatientProvider');
    }
    return context;
};

export const PatientProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);

    // Load patients from localStorage on mount
    useEffect(() => {
        const storedPatients = localStorage.getItem('patients');
        if (storedPatients) {
            try {
                setPatients(JSON.parse(storedPatients));
            } catch (error) {
                console.error('Error loading patients from localStorage:', error);
            }
        }
    }, []);

    // Save patients to localStorage whenever they change
    useEffect(() => {
        if (patients.length > 0) {
            localStorage.setItem('patients', JSON.stringify(patients));
        }
    }, [patients]);

    const addPatient = (patientData) => {
        const newPatient = {
            ...patientData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
    };

    const getPatientById = (id) => {
        return patients.find(p => p.id === id);
    };

    const updatePatient = (id, updatedData) => {
        setPatients(prev => prev.map(p =>
            p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString() } : p
        ));
    };

    const getAllPatients = () => {
        return patients;
    };

    const deletePatient = (id) => {
        setPatients(prev => prev.filter(p => p.id !== id));
        // Update localStorage
        const updatedPatients = patients.filter(p => p.id !== id);
        if (updatedPatients.length > 0) {
            localStorage.setItem('patients', JSON.stringify(updatedPatients));
        } else {
            localStorage.removeItem('patients');
        }
    };

    const value = {
        patients,
        addPatient,
        getPatientById,
        updatePatient,
        getAllPatients,
        deletePatient
    };

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
};

export default PatientContext;
