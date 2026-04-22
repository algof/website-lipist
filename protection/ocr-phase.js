// ===== OCR Phase Module =====
// State management for multi-page relay calculation

const curveData = [
    { name: "IEC Standard Inverse Time", k: 0.14, alpha: 0.02, beta: 2.97 },
    { name: "IEC Very Inverse Time", k: 13.5, alpha: 1, beta: 1.5 },
    { name: "IEC Long Time Inverse", k: 120, alpha: 1, beta: 13.33 },
    { name: "IEC Extremely Inverse Time", k: 80, alpha: 2, beta: 0.808 },
    { name: "IEC Ultra Inverse", k: 315.2, alpha: 2.5, beta: 1 },
    { name: "IEEE Very Inverse", k: 3.922, alpha: 2, beta: 0.0982 },
    { name: "IEEE Extremely Inverse", k: 5.64, alpha: 2, beta: 0.02434 },
    { name: "IEC Curve A", k: 0.14, alpha: 0.02, beta: 1 },
    { name: "IEC Curve B", k: 13.5, alpha: 1, beta: 1 },
    { name: "IEC Curve C", k: 80, alpha: 2, beta: 1 },
    { name: "IEC Short Inverse", k: 0.05, alpha: 0.04, beta: 1 },
    { name: "IEC Curve A", k: 0.14, alpha: 0.02, beta: 1 },
    { name: "IEEE Moderately Inverse", k: 0.0103, alpha: 0.02, beta: 0.0228 },
    { name: "IEC Curve B", k: 13.5, alpha: 1, beta: 1 },
    { name: "IEC Curve C", k: 80, alpha: 2, beta: 1 },
    { name: "IEC Short Inverse", k: 0.05, alpha: 0.04, beta: 1 }
];

const curveOptions = curveData.map(c => c.name);

function createBlankPage() {
    return {
        relayId: "",
        fla: "",
        primCT: "",
        sekCT: "",
        iscMin: "",
        iscMax: "",
        // Overcurrent
        ocIset: "",
        // Instantaneous
        instIset: "",
        // Time Dial
        tipeKurvaIndex: 0,
        tipeKurva: curveOptions[0],
        waktuOperasi: "",
        tdsTerpilih: "",
        timeDelay: ""
    };
}

let pages = [createBlankPage()];
let currentPageIndex = 0;
let isRecapView = false;
let recapActiveTab = 0;

