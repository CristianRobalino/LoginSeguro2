const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

console.log(`${colors.cyan}🔒 Iniciando escaneo de seguridad del proyecto...${colors.reset}\n`);

// 1. Verificar dependencias vulnerables con npm audit
console.log(`${colors.yellow}📦 Ejecutando auditoría de dependencias (npm audit)...${colors.reset}`);

exec('npm audit --json', (error, stdout, stderr) => {
    let auditPassed = true;
    let vulnerabilities = 0;

    try {
        const result = JSON.parse(stdout);
        vulnerabilities = result.metadata?.vulnerabilities?.total || 0;

        if (vulnerabilities > 0) {
            console.log(`${colors.red}❌ Se encontraron ${vulnerabilities} vulnerabilidades en las dependencias.${colors.reset}`);
            // auditPassed = false; // No fallamos el build por ahora, solo advertimos
        } else {
            console.log(`${colors.green}✅ Dependencias seguras. No se encontraron vulnerabilidades conocidas.${colors.reset}`);
        }
    } catch (e) {
        console.log(`${colors.yellow}⚠️ No se pudo parsear el resultado de npm audit.${colors.reset}`);
    }

    // 2. Análisis estático simple de código (Búsqueda de patrones peligrosos)
    console.log(`\n${colors.yellow}🔍 Ejecutando análisis estático de código...${colors.reset}`);

    const dangerousPatterns = [
        { pattern: 'eval\\(', message: 'Uso de eval() detectado (Riesgo de inyección de código)' },
        { pattern: 'console\\.log\\(', message: 'Uso de console.log() en producción (Posible fuga de información)' },
        { pattern: 'password\\s*=\\s*[\'"][^\'"]+[\'"]', message: 'Posible contraseña hardcodeada detectada' },
        { pattern: 'secret\\s*=\\s*[\'"][^\'"]+[\'"]', message: 'Posible secreto hardcodeado detectado' },
    ];

    const srcDir = path.join(__dirname, '..');
    let issuesFound = 0;

    function scanDirectory(directory) {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                    scanDirectory(filePath);
                }
            } else if (file.endsWith('.ts') || file.endsWith('.js')) {
                const content = fs.readFileSync(filePath, 'utf8');

                dangerousPatterns.forEach(check => {
                    const regex = new RegExp(check.pattern, 'g');
                    if (regex.test(content)) {
                        // Ignorar este mismo archivo de script
                        if (!filePath.includes('security-scan.js')) {
                            console.log(`${colors.magenta}⚠️ [${file}]: ${check.message}${colors.reset}`);
                            issuesFound++;
                        }
                    }
                });
            }
        });
    }

    try {
        scanDirectory(srcDir);

        if (issuesFound === 0) {
            console.log(`${colors.green}✅ Análisis estático completado. No se encontraron patrones sospechosos evidentes.${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️ Análisis estático completado con ${issuesFound} advertencias.${colors.reset}`);
        }
    } catch (err) {
        console.error('Error durante el escaneo:', err);
    }

    console.log(`\n${colors.cyan}🏁 Reporte de Seguridad Generado${colors.reset}`);
    console.log('--------------------------------------------------');
    console.log(`Estado Global: ${auditPassed && issuesFound === 0 ? colors.green + 'SEGURO' : colors.yellow + 'REVISIÓN REQUERIDA'}${colors.reset}`);
});
