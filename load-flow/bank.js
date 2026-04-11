// ===== Perhitungan Capacitor Bank =====

const pInput = document.getElementById("p-kw");
const qLamaInput = document.getElementById("q-lama");
const qTargetInput = document.getElementById("q-target");
const qKompensasiDisplay = document.getElementById("q-kompensasi-value");

function calculateQKompensasi() {
    const P = parseFloat(pInput.value) || 0;
    const qLama = parseFloat(qLamaInput.value) || 0;
    const qTarget = parseFloat(qTargetInput.value) || 0;

    let result = 0;

    // Only calculate if all values are valid and cos values are within [-1, 1]
    if (P > 0 && Math.abs(qLama) <= 1 && Math.abs(qTarget) <= 1) {
        const tanLama = Math.tan(Math.acos(qLama));
        const tanTarget = Math.tan(Math.acos(qTarget));
        result = P * tanLama - P * tanTarget;
    }

    // Display with up to 5 decimal places, remove trailing zeros
    qKompensasiDisplay.textContent = result === 0 ? "0" : parseFloat(result.toFixed(5)).toString();
}

// Listen for input events on all three fields
[pInput, qLamaInput, qTargetInput].forEach(input => {
    input.addEventListener("input", calculateQKompensasi);
});
