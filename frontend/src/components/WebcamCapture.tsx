'use client';

import { useRef, useEffect, useState } from 'react';
import { faceRecognitionService } from '@/services/face-recognition.service';

interface WebcamCaptureProps {
    onCapture: (descriptor: number[]) => void;
    onError?: (error: string) => void;
    requireBlink?: boolean;
}

/**
 * Componente para capturar rostro con webcam
 * Captura automáticamente cuando detecta un rostro estable
 */
export default function WebcamCapture({
    onCapture,
    onError,
    requireBlink = false
}: WebcamCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const [loading, setLoading] = useState(true);
    const [faceDetected, setFaceDetected] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [instruction, setInstruction] = useState('Cargando modelos...');
    const [stableDetectionCount, setStableDetectionCount] = useState(0);
    const [captureComplete, setCaptureComplete] = useState(false);

    useEffect(() => {
        isMountedRef.current = true;
        initializeWebcam();
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, []);

    /**
     * Inicializa la webcam y carga los modelos
     */
    async function initializeWebcam() {
        try {
            setInstruction('Solicitando acceso a la cámara...');

            // Solicitar acceso a la webcam
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setInstruction('Cargando modelos de reconocimiento facial...');

            // Cargar modelos de face-api.js
            await faceRecognitionService.loadModels();

            setLoading(false);
            setInstruction('Posiciona tu rostro frente a la cámara');

            // Iniciar detección en tiempo real
            startFaceDetection();
        } catch (error: any) {
            console.error('Error al inicializar webcam:', error);
            const errorMsg = error.name === 'NotAllowedError'
                ? 'Permiso de cámara denegado. Por favor permite el acceso a la cámara.'
                : 'Error al acceder a la cámara. Verifica que esté conectada y permitida.';

            setInstruction(errorMsg);
            onError?.(errorMsg);
        }
    }

    /**
     * Inicia la detección de rostros en tiempo real
     * Captura automáticamente cuando detecta un rostro estable
     */
    function startFaceDetection() {
        detectionIntervalRef.current = setInterval(async () => {
            if (!isMountedRef.current || !videoRef.current || !canvasRef.current || capturing || captureComplete) return;

            // Verificar que el video esté listo y tenga datos
            // readyState === 4 significa HAVE_ENOUGH_DATA
            if (videoRef.current.readyState !== 4 || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                return;
            }

            try {
                const detection = await faceRecognitionService.detectFace(videoRef.current);

                if (!isMountedRef.current) return;

                if (detection) {
                    setFaceDetected(true);

                    // Incrementar contador de detección estable
                    setStableDetectionCount(prev => {
                        const newCount = prev + 1;

                        // Si se detecta rostro estable por 10 frames consecutivos (1 segundo), capturar automáticamente
                        if (newCount >= 10 && !capturing && !captureComplete && isMountedRef.current) {
                            setInstruction('¡Rostro estable detectado! Capturando...');
                            // Capturar automáticamente después de un breve delay
                            setTimeout(() => {
                                if (!captureComplete && isMountedRef.current) {
                                    handleAutoCapture();
                                }
                            }, 500);
                        } else if (newCount < 10 && isMountedRef.current) {
                            setInstruction(`Mantén tu rostro estable... (${newCount}/10)`);
                        }

                        return newCount;
                    });

                    // Validar que videoRef y canvasRef aún existen antes de dibujar
                    if (!videoRef.current || !canvasRef.current) return;

                    // Dibujar rectángulo alrededor del rostro
                    const canvas = canvasRef.current;
                    const displaySize = {
                        width: videoRef.current.videoWidth,
                        height: videoRef.current.videoHeight
                    };

                    canvas.width = displaySize.width;
                    canvas.height = displaySize.height;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Dibujar rectángulo verde alrededor del rostro
                        const box = detection.detection.box;
                        ctx.strokeStyle = '#10b981'; // green-500
                        ctx.lineWidth = 3;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);

                        // Dibujar landmarks (opcional)
                        const landmarks = detection.landmarks.positions;
                        ctx.fillStyle = '#10b981';
                        landmarks.forEach(point => {
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                            ctx.fill();
                        });
                    }
                } else {
                    setFaceDetected(false);
                    setStableDetectionCount(0); // Resetear contador si no hay rostro

                    // Limpiar canvas
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }

                    if (!capturing && !captureComplete && isMountedRef.current) {
                        setInstruction('Posiciona tu rostro frente a la cámara');
                    }
                }
            } catch (error: any) {
                // Ignorar error específico de "toNetInput" que ocurre al desmontar
                if (error.message && error.message.includes('toNetInput')) {
                    return;
                }
                console.error('Error en detección:', error);
            }
        }, 100); // Detectar cada 100ms
    }

    /**
     * Captura automática cuando se detecta rostro estable
     */
    async function handleAutoCapture() {
        if (capturing || captureComplete) return;

        setCapturing(true);
        setInstruction('Capturando rostro...');

        try {
            await captureDescriptor();
        } catch (error: any) {
            console.error('Error al capturar:', error);
            setInstruction('Error al capturar. Reintentando...');
            // Resetear para permitir otro intento
            setCapturing(false);
            setStableDetectionCount(0);
        }
    }

    /**
     * Captura el descriptor facial y lo envía al callback
     * Reintenta indefinidamente hasta tener éxito
     */
    async function captureDescriptor() {
        let attempt = 0;
        const maxAttempts = 5;

        while (attempt < maxAttempts) {
            try {
                attempt++;

                if (attempt > 1) {
                    setInstruction(`Reintentando captura (${attempt}/${maxAttempts})...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                const descriptor = await faceRecognitionService.extractDescriptor(videoRef.current!);
                setInstruction('¡Rostro capturado exitosamente!');
                setCaptureComplete(true);

                // Detener detección
                if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current);
                }

                // Enviar descriptor al componente padre
                onCapture(descriptor);
                return; // Éxito, salir de la función
            } catch (error: any) {
                if (attempt >= maxAttempts) {
                    // Después de 5 intentos, resetear y permitir que se vuelva a intentar automáticamente
                    setInstruction('No se pudo capturar. Reposiciona tu rostro...');
                    setCapturing(false);
                    setStableDetectionCount(0);
                    return;
                }
            }
        }
    }

    /**
     * Limpia recursos al desmontar
     */
    function cleanup() {
        // Detener detección
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }

        // Detener stream de video
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
    }

    return (
        <div className="space-y-4">
            {/* Instrucciones */}
            <div className="text-center space-y-2">
                <p className={`text-sm font-medium ${faceDetected ? 'text-success' : 'text-text-secondary'
                    }`}>
                    {instruction}
                </p>
                {!faceDetected && !loading && !captureComplete && (
                    <div className="text-xs text-text-tertiary space-y-1">
                        <p>💡 Consejos para mejor detección:</p>
                        <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                            <li>Asegúrate de tener buena iluminación</li>
                            <li>Mira directamente a la cámara</li>
                            <li>Mantén tu rostro centrado</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Video con overlay de canvas */}
            <div className="relative w-full max-w-md mx-auto">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg bg-background-secondary"
                    style={{ transform: 'scaleX(-1)' }} // Espejo para mejor UX
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ transform: 'scaleX(-1)' }}
                />

                {/* Indicador de rostro detectado */}
                {faceDetected && !captureComplete && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-success/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-success/30">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-success">Rostro detectado</span>
                    </div>
                )}

                {/* Indicador de captura en progreso */}
                {capturing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 mx-auto mb-2 text-primary-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-white font-medium">Procesando...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Información de seguridad */}
            <div className="text-xs text-text-tertiary text-center">
                <p>🔒 Tu rostro se procesa localmente en tu navegador</p>
                <p>No se envían imágenes al servidor</p>
                <p className="mt-2 text-primary-400 font-medium">
                    ✨ La captura es automática - solo mantén tu rostro estable
                </p>
            </div>
        </div>
    );
}
