'use client';

import { useState } from 'react';

interface CreateUserModalProps {
    onClose: () => void;
    onCreate: (email: string, name: string, password: string, role: 'admin' | 'client') => Promise<void>;
}

export default function CreateUserModal({ onClose, onCreate }: CreateUserModalProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'client'>('client');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!email || !name || !password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await onCreate(email, name, password, role);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-elevated p-8 max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Nuevo Usuario</h3>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-error/20 border border-error/30 rounded-lg p-3 text-error text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Rol</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'admin' | 'client')}
                            className="input"
                        >
                            <option value="client">Cliente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="bg-info/20 border border-info/30 rounded-lg p-3 text-info text-sm">
                        <p className="font-medium mb-1">ℹ️ Información importante:</p>
                        <p>El usuario deberá registrar su rostro en el primer inicio de sesión.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn-secondary flex-1 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando...
                                </span>
                            ) : (
                                'Crear Usuario'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
