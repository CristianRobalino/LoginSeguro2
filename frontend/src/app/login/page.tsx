'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import WebcamCapture from '@/components/WebcamCapture';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [step, setStep] = useState(1); // 1: Credenciales, 2: Verificación/Registro facial
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });
    const [needsRegistration, setNeedsRegistration] = useState(false); // Si necesita REGISTRAR rostro
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Paso 1: Validar credenciales
     */
    async function handleCredentialsSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await apiService.startAuthentication(credentials.email, credentials.password);

            // Verificar si necesita registrar rostro o verificar rostro
            if (result.requiresFaceRegistration) {
                setNeedsRegistration(true);
                setStep(2);
            } else if (result.requiresFaceVerification) {
                setNeedsRegistration(false);
                setStep(2);
            }
        } catch (err: any) {
            console.error('Error en validación de credenciales:', err);
            setError(err.response?.data?.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    }

    /**
     * Paso 2A: Registrar rostro (primera vez)
     */
    async function handleFaceRegistration(descriptor: number[]) {
        setLoading(true);
        setError('');

        try {
            await apiService.completeFaceRegistration(credentials.email, descriptor);

            // Ahora hacer login automático
            const result = await apiService.verifyFaceAuthentication(credentials.email, descriptor);

            // Guardar token y usuario
            setAuth(result.user, result.accessToken);

            // Redirigir según rol
            if (result.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/client/dashboard');
            }
        } catch (err: any) {
            console.error('Error en registro facial:', err);
            setError(err.response?.data?.message || 'Error al registrar rostro');
            setLoading(false);
        }
    }

    /**
     * Paso 2B: Verificar rostro (usuarios con rostro registrado)
     */
    async function handleFaceVerification(descriptor: number[]) {
        setLoading(true);
        setError('');

        try {
            const result = await apiService.verifyFaceAuthentication(credentials.email, descriptor);

            // Guardar token y usuario
            setAuth(result.user, result.accessToken);

            // Redirigir según rol
            if (result.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/client/dashboard');
            }
        } catch (err: any) {
            console.error('Error en verificación facial:', err);
            setError(err.response?.data?.message || 'Rostro no coincide. Intenta de nuevo.');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo animado con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-background to-accent-purple/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

            {/* Círculos decorativos */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-accent-purple/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {/* Card de login */}
            <div className="glass-card-elevated p-8 md:p-12 w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple mb-4 pulse-glow">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Login Seguro</span>
                    </h1>
                    <p className="text-text-secondary">
                        {step === 1
                            ? 'Ingresa tus credenciales'
                            : needsRegistration
                                ? 'Completa tu registro facial'
                                : 'Verifica tu identidad con reconocimiento facial'
                        }
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
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
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
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="input"
                                placeholder="Tu contraseña"
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
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validando...
                                </span>
                            ) : (
                                'Siguiente: Verificación Facial'
                            )}
                        </button>
                    </form>
                )}

                {/* Paso 2: Verificación/Registro facial */}
                {step === 2 && (
                    <div className="space-y-4">
                        {needsRegistration && (
                            <div className="p-4 rounded-lg bg-info/10 border border-info/20 mb-4">
                                <p className="text-sm text-info">
                                    ℹ️ Es tu primer inicio de sesión. Por favor registra tu rostro para completar tu perfil.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                                <p className="text-sm text-error">{error}</p>
                            </div>
                        )}

                        <WebcamCapture
                            onCapture={needsRegistration ? handleFaceRegistration : handleFaceVerification}
                            onError={setError}
                            requireBlink={true}
                        />

                        <button
                            onClick={() => {
                                setStep(1);
                                setError('');
                                setNeedsRegistration(false);
                            }}
                            className="btn-secondary w-full"
                            disabled={loading}
                        >
                            Volver
                        </button>
                    </div>
                )}

                {/* Link a registro */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-tertiary">
                        ¿No tienes cuenta?{' '}
                        <a href="/register" className="text-primary-400 hover:text-primary-300">
                            Regístrate aquí
                        </a>
                    </p>
                </div>

                {/* Información de seguridad */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-start gap-3 text-xs text-text-tertiary">
                        <svg
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p>
                            Tu rostro se procesa localmente en tu navegador. Solo se compara el descriptor matemático con el almacenado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
