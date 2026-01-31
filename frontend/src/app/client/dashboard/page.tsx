'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { apiService } from '@/services/api.service';

export default function ClientDashboard() {
    const currentUser = useAuthStore((state) => state.user);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            if (currentUser?.id) {
                const data = await apiService.getUser(currentUser.id);
                setUserData(data);
                setName(data.name);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (currentUser?.id) {
                await apiService.updateUser(currentUser.id, { name });
                await loadUserData();
                setEditing(false);
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['client']}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                        <p className="mt-4 text-text-secondary">Cargando perfil...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['client']}>
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Navbar />

                    {/* Bienvenida */}
                    <div className="glass-card p-8 mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            ¡Hola, <span className="gradient-text">{currentUser?.name}</span>!
                        </h2>
                        <p className="text-text-secondary">
                            Bienvenido a tu perfil personal
                        </p>
                    </div>

                    {/* Información del perfil */}
                    <div className="glass-card p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Mi Perfil</h3>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="btn-secondary px-4 py-2 text-sm"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-blue flex items-center justify-center text-white text-3xl font-bold">
                                    {userData?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-text-tertiary text-sm mb-1">Foto de perfil</p>
                                    <p className="text-sm text-text-secondary">
                                        Tu avatar se genera automáticamente con la inicial de tu nombre
                                    </p>
                                </div>
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre completo</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input max-w-md"
                                    />
                                ) : (
                                    <p className="text-lg">{userData?.name}</p>
                                )}
                            </div>

                            {/* Email (no editable) */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg text-text-secondary">{userData?.email}</p>
                                    <span className="px-2 py-1 rounded text-xs bg-border text-text-tertiary">
                                        No editable
                                    </span>
                                </div>
                            </div>

                            {/* Rol */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Rol</label>
                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-accent-blue/20 text-accent-blue inline-block">
                                    Cliente
                                </span>
                            </div>

                            {/* Fecha de registro */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Miembro desde</label>
                                <p className="text-lg text-text-secondary">
                                    {new Date(userData?.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {/* Botones de acción */}
                            {editing && (
                                <div className="flex gap-3 pt-4">
                                    <button onClick={handleSave} className="btn-success px-6 py-2">
                                        Guardar cambios
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setName(userData?.name);
                                        }}
                                        className="btn-secondary px-6 py-2"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="glass-card p-8">
                        <h3 className="text-2xl font-bold mb-6">Seguridad</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
                                <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div>
                                    <p className="font-medium mb-1">Autenticación biométrica activa</p>
                                    <p className="text-sm text-text-secondary">
                                        Tu cuenta está protegida con reconocimiento facial
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-elevated border border-border">
                                <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div>
                                    <p className="font-medium mb-1">Datos biométricos seguros</p>
                                    <p className="text-sm text-text-secondary">
                                        Tu información biométrica nunca sale de tu dispositivo. Solo almacenamos una clave pública cifrada.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-elevated border border-border">
                                <svg className="w-6 h-6 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium mb-1">Cumplimiento GDPR</p>
                                    <p className="text-sm text-text-secondary">
                                        Cumplimos con todas las regulaciones de privacidad y protección de datos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
