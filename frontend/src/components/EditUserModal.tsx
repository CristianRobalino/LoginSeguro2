'use client';

import { useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onUpdate: (userId: string, name: string, isActive: boolean) => Promise<void>;
}

export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
    const [name, setName] = useState(user.name);
    const [isActive, setIsActive] = useState(user.isActive);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setLoading(true);
        try {
            await onUpdate(user.id, name, isActive);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-elevated p-8 max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Editar Usuario</h3>
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

                    {/* Email (solo lectura) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="input opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-text-tertiary mt-1">El email no se puede modificar</p>
                    </div>

                    {/* Rol (solo lectura) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Rol</label>
                        <input
                            type="text"
                            value={user.role === 'admin' ? 'Administrador' : 'Cliente'}
                            disabled
                            className="input opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-text-tertiary mt-1">El rol no se puede modificar</p>
                    </div>

                    {/* Nombre (editable) */}
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

                    {/* Estado activo/inactivo */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-surface-elevated rounded-full peer peer-checked:bg-success transition-colors border border-border peer-checked:border-success"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-text-tertiary rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white"></div>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Usuario Activo</span>
                                <p className="text-xs text-text-tertiary">
                                    {isActive ? 'El usuario puede iniciar sesión' : 'El usuario no puede iniciar sesión'}
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-warning/20 border border-warning/30 rounded-lg p-3 text-warning text-sm">
                        <p className="font-medium mb-1">⚠️ Nota:</p>
                        <p>Si desactivas un usuario, no podrá iniciar sesión hasta que lo reactives.</p>
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
                                    Guardando...
                                </span>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
