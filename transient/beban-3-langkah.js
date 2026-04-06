let currentStep = 1; // 1: Initial, 2: LS Steps, 3: Summary
let currentPhase = 1; // 1: LS1, 2: LS2, 3: LS3

const phasesState = {
    1: { tp: "", dcb: "", td: "", table: Array(7).fill().map(() => ({ id: "", kw: "", cb: "" })) },
    2: { tp: "", dcb: "", td: "", table: Array(7).fill().map(() => ({ id: "", kw: "", cb: "" })) },
    3: { tp: "", dcb: "", td: "", table: Array(7).fill().map(() => ({ id: "", kw: "", cb: "" })) }
};

// ===== Elements (Step 1) =====
const step1View = document.getElementById("step-1-view");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");

const loadMwInput = document.getElementById("load-mw");
const fPercentInput = document.getElementById("f-percent-input");
const hzOutput = document.getElementById("hz-output");
const hzInput = document.getElementById("hz-input");
const fPercentOutput = document.getElementById("f-percent-output");
const fBaseSelect = document.getElementById("f-base-select");

// ===== Elements (Step 2 / Sidebar) =====
const step2View = document.getElementById("step-2-view");
const sidebarLoadMw = document.getElementById("sidebar-load-mw");
const sideFpInput = document.getElementById("sidebar-f-percent-input");
const sideHzOut = document.getElementById("sidebar-hz-output");
const sideHzInput = document.getElementById("sidebar-hz-input");
const sideFpOut = document.getElementById("sidebar-f-percent-output");

const fStatusHelper = document.getElementById("f-status-helper");
const sideFStatusHelper = document.getElementById("sidebar-f-status-helper");
const recapFStatusHelper = document.getElementById("recap-f-status-helper");

const dayaAktual = document.getElementById("daya-aktual");
const dayaMinimal = document.getElementById("daya-minimal");
const dayaLsAktual = document.getElementById("daya-ls-aktual");
const dayaSetelah = document.getElementById("daya-setelah");

const tripPoint = document.getElementById("trip-point");
const delayCb = document.getElementById("delay-cb");
const timeDelay = document.getElementById("time-delay");
const waktuTotal = document.getElementById("waktu-total");

const freqTripVal = document.getElementById("freq-trip-val");
const percentFreqVal = document.getElementById("percent-freq-val");
const phaseTitle = document.getElementById("phase-title");
const tahapLabel = document.getElementById("tahap-label");
const phaseTabs = document.querySelectorAll(".phase-tab");

// ===== Other Elements =====
const lsTotalMwDisp = document.getElementById("ls-total-mw");
const kwInputs = document.querySelectorAll(".ls-kw");


// ===== Phase Data Config =====
const phaseData = {
    1: { trip: { 50: "49.41", 60: "59.30" }, pFreq: "98.83", percentage: 0.1 },
    2: { trip: { 50: "49.08", 60: "58.90" }, pFreq: "98.16", percentage: 0.15 },
    3: { trip: { 50: "48.75", 60: "58.50" }, pFreq: "97.50", percentage: 0.1 }
};

// ===== Core Logic Functions =====
const updateConversions = () => {
    const fBase = parseFloat(fBaseSelect?.value || 50);

    // %F to Hz
    if (fPercentInput && fPercentInput.value !== "") {
        const val = parseFloat(fPercentInput.value);
        // User requested val / 2 in Step Id 857
        if (hzOutput) hzOutput.value = ((val * fBase) / 100).toFixed(2);
    } else if (hzOutput) {
        hzOutput.value = "";
    }

    // Hz to %F
    if (hzInput && hzInput.value !== "") {
        const val = parseFloat(hzInput.value);
        if (fPercentOutput) fPercentOutput.value = ((val / fBase) * 100).toFixed(2);
    } else if (fPercentOutput) {
        fPercentOutput.value = "";
    }

    // Sync to sidebar read-only outputs
    if (sideHzOut) sideHzOut.value = hzOutput.value;
    if (sideFpOut) sideFpOut.value = fPercentOutput.value;

    // Update Helpers
    const hzVal = parseFloat(hzOutput?.value);
    if (!isNaN(hzVal)) {
        const { text, className } = getFrequencyStatus(hzVal, fBase);
        if (fStatusHelper) {
            fStatusHelper.textContent = text;
            fStatusHelper.className = `f-status-helper ${className}`;
        }
        if (sideFStatusHelper) {
            sideFStatusHelper.textContent = text;
            sideFStatusHelper.className = `f-status-helper ${className}`;
        }
    } else {
        if (fStatusHelper) fStatusHelper.textContent = "";
        if (sideFStatusHelper) sideFStatusHelper.textContent = "";
    }
};