// ===== DOM Elements =====
const calcView = document.getElementById("calc-view");
const recapView = document.getElementById("recap-view");
const pageTabsScroll = document.getElementById("page-tabs-scroll");
const addPageBtn = document.getElementById("add-page-btn");
const removePageBtn = document.getElementById("remove-page-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Input elements
const relayIdInput = document.getElementById("relay-id");
const flaInput = document.getElementById("fla");
const primCTInput = document.getElementById("prim-ct");
const sekCTInput = document.getElementById("sek-ct");
const iscMinInput = document.getElementById("isc-min");
const iscMaxInput = document.getElementById("isc-max");

// Overcurrent display
const oc105fla = document.getElementById("oc-105fla");
const oc14fla = document.getElementById("oc-14fla");
const ocIsetInput = document.getElementById("oc-iset");
const oc105in = document.getElementById("oc-105in");
const ocIpickup = document.getElementById("oc-ipickup");
const oc14in = document.getElementById("oc-14in");

// Instantaneous display
const inst16fla = document.getElementById("inst-16fla");
const inst08iscmin = document.getElementById("inst-08iscmin");
const instIsetInput = document.getElementById("inst-iset");
const instTap16 = document.getElementById("inst-tap16");
const instTapIset = document.getElementById("inst-tap-iset");
const instTap08 = document.getElementById("inst-tap08");

// Time Dial display
const tdIscMax = document.getElementById("td-isc-max");
const tdIset = document.getElementById("td-iset");
const tdWaktuOperasi = document.getElementById("td-waktu-operasi");
const tdTdsTerpilih = document.getElementById("td-tds-terpilih");
const tdTimeDelay = document.getElementById("td-time-delay");
const tdK = document.getElementById("td-k");
const tdAlpha = document.getElementById("td-alpha");
const tdBeta = document.getElementById("td-beta");
const tdResult = document.getElementById("td-result");
const dropdownTrigger = document.getElementById("curve-dropdown-trigger");
const dropdownOptions = document.getElementById("curve-dropdown-options");
const dropdownContainer = document.getElementById("curve-dropdown");
const selectedCurveText = document.getElementById("selected-curve-text");

// ===== Calculations =====
function calculate() {
    const fla = parseFloat(flaInput.value) || 0;
    const primCT = parseFloat(primCTInput.value) || 0;
    const iscMin = parseFloat(iscMinInput.value) || 0;
    const iscMax = parseFloat(iscMaxInput.value) || 0;
    const ocIsetVal = parseFloat(ocIsetInput.value) || 0;
    const instIsetVal = parseFloat(instIsetInput.value) || 0;

    // Overcurrent Pickup
    oc105fla.textContent = (1.05 * fla).toFixed(2);
    oc14fla.textContent = (1.4 * fla).toFixed(2);
    oc105in.textContent = primCT !== 0 ? ((1.05 * fla) / primCT).toFixed(4) : "0";
    ocIpickup.textContent = primCT !== 0 ? (ocIsetVal / primCT).toFixed(4) : "0";
    oc14in.textContent = primCT !== 0 ? ((1.4 * fla) / primCT).toFixed(4) : "0";

    // Instantaneous Pickup
    inst16fla.textContent = (1.6 * fla).toFixed(2);
    inst08iscmin.textContent = (0.8 * iscMin).toFixed(2);
    instTap16.textContent = primCT !== 0 ? ((1.6 * fla) / primCT).toFixed(4) : "0";
    instTapIset.textContent = primCT !== 0 ? (instIsetVal / primCT).toFixed(4) : "0";
    instTap08.textContent = primCT !== 0 ? ((0.8 * iscMin) / primCT).toFixed(4) : "0";

    // Time Dial
    tdIscMax.textContent = iscMax.toFixed(2);
    tdIset.textContent = ocIsetVal.toFixed(2);

    const waktu = parseFloat(tdWaktuOperasi.value) || 0;
    const curveIdx = pages[currentPageIndex].tipeKurvaIndex;
    const curve = curveData[curveIdx];
    const k = curve.k;
    const alpha = curve.alpha;
    const beta = curve.beta;

    // Update k/α/β display
    tdK.textContent = k;
    tdAlpha.textContent = alpha;
    tdBeta.textContent = beta;

    let timeDial = 0;
    if (k !== 0 && iscMax !== 0 && ocIsetVal !== 0) {
        const ratio = iscMax / ocIsetVal;
        const denom = Math.pow(ratio, alpha) - 1;
        if (denom !== 0) {
            timeDial = (beta * denom * waktu) / k;
        }
    }
    tdResult.textContent = timeDial.toFixed(4);
}

// ===== Save / Load Page Data =====
function saveCurrentPage() {
    const page = pages[currentPageIndex];
    page.relayId = relayIdInput.value;
    page.fla = flaInput.value;
    page.primCT = primCTInput.value;
    page.sekCT = sekCTInput.value;
    page.iscMin = iscMinInput.value;
    page.iscMax = iscMaxInput.value;
    page.ocIset = ocIsetInput.value;
    page.instIset = instIsetInput.value;
    page.waktuOperasi = tdWaktuOperasi.value;
    page.tdsTerpilih = tdTdsTerpilih.value;
    page.timeDelay = tdTimeDelay.value;
    // tipeKurva and tipeKurvaIndex saved by dropdown handler
}

function loadPage(index) {
    const page = pages[index];
    relayIdInput.value = page.relayId;
    flaInput.value = page.fla;
    primCTInput.value = page.primCT;
    sekCTInput.value = page.sekCT;
    iscMinInput.value = page.iscMin;
    iscMaxInput.value = page.iscMax;
    ocIsetInput.value = page.ocIset;
    instIsetInput.value = page.instIset;
    tdWaktuOperasi.value = page.waktuOperasi;
    tdTdsTerpilih.value = page.tdsTerpilih;
    tdTimeDelay.value = page.timeDelay;
    selectedCurveText.textContent = page.tipeKurva;
    // Update dropdown selection by index
    dropdownOptions.querySelectorAll(".dropdown-option").forEach((opt, idx) => {
        opt.classList.toggle("selected", idx === page.tipeKurvaIndex);
    });
    calculate();
}

// ===== Page Tabs Rendering =====
function renderPageTabs() {
    pageTabsScroll.innerHTML = "";
    pages.forEach((_, i) => {
        const tab = document.createElement("button");
        tab.className = "page-tab" + (i === currentPageIndex ? " active" : "");
        tab.textContent = i + 1;
        tab.addEventListener("click", () => {
            saveCurrentPage();
            currentPageIndex = i;
            loadPage(i);
            renderPageTabs();
            updateNavButtons();
        });
        pageTabsScroll.appendChild(tab);
    });
}

// ===== Add / Remove Page =====
addPageBtn.addEventListener("click", () => {
    saveCurrentPage();
    pages.push(createBlankPage());
    currentPageIndex = pages.length - 1;
    loadPage(currentPageIndex);
    renderPageTabs();
    updateNavButtons();
    // Scroll to end
    pageTabsScroll.scrollLeft = pageTabsScroll.scrollWidth;
});

removePageBtn.addEventListener("click", () => {
    if (pages.length <= 1) return;
    pages.splice(currentPageIndex, 1);
    if (currentPageIndex >= pages.length) {
        currentPageIndex = pages.length - 1;
    }
    loadPage(currentPageIndex);
    renderPageTabs();
    updateNavButtons();
});

// ===== Navigation =====
function updateNavButtons() {
    if (isRecapView) {
        prevBtn.style.display = "inline-flex";
        nextBtn.style.display = "none";
        return;
    }

    // Sebelumnya: hide on first page
    prevBtn.style.display = currentPageIndex === 0 ? "none" : "inline-flex";

    // Selanjutnya / Recap
    if (currentPageIndex === pages.length - 1) {
        nextBtn.innerHTML = 'Recap <i class="bx bx-chevron-right"></i>';
    } else {
        nextBtn.innerHTML = 'Selanjutnya <i class="bx bx-chevron-right"></i>';
    }
    nextBtn.style.display = "inline-flex";
}

nextBtn.addEventListener("click", () => {
    if (isRecapView) return;
    saveCurrentPage();
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        loadPage(currentPageIndex);
        renderPageTabs();
        updateNavButtons();
    } else {
        // Show recap
        showRecap();
    }
});

