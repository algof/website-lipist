// ===== IEC Busbar Calculator JS =====

// Custom Select Dropdown Logic
document.querySelectorAll('.iec-custom-select').forEach(select => {
    const trigger = select.querySelector('.iec-select-trigger');
    const options = select.querySelectorAll('.iec-select-option');
    const selectedText = trigger.querySelector('.selected-text');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close all other selects
        document.querySelectorAll('.iec-custom-select').forEach(s => {
            if (s !== select) s.classList.remove('open');
        });
        select.classList.toggle('open');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected from all
            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedText.textContent = option.dataset.value;
            select.classList.remove('open');
        });
    });
});

// Close dropdowns on outside click
document.addEventListener('click', () => {
    document.querySelectorAll('.iec-custom-select').forEach(s => s.classList.remove('open'));
});

// ===== Auto-calculate: Continous (A) = 1.1 * FLA (A) =====
const simFla = document.getElementById('sim-fla');
const simContinous = document.getElementById('sim-continous');

if (simFla && simContinous) {
    simFla.addEventListener('input', () => {
        const flaVal = parseFloat(simFla.value);
        if (!isNaN(flaVal) && flaVal !== 0) {
            simContinous.value = (1.1 * flaVal).toFixed(4);
        } else {
            simContinous.value = '';
        }
    });
}