const getFrequencyStatus = (hz, fBase) => {
    if (fBase === 50) {
        if (hz > 51.5) return { text: "Prohibited Operation", className: "status-prohibited" };
        if (hz >= 50.42) return { text: "Restrictive Operation (10 min)", className: "status-restrictive" };
        if (hz >= 49.58) return { text: "Continuous Operation", className: "status-normal" };
        if (hz >= 48.75) return { text: "Restrictive Operation (50 min)", className: "status-restrictive" };
        if (hz >= 48.17) return { text: "Restrictive Operation (10 min)", className: "status-restrictive" };
        if (hz >= 47.67) return { text: "Restrictive Operation (3 min)", className: "status-restrictive" };
        return { text: "Prohibited Operation", className: "status-prohibited" };
    } else if (fBase === 60) {
        if (hz > 61.8) return { text: "Prohibited Operation", className: "status-prohibited" };
        if (hz >= 60.5) return { text: "Restrictive Operation (10 min)", className: "status-restrictive" };
        if (hz >= 59.49) return { text: "Continuous Operation", className: "status-normal" };
        if (hz >= 58.5) return { text: "Restrictive Operation (50 min)", className: "status-restrictive" };
        if (hz >= 57.8) return { text: "Restrictive Operation (10 min)", className: "status-restrictive" };
        if (hz >= 57.2) return { text: "Restrictive Operation (3 min)", className: "status-restrictive" };
        return { text: "Prohibited Operation", className: "status-prohibited" };
    }
    return { text: "", className: "" };
};

const calculatePhase2 = () => {
    // Phase Specific Data
    const data = phaseData[currentPhase] || phaseData[1];
    const fBase = parseFloat(fBaseSelect?.value || 50);
    if (freqTripVal) freqTripVal.textContent = data.trip[fBase] || data.trip[50];
    if (percentFreqVal) percentFreqVal.textContent = data.pFreq;

    // Waktu Total
    const tp = parseFloat(tripPoint?.value) || 0;
    const dcb = parseFloat(delayCb?.value) || 0;
    const td = parseFloat(timeDelay?.value) || 0;
    if (waktuTotal) waktuTotal.textContent = (tp + dcb + td).toFixed(0);

    // Load Metrics - Step 1: Calculate Minimal LS
    const initialLoad = parseFloat(loadMwInput?.value) || 0;
    if (dayaAktual) dayaAktual.value = initialLoad.toFixed(2);
    if (dayaMinimal) dayaMinimal.value = (initialLoad * data.percentage).toFixed(2);

    // Step 2: Update LS Aktual from Table Total
    calculateTableTotal();

    // Step 3: Calculate Daya Setelah LS
    // Calculate cumulative load remaining before this phase
    let cascadedLoad = initialLoad;
    if (currentPhase > 1) {
        for (let i = 1; i < currentPhase; i++) {
            let prevTotalKw = 0;
            phasesState[i].table.forEach(r => prevTotalKw += parseFloat(r.kw) || 0);
            cascadedLoad -= (prevTotalKw / 1000);
        }
    }
    const lsAktual = parseFloat(dayaLsAktual?.value) || 0;
    if (dayaSetelah) dayaSetelah.value = (cascadedLoad - lsAktual).toFixed(2);
};

const calculateTableTotal = () => {
    let totalKw = 0;
    kwInputs.forEach(input => totalKw += parseFloat(input.value) || 0);
    const totalMwVal = totalKw / 1000;

    if (lsTotalMwDisp) lsTotalMwDisp.textContent = totalMwVal.toFixed(3);
    if (dayaLsAktual) dayaLsAktual.value = totalMwVal.toFixed(2);
};

