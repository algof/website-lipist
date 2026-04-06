document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const loadFLAInput = document.getElementById('loadFLA');
    
    // Outputs
    const continuousText = document.getElementById('continuousText');

    function calculateValues() {
        const loadFLA = parseFloat(loadFLAInput.value);
        
        // Continuous = 1.1 * Load FLA (A)
        if (!isNaN(loadFLA)) {
            const continuous = 1.1 * loadFLA;
            // ANSI UI mockups display plain calculated values like "Continuous: 0"
            // Let's add 4 decimal places like we did in IEC for consistency
            continuousText.textContent = `Continuous: ${continuous.toFixed(4)}`;
        } else {
            continuousText.textContent = `Continuous: 0`;
        }
    }

    // Attach event listeners for real-time calculation
    if (loadFLAInput) {
        loadFLAInput.addEventListener('input', calculateValues);
    }
});