prevBtn.addEventListener("click", () => {
    if (isRecapView) {
        hideRecap();
        return;
    }
    if (currentPageIndex > 0) {
        saveCurrentPage();
        currentPageIndex--;
        loadPage(currentPageIndex);
        renderPageTabs();
        updateNavButtons();
    }
});

// ===== Recap =====
function showRecap() {
    saveCurrentPage();
    isRecapView = true;
    calcView.style.display = "none";
    recapView.style.display = "block";
    renderRecap();
    updateNavButtons();
}

function hideRecap() {
    isRecapView = false;
    calcView.style.display = "block";
    recapView.style.display = "none";
    updateNavButtons();
}

function renderRecap() {
    const container = document.getElementById("recap-content");
    container.innerHTML = "";

    // Page tabs for recap
    const tabsContainer = document.getElementById("recap-page-tabs");
    tabsContainer.innerHTML = "";
    pages.forEach((_, i) => {
        const tab = document.createElement("button");
        tab.className = "recap-page-tab" + (i === recapActiveTab ? " active" : "");
        tab.textContent = i + 1;
        tab.addEventListener("click", () => {
            recapActiveTab = i;
            renderRecap();
        });
        tabsContainer.appendChild(tab);
    });

    // Render active tab data
    const page = pages[recapActiveTab];
    const fla = parseFloat(page.fla) || 0;
    const primCT = parseFloat(page.primCT) || 0;
    const iscMin = parseFloat(page.iscMin) || 0;
    const iscMax = parseFloat(page.iscMax) || 0;
    const ocIsetVal = parseFloat(page.ocIset) || 0;
    const instIsetVal = parseFloat(page.instIset) || 0;
    const waktu = parseFloat(page.waktuOperasi) || 0;
    const curveIdx = page.tipeKurvaIndex || 0;
    const curve = curveData[curveIdx];
    const k = curve.k;
    const alpha = curve.alpha;
    const beta = curve.beta;

    let timeDial = 0;
    if (k !== 0 && iscMax !== 0 && ocIsetVal !== 0) {
        const ratio = iscMax / ocIsetVal;
        const denom = Math.pow(ratio, alpha) - 1;
        if (denom !== 0) {
            timeDial = (beta * denom * waktu) / k;
        }
    }

    container.innerHTML = `
        <!-- Input Data -->
        <div class="calc-card">
            <div class="input-row">
                <div class="input-group">
                    <label>Relay ID<span class="required">*</span></label>
                    <input type="text" value="${page.relayId}" readonly>
                    <span class="helper-text">Nama atau kode Relay ID</span>
                </div>
                <div class="input-group">
                    <label>FLA (A)<span class="required">*</span></label>
                    <input type="text" value="${page.fla}" readonly>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Prim CT<span class="required">*</span></label>
                    <input type="text" value="${page.primCT}" readonly>
                </div>
                <div class="input-group">
                    <label>Sek CT<span class="required">*</span></label>
                    <input type="text" value="${page.sekCT}" readonly>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Isc Min Ampere (30 Cycle)<span class="required">*</span></label>
                    <input type="text" value="${page.iscMin}" readonly>
                </div>
                <div class="input-group">
                    <label>Isc Max Ampere (1/2 Cycle)<span class="required">*</span></label>
                    <input type="text" value="${page.iscMax}" readonly>
                </div>
            </div>
        </div>

        <!-- Overcurrent Pickup -->
        <div class="calc-card">
            <h2 class="calc-card-title">Overcurrent Pickup</h2>
            <div class="comparison-row">
                <div class="result-box">
                    <span class="box-label badge-green">1.05 FLA</span>
                    <div class="box-value">${(1.05 * fla).toFixed(2)}</div>
                </div>
                <div class="comparison-arrow">≤</div>
                <div class="result-box">
                    <span class="box-label badge-green">Iset (A)</span>
                    <div class="box-value">${page.ocIset || "0"}</div>
                </div>
                <div class="comparison-arrow">≤</div>
                <div class="result-box">
                    <span class="box-label badge-green">1.4 FLA</span>
                    <div class="box-value">${(1.4 * fla).toFixed(2)}</div>
                </div>
            </div>
            <div class="result-boxes-row">
                <div class="result-box">
                    <span class="box-label badge-blue">1.05 In</span>
                    <div class="box-value">${primCT !== 0 ? ((1.05 * fla) / primCT).toFixed(4) : "0"}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">Ipickup</span>
                    <div class="box-value">${primCT !== 0 ? (ocIsetVal / primCT).toFixed(4) : "0"}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">1.4 In</span>
                    <div class="box-value">${primCT !== 0 ? ((1.4 * fla) / primCT).toFixed(4) : "0"}</div>
                </div>
            </div>
        </div>

        <!-- Instantaneous Pickup -->
        <div class="calc-card">
            <h2 class="calc-card-title">Instantaneous Pickup</h2>
            <div class="comparison-row">
                <div class="result-box">
                    <span class="box-label badge-green">1.6 FLA</span>
                    <div class="box-value">${(1.6 * fla).toFixed(2)}</div>
                </div>
                <div class="comparison-arrow">≤</div>
                <div class="result-box">
                    <span class="box-label badge-green">Iset (A)</span>
                    <div class="box-value">${page.instIset || "0"}</div>
                </div>
                <div class="comparison-arrow">≤</div>
                <div class="result-box">
                    <span class="box-label badge-green">0.8 Isc Min</span>
                    <div class="box-value">${(0.8 * iscMin).toFixed(2)}</div>
                </div>
            </div>
            <div class="result-boxes-row">
                <div class="result-box">
                    <span class="box-label badge-blue">Tap 1.6</span>
                    <div class="box-value">${primCT !== 0 ? ((1.6 * fla) / primCT).toFixed(4) : "0"}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">Tap Iset</span>
                    <div class="box-value">${primCT !== 0 ? (instIsetVal / primCT).toFixed(4) : "0"}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">Tap 0.8 Isc Min</span>
                    <div class="box-value">${primCT !== 0 ? ((0.8 * iscMin) / primCT).toFixed(4) : "0"}</div>
                </div>
            </div>
        </div>

        <!-- Perhitungan Time Dial -->
        <div class="calc-card">
            <h2 class="calc-card-title">Perhitungan Time Dial</h2>
            <div class="input-row">
                <div class="input-group">
                    <label>Tipe Kurva<span class="required">*</span></label>
                    <input type="text" value="${page.tipeKurva}" readonly>
                </div>
                <div class="input-group">
                    <label>Isc Max</label>
                    <input type="text" value="${iscMax.toFixed(2)}" readonly>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Iset</label>
                    <input type="text" value="${ocIsetVal.toFixed(2)}" readonly>
                </div>
                <div class="input-group">
                    <label>Waktu Operasi Rele (t/td/T/td(i))<span class="required">*</span></label>
                    <input type="text" value="${page.waktuOperasi}" readonly>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>TDS Terpilih<span class="required">*</span></label>
                    <input type="text" value="${page.tdsTerpilih}" readonly>
                </div>
                <div class="input-group">
                    <label>Time Delay<span class="required">*</span></label>
                    <input type="text" value="${page.timeDelay}" readonly>
                </div>
            </div>
            <div class="td-grid-3">
                <div class="result-box">
                    <span class="box-label badge-blue">k</span>
                    <div class="box-value">${k}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">α</span>
                    <div class="box-value">${alpha}</div>
                </div>
                <div class="result-box">
                    <span class="box-label badge-blue">β</span>
                    <div class="box-value">${beta}</div>
                </div>
            </div>
            <div class="td-grid-1">
                <div class="result-box">
                    <span class="box-label badge-blue">Time Dial (D/TDS/M/TD)</span>
                    <div class="box-value">${timeDial.toFixed(4)}</div>
                </div>
            </div>
        </div>
    `;
}