const validateNextButton = () => {
    if (currentStep === 1) {
        nextBtn.disabled = !loadMwInput?.value;
    } else {
        nextBtn.disabled = false; // Optional in Step 2
    }
};

const updateView = () => {
    if (currentStep === 1) {
        if (step1View) step1View.style.display = "block";
        if (step2View) step2View.classList.remove("active");
        const summaryView = document.getElementById("summary-view");
        if (summaryView) summaryView.style.display = "none";
        if (nextBtn) nextBtn.style.display = "inline-flex";
        if (prevBtn) prevBtn.style.display = "none";
    } else if (currentStep === 2) {
        if (step1View) step1View.style.display = "none";
        if (step2View) step2View.classList.add("active");
        const summaryView = document.getElementById("summary-view");
        if (summaryView) summaryView.style.display = "none";

        const connectors = document.querySelectorAll(".phase-connector");
        phaseTabs.forEach((tab, index) => {
            const isActive = index + 1 <= currentPhase;
            tab.classList.toggle("active", isActive);
            if (connectors[index]) {
                connectors[index].classList.toggle("active", index + 2 <= currentPhase);
            }
        });

        const data = phaseData[currentPhase] || phaseData[1];
        const phasePercentage = `${(data.percentage * 100).toFixed(0)}%`;
        if (phaseTitle) phaseTitle.textContent = `LS${currentPhase} (${phasePercentage})`;
        const prefix = document.getElementById("tahap-prefix");
        if (tahapLabel) {
            if (currentPhase === 3) {
                if (prefix) prefix.style.display = "none";
                const fBase = parseFloat(fBaseSelect?.value || 50);
                const ls3Threshold = fBase === 60 ? "58.5" : "48.5";
                tahapLabel.textContent = `LS3 (Sebelum menyentuh ${ls3Threshold}Hz)`;
            } else {
                if (prefix) prefix.style.display = "inline";
                tahapLabel.textContent = `LS${currentPhase}`;
            }
        }

        if (sidebarLoadMw) sidebarLoadMw.value = loadMwInput.value;

        if (nextBtn) nextBtn.style.display = "inline-flex";
        if (prevBtn) prevBtn.style.display = "inline-flex";
        calculatePhase2();
    } else if (currentStep === 3) {
        if (step1View) step1View.style.display = "none";
        if (step2View) step2View.classList.remove("active");
        const summaryView = document.getElementById("summary-view");
        if (summaryView) summaryView.style.display = "block";
        if (nextBtn) nextBtn.style.display = "none";
        if (prevBtn) prevBtn.style.display = "inline-flex";
        renderSummary();
    }
    validateNextButton();
};

const saveCurrentPhaseData = () => {
    if (currentStep !== 2) return;
    const state = phasesState[currentPhase];
    state.tp = tripPoint.value;
    state.dcb = delayCb.value;
    state.td = timeDelay.value;

    const rows = document.querySelectorAll("#ls-table-body tr");
    rows.forEach((row, idx) => {
        state.table[idx] = {
            id: row.querySelector(".ls-id").value,
            kw: row.querySelector(".ls-kw").value,
            cb: row.querySelector(".ls-cb").value
        };
    });
};

const loadPhaseData = (phase) => {
    const state = phasesState[phase];
    tripPoint.value = state.tp;
    delayCb.value = state.dcb;
    timeDelay.value = state.td;

    const rows = document.querySelectorAll("#ls-table-body tr");
    rows.forEach((row, idx) => {
        const data = state.table[idx] || { id: "", kw: "", cb: "" };
        row.querySelector(".ls-id").value = data.id;
        row.querySelector(".ls-kw").value = data.kw;
        row.querySelector(".ls-cb").value = data.cb;
    });
};

