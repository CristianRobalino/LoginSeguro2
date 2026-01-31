'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api.service';
import WebcamCapture from '@/components/WebcamCapture';

export default function RegisterPage() {
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Credenciales, 2: Captura facial
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    /**
     * Paso 1: Enviar credenciales al backend
     */
    async function handleCredentialsSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Validar contraseñas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            await apiService.startRegistration(
                formData.email,
                formData.name,
                formData.password
            );

            // Pasar al paso 2: Captura facial
            setStep(2);
        } catch (err: any) {
            console.error('Error en registro:', err);
            setError(err.response?.data?.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    }

    /**
     * Paso 2: Enviar descriptor facial
     */
    async function handleFaceCapture(descriptor: number[]) {
        setLoading(true);
        setError('');

        try {
            await apiService.verifyFaceRegistration(formData.email, descriptor);
            setSuccess(true);

            // Redirigir a login después de 2 segundos
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            console.error('Error en verificación facial:', err);
            setError(err.response?.data?.message || 'Error al registrar rostro');
            setLoading(false);
        }
    }

    // Pantalla de éxito
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card-elevated p-8 text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
                        <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">¡Registro exitoso!</h2>
                    <p className="text-text-secondary">
                        Tu cuenta ha sido creada con reconocimiento facial. Redirigiendo al login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-background to-accent-cyan/20"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="glass-card-elevated p-8 md:p-12 w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue mb-4 pulse-glow">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Registro</span>
                    </h1>
                    <p className="text-text-secondary">
                        {step === 1 ? 'Crea tu cuenta' : 'Registra tu rostro'}
                    </p>
                </div>

                {/* Indicador de pasos */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-background-secondary text-text-tertiary'
                        }`}>
                        1
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-500' : 'bg-background-secondary'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-background-secondary text-text-tertiary'
                        }`}>
                        2
                    </div>
                </div>

                {/* Paso 1: Formulario de credenciales */}
                {step === 1 && (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Nombre completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="Juan Pérez"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                placeholder="Mínimo 8 caracteres"
                                required
                                minLength={8}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="input"
                                placeholder="Repite tu contraseña"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                                <p className="text-sm text-error">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando cuenta...' : 'Siguiente: Registrar Rostro'}
                        </button>
                    </form>
                )}

                {/* Paso 2: Captura facial */}
                {step === 2 && (
                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                                <p className="text-sm text-error">{error}</p>
                            </div>
                        )}

                        <WebcamCapture
                            onCapture={handleFaceCapture}
                            onError={setError}
                            requireBlink={true}
                        />

                        <button
                            onClick={() => setStep(1)}
                            className="btn-secondary w-full"
                            disabled={loading}
                        >
                            Volver
                        </button>
                    </div>
                )}

                {/* Link a login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-tertiary">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-primary-400 hover:text-primary-300">
                            Inicia sesión
                        </a>
                    </p>
                </div>

                {/* Información de seguridad */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="space-y-3 text-xs text-text-tertiary">
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>Tu rostro se procesa localmente en tu navegador</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>Solo almacenamos un descriptor matemático (128 números)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>Cumplimos con GDPR y estándares de seguridad</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
