// ===== IEC HVCB Calculator JS =====

// ===== Auto-calculate: CB FLA (A) = 1.1 * Load FLA (A) =====
const simLoadFla = document.getElementById('sim-load-fla');
const simCbFla = document.getElementById('sim-cb-fla');

if (simLoadFla && simCbFla) {
    simLoadFla.addEventListener('input', () => {
        const val = parseFloat(simLoadFla.value);
        if (!isNaN(val) && val !== 0) {
            simCbFla.value = (1.1 * val).toFixed(4);
        } else {
            simCbFla.value = '';
        }
    });
}

// ===== Auto-calculate: Making Peak (kA) = 2.5 * AC Breaking (kA) =====
const simAcBreaking = document.getElementById('sim-ac-breaking');
const simMakingPeak = document.getElementById('sim-making-peak');

if (simAcBreaking && simMakingPeak) {
    simAcBreaking.addEventListener('input', () => {
        const val = parseFloat(simAcBreaking.value);
        if (!isNaN(val) && val !== 0) {
            simMakingPeak.value = (2.5 * val).toFixed(4);
        } else {
            simMakingPeak.value = '';
        }
    });
}
