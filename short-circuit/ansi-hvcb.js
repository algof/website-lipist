document.addEventListener('DOMContentLoaded', () => {
    // Inputs Top
    const loadFLAInput = document.getElementById('loadFLA');
    const kVInput = document.getElementById('kV');
    const maxKVCBInput = document.getElementById('maxKVCB');
    // Inputs Bottom
    const ratedIntInput = document.getElementById('ratedInt');
    
    // Outputs
    const cbFlatText = document.getElementById('cbFlatText');
    const maxIntText = document.getElementById('maxIntText');
    const cnlRmsText = document.getElementById('cnlRmsText');
    const cnlPeakText = document.getElementById('cnlPeakText');

    function calculateValues() {
        const loadFLA = parseFloat(loadFLAInput.value);
        const kV = parseFloat(kVInput.value);
        const maxKVCB = parseFloat(maxKVCBInput.value);
        const ratedInt = parseFloat(ratedIntInput.value);
        
        // 1. CB FLA (A) = 1.1 * Load FLA (A)
        if (!isNaN(loadFLA)) {
            const cbFLA = 1.1 * loadFLA;
            cbFlatText.textContent = `CB FLA (A): ${cbFLA.toFixed(4)}`;
        } else {
            cbFlatText.textContent = `CB FLA (A): 0`;
        }

        // Calculation tree for lower variables depends on ratedInt, maxKVCB, and kV
        let maxInt = 0;
        
        // 2. Max Int. (kA) = Rated Int. (kA) * (Max kV CB / kV)
        if (!isNaN(ratedInt) && !isNaN(maxKVCB) && !isNaN(kV) && kV !== 0) {
            maxInt = ratedInt * (maxKVCB / kV);
            maxIntText.textContent = maxInt.toFixed(4);
        } else {
            maxIntText.textContent = "0";
        }

        // 3. C & L rms = 1.6 * Max Int. (kA)
        // 4. C & L peak = 2.7 * Max Int. (kA)
        if (maxInt !== 0) {
            const cnlRms = 1.6 * maxInt;
            const cnlPeak = 2.7 * maxInt;
            cnlRmsText.textContent = cnlRms.toFixed(4);
            cnlPeakText.textContent = cnlPeak.toFixed(4);
        } else {
            cnlRmsText.textContent = "0";
            cnlPeakText.textContent = "0";
        }
    }

    // Attach event listeners for real-time calculation
    const inputsToWatch = [loadFLAInput, kVInput, maxKVCBInput, ratedIntInput];
    inputsToWatch.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateValues);
        }
    });
});
