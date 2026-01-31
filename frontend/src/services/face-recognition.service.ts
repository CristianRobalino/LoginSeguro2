import * as faceapi from 'face-api.js';

/**
 * FaceRecognitionService - Servicio para reconocimiento facial
 * Usa face-api.js para detectar y comparar rostros
 */
class FaceRecognitionService {
    private modelsLoaded = false;
    private readonly MODEL_URL = '/models';

    /**
     * Carga los modelos pre-entrenados de face-api.js
     */
    async loadModels(): Promise<void> {
        if (this.modelsLoaded) return;

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(`${this.MODEL_URL}/tiny_face_detector`),
                faceapi.nets.faceLandmark68Net.loadFromUri(`${this.MODEL_URL}/face_landmark_68`),
                faceapi.nets.faceRecognitionNet.loadFromUri(`${this.MODEL_URL}/face_recognition`),
            ]);
            this.modelsLoaded = true;
            console.log('✅ Modelos de face-api.js cargados correctamente (TinyFace detector)');
        } catch (error) {
            console.error('❌ Error al cargar modelos:', error);
            throw new Error('No se pudieron cargar los modelos de reconocimiento facial');
        }
    }

    /**
     * Detecta un rostro en el elemento de video
     */
    async detectFace(videoElement: HTMLVideoElement) {
        if (!this.modelsLoaded) {
            throw new Error('Los modelos no están cargados. Llama a loadModels() primero.');
        }

        try {
            // Usar TinyFaceDetectorOptions para mayor velocidad
            // inputSize: debe ser divisor de 32 (128, 160, 224, 320, 416, 512, 608)
            // scoreThreshold: confianza mínima
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

            const detection = await faceapi
                .detectSingleFace(videoElement, options)
                .withFaceLandmarks()
                .withFaceDescriptor();

            return detection;
        } catch (error) {
            console.error('Error al detectar rostro:', error);
            return null;
        }
    }

    /**
     * Extrae el descriptor facial (128 números) del video
     */
    async extractDescriptor(videoElement: HTMLVideoElement): Promise<number[]> {
        const detection = await this.detectFace(videoElement);

        if (!detection) {
            throw new Error('No se detectó ningún rostro. Asegúrate de estar frente a la cámara.');
        }

        // Convertir Float32Array a Array normal
        return Array.from(detection.descriptor);
    }

    /**
     * Detecta si el usuario está parpadeando (liveness detection básico)
     */
    async detectBlink(videoElement: HTMLVideoElement): Promise<boolean> {
        if (!this.modelsLoaded) {
            throw new Error('Los modelos no están cargados');
        }

        try {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
            const detection = await faceapi
                .detectSingleFace(videoElement, options)
                .withFaceLandmarks();

            if (!detection) return false;

            const leftEye = detection.landmarks.getLeftEye();
            const rightEye = detection.landmarks.getRightEye();

            const leftEAR = this.calculateEAR(leftEye);
            const rightEAR = this.calculateEAR(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;

            // Si EAR < 0.25, el ojo está cerrado (parpadeo)
            return avgEAR < 0.25;
        } catch (error) {
            console.error('Error al detectar parpadeo:', error);
            return false;
        }
    }

    /**
     * Calcula el Eye Aspect Ratio (EAR) para detectar parpadeo
     * Basado en el paper: "Real-Time Eye Blink Detection using Facial Landmarks"
     */
    private calculateEAR(eye: faceapi.Point[]): number {
        // Distancias verticales
        const v1 = this.euclideanDistance(eye[1], eye[5]);
        const v2 = this.euclideanDistance(eye[2], eye[4]);

        // Distancia horizontal
        const h = this.euclideanDistance(eye[0], eye[3]);

        // EAR = (v1 + v2) / (2 * h)
        return (v1 + v2) / (2 * h);
    }

    /**
     * Calcula la distancia euclidiana entre dos puntos
     */
    private euclideanDistance(p1: faceapi.Point, p2: faceapi.Point): number {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    /**
     * Verifica si los modelos están cargados
     */
    areModelsLoaded(): boolean {
        return this.modelsLoaded;
    }

    /**
     * Calcula la distancia entre dos descriptores faciales
     * (Esta función se usa en el backend, pero la incluimos aquí para referencia)
     */
    calculateDistance(descriptor1: number[], descriptor2: number[]): number {
        if (descriptor1.length !== descriptor2.length) {
            throw new Error('Los descriptores deben tener la misma longitud');
        }

        return Math.sqrt(
            descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
        );
    }

    /**
     * Verifica si dos descriptores coinciden
     */
    isFaceMatch(descriptor1: number[], descriptor2: number[], threshold = 0.6): boolean {
        const distance = this.calculateDistance(descriptor1, descriptor2);
        return distance < threshold;
    }
}

// Exportar instancia única (Singleton)
export const faceRecognitionService = new FaceRecognitionService();
