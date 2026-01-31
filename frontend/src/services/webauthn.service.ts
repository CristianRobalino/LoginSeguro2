import {
    startRegistration,
    startAuthentication,
} from '@simplewebauthn/browser';
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/types';

/**
 * WebAuthn Service - Cliente para autenticación biométrica
 * Aplica Single Responsibility: solo maneja operaciones WebAuthn del navegador
 */
export class WebAuthnService {
    /**
     * Registra una nueva credencial biométrica
     * @param options - Opciones de registro del servidor
     * @returns Respuesta de registro con la credencial pública
     */
    static async registerCredential(
        options: PublicKeyCredentialCreationOptionsJSON
    ): Promise<RegistrationResponseJSON> {
        try {
            // Verificar soporte de WebAuthn
            if (!window.PublicKeyCredential) {
                throw new Error(
                    'WebAuthn no está soportado en este navegador. Por favor usa Chrome, Edge, Firefox o Safari actualizado.'
                );
            }

            // Iniciar proceso de registro
            const registrationResponse = await startRegistration(options);
            return registrationResponse;
        } catch (error: any) {
            // Manejar errores específicos de WebAuthn
            if (error.name === 'NotAllowedError') {
                throw new Error(
                    'Registro cancelado. Por favor intenta nuevamente y autoriza el uso de biometría.'
                );
            } else if (error.name === 'InvalidStateError') {
                throw new Error(
                    'Esta credencial ya está registrada en este dispositivo.'
                );
            } else if (error.name === 'NotSupportedError') {
                throw new Error(
                    'Tu dispositivo no soporta autenticación biométrica. Asegúrate de tener Windows Hello, Touch ID o Face ID configurado.'
                );
            }
            throw error;
        }
    }

    /**
     * Autentica con una credencial biométrica existente
     * @param options - Opciones de autenticación del servidor
     * @returns Respuesta de autenticación con la firma
     */
    static async authenticate(
        options: PublicKeyCredentialRequestOptionsJSON
    ): Promise<AuthenticationResponseJSON> {
        try {
            // Verificar soporte de WebAuthn
            if (!window.PublicKeyCredential) {
                throw new Error(
                    'WebAuthn no está soportado en este navegador.'
                );
            }

            // Iniciar proceso de autenticación
            const authenticationResponse = await startAuthentication(options);
            return authenticationResponse;
        } catch (error: any) {
            // Manejar errores específicos
            if (error.name === 'NotAllowedError') {
                throw new Error(
                    'Autenticación cancelada. Por favor intenta nuevamente.'
                );
            } else if (error.name === 'InvalidStateError') {
                throw new Error(
                    'No se encontró una credencial válida. Por favor registra tu dispositivo primero.'
                );
            }
            throw error;
        }
    }

    /**
     * Verifica si el navegador soporta WebAuthn
     */
    static isSupported(): boolean {
        return !!window.PublicKeyCredential;
    }

    /**
     * Verifica si el dispositivo tiene autenticador de plataforma (biometría)
     */
    static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
        if (!window.PublicKeyCredential) {
            return false;
        }

        try {
            const available =
                await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return available;
        } catch {
            return false;
        }
    }
}