const renderSummary = () => {
    const container = document.getElementById("recap-phases-container");
    if (!container) return;
    container.innerHTML = "";

    const load = parseFloat(loadMwInput.value) || 0;

    // Populate Step 1 recap fields
    const recapLoadMw = document.getElementById("recap-load-mw");
    const recapFPercent = document.getElementById("recap-f-percent");
    const recapHzOut = document.getElementById("recap-hz-out");
    const recapHzIn = document.getElementById("recap-hz-in");
    const recapFpOut = document.getElementById("recap-fp-out");
    const recapFBase = document.getElementById("recap-f-base");

    if (recapLoadMw) recapLoadMw.value = loadMwInput?.value || "0";
    if (recapFPercent) recapFPercent.value = fPercentInput?.value || "";
    if (recapHzOut) recapHzOut.value = hzOutput?.value || "";
    if (recapHzIn) recapHzIn.value = hzInput?.value || "";
    if (recapFpOut) recapFpOut.value = fPercentOutput?.value || "";
    if (recapFBase) recapFBase.textContent = fBaseSelect?.value || "50";

    // Frequency Status helper in Recap
    const hzVal = parseFloat(hzOutput?.value);
    const fBaseValue = parseFloat(fBaseSelect?.value || 50);
    if (!isNaN(hzVal) && recapFStatusHelper) {
        const { text, className } = getFrequencyStatus(hzVal, fBaseValue);
        recapFStatusHelper.textContent = text;
        recapFStatusHelper.className = `f-status-helper ${className}`;
    } else if (recapFStatusHelper) {
        recapFStatusHelper.textContent = "";
    }

    // Phase labels config
    const fBase = parseFloat(fBaseSelect?.value || 50);
    const ls3Threshold = fBase === 60 ? "58.5" : "48.5";
    const phaseLabels = {
        1: "LS1 (10%)",
        2: "LS2 (15%)",
        3: `LS3 (Sebelum menyentuh ${ls3Threshold}Hz)`
    };
    const tahapLabels = {
        1: "TAHAP LS1",
        2: "TAHAP LS2",
        3: "TAHAP LS3"
    };

    let cascadedLoad = parseFloat(loadMwInput.value) || 0;
    const initialLoad = parseFloat(loadMwInput.value) || 0;

    [1, 2, 3].forEach(p => {
        const state = phasesState[p];
        const data = phaseData[p];

        const tp = parseFloat(state.tp) || 0;
        const dcb = parseFloat(state.dcb) || 0;
        const td = parseFloat(state.td) || 0;
        const totalWaktu = tp + dcb + td;

        const dayaAktual = initialLoad;
        const dayaMin = dayaAktual * data.percentage;
        let totalKw = 0;
        state.table.forEach(r => totalKw += parseFloat(r.kw) || 0);
        const lsAktual = totalKw / 1000;
        const dayaSetelahLs = cascadedLoad - lsAktual;

        // Pass to next phase
        cascadedLoad = dayaSetelahLs;

        // Build table rows
        let tableRows = "";
        state.table.forEach((row, idx) => {
            const kwVal = parseFloat(row.kw) || 0;
            const totalKwRow = kwVal; // individual row total = same as kw
            tableRows += `
                <tr>
                    <td><input type="text" value="${row.id}" readonly></td>
                    <td><input type="text" value="${row.kw}" readonly></td>
                    <td><input type="text" value="${totalKwRow}" readonly></td>
                    ${idx === 0 ? `<td rowspan="7" style="text-align: center; font-size: 1.5rem; font-weight: 700; border-left: 1px solid rgba(255,255,255,0.1);">${lsAktual.toFixed(3)}</td>` : ""}
                    <td><input type="text" value="${row.cb}" readonly></td>
                </tr>
            `;
        });

        const section = `
            <div class="recap-phase-section">
                <h2 class="recap-phase-title">${phaseLabels[p]}</h2>

                <div class="result-badge-container">
                    <div class="result-badge">Waktu Total: <span>${totalWaktu}</span> ms</div>
                </div>

                <div class="summary-stats">
                    <div class="input-field">
                        <label>Daya Aktual Sistem<span class="required">*</span></label>
                        <input type="text" value="${dayaAktual.toFixed(2)}" readonly>
                    </div>
                    <div class="input-field">
                        <label>Daya Minimal LS<span class="required">*</span></label>
                        <input type="text" value="${dayaMin.toFixed(2)}" readonly>
                    </div>
                    <div class="input-field">
                        <label>Daya LS Aktual<span class="required">*</span></label>
                        <input type="text" value="${lsAktual.toFixed(2)}" readonly>
                    </div>
                    <div class="input-field">
                        <label>Daya Setelah LS<span class="required">*</span></label>
                        <input type="text" value="${dayaSetelahLs.toFixed(2)}" readonly>
                    </div>
                </div>

                <h2 class="recap-tahap-title">${tahapLabels[p]}</h2>

                <div class="table-container">
                    <table class="freq-table ls-table">
                        <thead>
                            <tr>
                                <th>ID Beban</th>
                                <th>Daya (KW)</th>
                                <th>Total (kW)</th>
                                <th>Total (MW)</th>
                                <th>Circuit Breaker</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML += section;
    });
};

// ===== Helpers =====
const syncInputs = (input1, input2, onUpdate) => {
    const listener = (e) => {
        const val = e.target.value;
        const other = e.target === input1 ? input2 : input1;
        if (other) other.value = val;
        if (onUpdate) onUpdate();
        validateNextButton();
    };
    if (input1) input1.addEventListener("input", listener);
    if (input2) input2.addEventListener("input", listener);
};

function setupDropdown(containerId, nativeId, syncId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const trigger = container.querySelector(".dropdown-trigger");
    const options = container.querySelectorAll(".option");
    const selectedText = container.querySelector(".selected-value");
    const nativeSelect = document.getElementById(nativeId);

    trigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        container.classList.toggle("active");
    });

    options.forEach(opt => {
        opt.addEventListener("click", () => {
            const val = opt.dataset.value;
            // Update Current UI
            options.forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            if (selectedText) selectedText.textContent = val;

            // Update Native & Link
            if (nativeSelect) {
                nativeSelect.value = val;
                nativeSelect.dispatchEvent(new Event("change"));
            }

            // Sync Other Dropdown if exists
            const otherContainer = document.getElementById(syncId);
            if (otherContainer) {
                const otherText = otherContainer.querySelector(".selected-value");
                const otherOptions = otherContainer.querySelectorAll(".option");
                if (otherText) otherText.textContent = val;
                otherOptions.forEach(o => o.classList.toggle("selected", o.dataset.value === val));
            }

            container.classList.remove("active");
            updateConversions();
            if (currentStep === 2) updateView();
        });
    });

    document.addEventListener("click", () => container.classList.remove("active"));
}

// ===== Initialize =====
function init() {
    // Step 1 to Sidebar Sync
    syncInputs(loadMwInput, sidebarLoadMw, () => {
        if (dayaAktual) dayaAktual.value = loadMwInput.value;
        if (currentStep === 2) calculatePhase2();
    });

    syncInputs(fPercentInput, sideFpInput, updateConversions);
    syncInputs(hzInput, sideHzInput, updateConversions);

    // Navigation
    nextBtn?.addEventListener("click", () => {
        if (currentStep === 1) {
            currentStep = 2;
            currentPhase = 1;
            loadPhaseData(1);
        } else if (currentStep === 2) {
            saveCurrentPhaseData(currentPhase);
            if (currentPhase < 3) {
                currentPhase++;
                loadPhaseData(currentPhase);
            } else {
                currentStep = 3;
            }
        }
        updateView();
    });

    prevBtn?.addEventListener("click", () => {
        if (currentStep === 3) {
            currentStep = 2;
            currentPhase = 3;
            loadPhaseData(3);
        } else if (currentStep === 2) {
            saveCurrentPhaseData(currentPhase);
            if (currentPhase > 1) {
                currentPhase--;
                loadPhaseData(currentPhase);
            } else {
                currentStep = 1;
            }
        } else if (currentStep === 1) {
            window.location.href = '../index.html';
        }
        updateView();
    });

    // Phase 2 Inputs
    [tripPoint, delayCb, timeDelay, dayaLsAktual].forEach(input => {
        input?.addEventListener("input", () => {
            calculatePhase2();
            validateNextButton();
        });
    });

    kwInputs.forEach(input => {
        input.addEventListener("input", calculatePhase2);
    });

    // Dropdowns
    setupDropdown("f-base-dropdown", "f-base-select", "sidebar-f-base-dropdown");
    setupDropdown("sidebar-f-base-dropdown", "f-base-select", "f-base-dropdown");

    updateConversions();
    updateView();
}

init();