// ===== Dropdown Setup =====
function setupDropdown() {
    dropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContainer.classList.toggle("active");
    });

    // Generate options
    dropdownOptions.innerHTML = "";
    curveData.forEach((curve, idx) => {
        const div = document.createElement("div");
        div.className = "dropdown-option" + (idx === 0 ? " selected" : "");
        div.dataset.value = curve.name;
        div.dataset.index = idx;
        div.innerHTML = `<span>${curve.name}</span><i class="bx bx-check"></i>`;
        div.addEventListener("click", () => {
            dropdownOptions.querySelectorAll(".dropdown-option").forEach(o => o.classList.remove("selected"));
            div.classList.add("selected");
            selectedCurveText.textContent = curve.name;
            pages[currentPageIndex].tipeKurva = curve.name;
            pages[currentPageIndex].tipeKurvaIndex = idx;
            dropdownContainer.classList.remove("active");
            calculate();
        });
        dropdownOptions.appendChild(div);
    });

    document.addEventListener("click", () => {
        dropdownContainer.classList.remove("active");
    });
    dropdownContainer.addEventListener("click", (e) => e.stopPropagation());
}

// ===== Input Event Listeners =====
function setupInputListeners() {
    const numericInputs = [flaInput, primCTInput, sekCTInput, iscMinInput, iscMaxInput,
        ocIsetInput, instIsetInput, tdWaktuOperasi, tdTdsTerpilih, tdTimeDelay];

    numericInputs.forEach(input => {
        input.addEventListener("input", () => {
            // Allow only numbers and decimal point
            input.value = input.value.replace(/[^0-9.]/g, '');
            // Prevent multiple dots
            const parts = input.value.split('.');
            if (parts.length > 2) {
                input.value = parts[0] + '.' + parts.slice(1).join('');
            }
            calculate();
        });
    });

    // Relay ID allows any string
    relayIdInput.addEventListener("input", calculate);
}

// ===== Init =====
function init() {
    setupDropdown();
    setupInputListeners();
    renderPageTabs();
    loadPage(0);
    updateNavButtons();
}

init();
