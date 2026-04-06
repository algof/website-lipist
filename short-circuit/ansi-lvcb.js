document.addEventListener('DOMContentLoaded', () => {
    // Inputs Top
    const loadFLAInput = document.getElementById('loadFLA');
    
    // Outputs
    const cbFlatText = document.getElementById('cbFlatText');

    function calculateValues() {
        const loadFLA = parseFloat(loadFLAInput.value);
        
        // 1. CB FLA (A) = 1.1 * Load FLA (A)
        if (!isNaN(loadFLA)) {
            const cbFLA = 1.1 * loadFLA;
            cbFlatText.textContent = `CB FLA (A): ${cbFLA.toFixed(4)}`;
        } else {
            cbFlatText.textContent = `CB FLA (A): 0`;
        }
    }

    // Attach event listeners for real-time calculation
    if (loadFLAInput) {
        loadFLAInput.addEventListener('input', calculateValues);
    }
});
