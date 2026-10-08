// ============================================
// FIREBASE - Configuración del curso
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyAkXBnK0yPja5gBlLdORhhteX2GdUhl4Qo",
  authDomain: "cruzroja-telecom.firebaseapp.com",
  projectId: "cruzroja-telecom",
  storageBucket: "cruzroja-telecom.firebasestorage.app",
  messagingSenderId: "945652084154",
  appId: "1:945652084154:web:860340d29f1d810ebd0183"
};

let db = null;
let firestoreModulo = null;

// ============================================
// Inicializar Firebase (carga dinámica)
// ============================================
async function inicializarFirebase() {
    if (db) return db;
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");
        const app = initializeApp(firebaseConfig);
        db = firestore.getFirestore(app);
        firestoreModulo = firestore;
        return db;
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        return null;
    }
}

// ============================================
// Obtener / guardar carnet del estudiante
// ============================================
function obtenerCarnet() {
    return localStorage.getItem('carnetEstudiante') || null;
}

function guardarCarnet(carnet) {
    localStorage.setItem('carnetEstudiante', carnet.trim());
}

// ============================================
// Guardar progreso de un módulo aprobado
// ============================================
async function guardarProgresoModulo(numeroModulo) {
    const carnet = obtenerCarnet();
    if (!carnet) {
        console.warn('No hay carnet registrado. No se guardará el progreso.');
        return false;
    }
    try {
        const database = await inicializarFirebase();
        if (!database) return false;

        const ref = firestoreModulo.doc(database, 'estudiantes', carnet);
        const datos = {};
        datos['modulo' + numeroModulo] = true;
        datos['fechaModulo' + numeroModulo] = new Date().toISOString();
        datos['ultimaActualizacion'] = new Date().toISOString();

        await firestoreModulo.setDoc(ref, datos, { merge: true });
        console.log('✅ Progreso guardado: Módulo ' + numeroModulo);
        return true;
    } catch (error) {
        console.error('❌ Error al guardar progreso:', error);
        return false;
    }
}

// ============================================
// Leer progreso del estudiante
// ============================================
async function leerProgreso() {
    const carnet = obtenerCarnet();
    if (!carnet) return null;
    try {
        const database = await inicializarFirebase();
        if (!database) return null;

        const ref = firestoreModulo.doc(database, 'estudiantes', carnet);
        const snapshot = await firestoreModulo.getDoc(ref);
        return snapshot.exists() ? snapshot.data() : {};
    } catch (error) {
        console.error('❌ Error al leer progreso:', error);
        return null;
    }
}

// ============================================
// Contar módulos completados (de 6)
// ============================================
function contarModulosCompletados(datos) {
    if (!datos) return 0;
    let total = 0;
    for (let i = 1; i <= 6; i++) {
        if (datos['modulo' + i] === true) total++;
    }
    return total;
}
