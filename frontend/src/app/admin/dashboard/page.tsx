'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { apiService } from '@/services/api.service';
import CreateUserModal from '@/components/CreateUserModal';
import EditUserModal from '@/components/EditUserModal';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const currentUser = useAuthStore((state) => state.user);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await apiService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        setUserToDelete({ id: userId, name: userName });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        try {
            await apiService.deleteUser(userToDelete.id);
            // Actualizar lista de usuarios
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error: any) {
            console.error('Error eliminando usuario:', error);
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        } finally {
            setDeleting(false);
        }
    };

    const handleCreateUser = async (email: string, name: string, password: string, role: 'admin' | 'client') => {
        await apiService.createUserByAdmin(email, name, password, role);
        // Recargar lista de usuarios
        await loadUsers();
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setShowEditModal(true);
    };

    const handleUpdateUser = async (userId: string, name: string, isActive: boolean) => {
        await apiService.updateUser(userId, { name, isActive });
        // Recargar lista de usuarios
        await loadUsers();
    };

    const filteredUsers = users.filter(
        (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Navbar />

                    {/* Bienvenida */}
                    <div className="glass-card p-8 mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            ¡Bienvenido, <span className="gradient-text">{currentUser?.name}</span>!
                        </h2>
                        <p className="text-text-secondary">
                            Panel de administración - Gestiona usuarios y credenciales biométricas
                        </p>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-tertiary text-sm mb-1">Total Usuarios</p>
                                    <p className="text-3xl font-bold">{users.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-tertiary text-sm mb-1">Administradores</p>
                                    <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-tertiary text-sm mb-1">Clientes</p>
                                    <p className="text-3xl font-bold">{users.filter(u => u.role === 'client').length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de usuarios */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Gestión de Usuarios</h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary px-4 py-2 text-sm"
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Usuario
                            </button>
                        </div>

                        {/* Búsqueda */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Buscar por email o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input max-w-md"
                            />
                        </div>

                        {/* Tabla de usuarios */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Usuario</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Email</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Rol</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Estado</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Registro</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-text-tertiary">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-border hover:bg-surface-elevated transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-medium">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-text-secondary">{user.email}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-accent-purple/20 text-accent-purple'
                                                        : 'bg-accent-blue/20 text-accent-blue'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                        ? 'bg-success/20 text-success'
                                                        : 'bg-error/20 text-error'
                                                        }`}>
                                                        {user.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-text-tertiary text-sm">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="btn-secondary px-3 py-1 text-sm mr-2"
                                                        disabled={user.id === currentUser?.id}
                                                        title={user.id === currentUser?.id ? 'No puedes editarte a ti mismo' : 'Editar usuario'}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="btn-danger px-3 py-1 text-sm"
                                                        disabled={user.id === currentUser?.id}
                                                        title={user.id === currentUser?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-text-tertiary">No se encontraron usuarios</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Modal de confirmación de eliminación */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="glass-card-elevated p-8 max-w-md w-full animate-scale-in">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/20 mx-auto mb-4">
                                    <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-bold text-center mb-2">¿Eliminar usuario?</h3>
                                <p className="text-text-secondary text-center mb-6">
                                    ¿Estás seguro de eliminar a <span className="font-semibold text-white">"{userToDelete?.name}"</span>?
                                    <br />
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setUserToDelete(null);
                                        }}
                                        disabled={deleting}
                                        className="btn-secondary flex-1 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleting}
                                        className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deleting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Eliminando...
                                            </span>
                                        ) : (
                                            'Eliminar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de crear usuario */}
                    {showCreateModal && (
                        <CreateUserModal
                            onClose={() => setShowCreateModal(false)}
                            onCreate={handleCreateUser}
                        />
                    )}

                    {/* Modal de editar usuario */}
                    {showEditModal && userToEdit && (
                        <EditUserModal
                            user={userToEdit}
                            onClose={() => {
                                setShowEditModal(false);
                                setUserToEdit(null);
                            }}
                            onUpdate={handleUpdateUser}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
