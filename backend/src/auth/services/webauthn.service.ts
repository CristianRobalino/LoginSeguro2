import { Injectable } from '@nestjs/common';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import { ConfigService } from '@nestjs/config';

/**
 * WebAuthnService - Servicio para manejar operaciones WebAuthn/FIDO2
 * Aplica Single Responsibility Principle: solo maneja lógica WebAuthn
 * Aplica Dependency Inversion: depende de abstracciones (ConfigService)
 */
@Injectable()
export class WebAuthnService {
    private readonly rpName: string;
    private readonly rpID: string;
    private readonly origin: string;

    constructor(private configService: ConfigService) {
        this.rpName = this.configService.get<string>('RP_NAME') || 'Login Seguro';
        this.rpID = this.configService.get<string>('RP_ID') || 'localhost';
        this.origin = this.configService.get<string>('RP_ORIGIN') || 'http://localhost:3000';
    }

    /**
     * Genera opciones para el registro de una nueva credencial biométrica
     * @param userId - ID del usuario
     * @param userName - Nombre del usuario
     * @param userEmail - Email del usuario
     * @param excludeCredentials - Credenciales existentes a excluir
     */
    async generateRegistrationOptions(
        userId: string,
        userName: string,
        userEmail: string,
        excludeCredentials: { id: string; transports?: string[] }[] = [],
    ): Promise<PublicKeyCredentialCreationOptionsJSON> {
        const options = await generateRegistrationOptions({
            rpName: this.rpName,
            rpID: this.rpID,
            userID: userId,
            userName: userEmail,
            userDisplayName: userName,
            // Timeout de 60 segundos para completar el registro
            timeout: 60000,
            attestationType: 'none', // No requerimos attestation para simplificar
            // Excluir credenciales ya registradas
            excludeCredentials: excludeCredentials.map((cred) => ({
                id: Buffer.from(cred.id, 'base64'),
                type: 'public-key' as const,
                transports: cred.transports as any,
            })),
            authenticatorSelection: {
                // Requerir autenticador de plataforma (biometría del dispositivo)
                authenticatorAttachment: 'platform',
                // Requerir verificación de usuario (biometría)
                userVerification: 'required',
                // Requerir que la credencial sea residente (almacenada en el dispositivo)
                residentKey: 'preferred',
            },
            // Algoritmos de firma soportados
            supportedAlgorithmIDs: [-7, -257], // ES256, RS256
        });

        return options;
    }

    /**
     * Verifica la respuesta del registro biométrico
     * @param response - Respuesta del navegador
     * @param expectedChallenge - Challenge esperado
     */
    async verifyRegistration(
        response: any,
        expectedChallenge: string,
    ): Promise<VerifiedRegistrationResponse> {
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            requireUserVerification: true,
        });

        return verification;
    }

    /**
     * Genera opciones para la autenticación con credencial biométrica
     * @param allowCredentials - Credenciales permitidas para este usuario
     */
    async generateAuthenticationOptions(
        allowCredentials: { id: string; transports?: string[] }[],
    ): Promise<PublicKeyCredentialRequestOptionsJSON> {
        const options = await generateAuthenticationOptions({
            rpID: this.rpID,
            timeout: 60000,
            allowCredentials: allowCredentials.map((cred) => ({
                id: Buffer.from(cred.id, 'base64'),
                type: 'public-key' as const,
                transports: cred.transports as any,
            })),
            userVerification: 'required',
        });

        return options;
    }

    /**
     * Verifica la respuesta de autenticación biométrica
     * @param response - Respuesta del navegador
     * @param expectedChallenge - Challenge esperado
     * @param credentialPublicKey - Clave pública de la credencial
     * @param credentialCounter - Contador actual de la credencial
     */
    async verifyAuthentication(
        response: any,
        expectedChallenge: string,
        credentialPublicKey: Uint8Array,
        credentialCounter: bigint,
    ): Promise<VerifiedAuthenticationResponse> {
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            authenticator: {
                credentialID: response.id,
                credentialPublicKey,
                counter: Number(credentialCounter),
            },
            requireUserVerification: true,
        });

        return verification;
    }
}
