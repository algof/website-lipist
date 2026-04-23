// ===== Reset Trafo Module =====
// State management for multi-page trafo reset calculation

function createBlankPage() {
    return {
        trafoId: "",
        lowVoltage: "",
        highVoltage: "",
        iscMaxLV: "",
        iscMinHV: ""
    };
}

let pages = [createBlankPage()];
let currentPageIndex = 0;
let isRecapView = false;

// ===== DOM Elements =====
const calcView = document.getElementById("calc-view");
const recapView = document.getElementById("recap-view");
const pageTabsScroll = document.getElementById("page-tabs-scroll");
const addPageBtn = document.getElementById("add-page-btn");
const removePageBtn = document.getElementById("remove-page-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Input elements
const trafoIdInput = document.getElementById("trafo-id");
const lowVoltageInput = document.getElementById("low-voltage");
const highVoltageInput = document.getElementById("high-voltage");
const iscMaxLVInput = document.getElementById("isc-max-lv");
const iscMinHVInput = document.getElementById("isc-min-hv");

// Result display elements
const resultIscMaxHV = document.getElementById("res-isc-max-hv");
const resultResetStatus = document.getElementById("res-reset-status");

// ===== Calculations =====
function calculate() {
    const lowV = parseFloat(lowVoltageInput.value) || 0;
    const highV = parseFloat(highVoltageInput.value) || 0;
    const iscMaxLV = parseFloat(iscMaxLVInput.value) || 0;
    const iscMinHV = parseFloat(iscMinHVInput.value) || 0;

    // Hasil ISC Max (HV) = Low Voltage / High Voltage * ISC Max (LV)
    let hasilIscMaxHV = 0;
    if (iscMaxLV !== 0) {
        hasilIscMaxHV = (lowV / highV) * iscMaxLV;
    }
    resultIscMaxHV.textContent = hasilIscMaxHV.toFixed(2);

    // Reset / Tidak Reset = IF(ISC Min (HV) > Hasil ISC Max (HV), "Reset", "Tidak Reset")
    const resetStatus = iscMinHV > hasilIscMaxHV ? "Reset" : "Tidak Reset";
    resultResetStatus.textContent = resetStatus;
}

// ===== Save / Load Page Data =====
function saveCurrentPage() {
    const page = pages[currentPageIndex];
    page.trafoId = trafoIdInput.value;
    page.lowVoltage = lowVoltageInput.value;
    page.highVoltage = highVoltageInput.value;
    page.iscMaxLV = iscMaxLVInput.value;
    page.iscMinHV = iscMinHVInput.value;
}

function loadPage(index) {
    const page = pages[index];
    trafoIdInput.value = page.trafoId;
    lowVoltageInput.value = page.lowVoltage;
    highVoltageInput.value = page.highVoltage;
    iscMaxLVInput.value = page.iscMaxLV;
    iscMinHVInput.value = page.iscMinHV;
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

        // Add separator line between tabs
        if (i < pages.length - 1) {
            const sep = document.createElement("span");
            sep.style.cssText = "width:16px;height:2px;background:rgba(255,255,255,0.15);flex-shrink:0;border-radius:1px;";
            pageTabsScroll.appendChild(sep);
        }
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
        nextBtn.innerHTML = 'RECAP <i class="bx bx-chevron-right"></i>';
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
    document.querySelector(".submodule-footer").style.display = "none";
    renderRecap();
    updateNavButtons();
}

function hideRecap() {
    isRecapView = false;
    calcView.style.display = "block";
    recapView.style.display = "none";
    document.querySelector(".submodule-footer").style.display = "flex";
    updateNavButtons();
}

function renderRecap() {
    const container = document.getElementById("recap-content");

    let rows = "";
    pages.forEach((page, i) => {
        const lowV = parseFloat(page.lowVoltage) || 0;
        const highV = parseFloat(page.highVoltage) || 0;
        const iscMaxLV = parseFloat(page.iscMaxLV) || 0;
        const iscMinHV = parseFloat(page.iscMinHV) || 0;

        let hasilIscMaxHV = 0;
        if (iscMaxLV !== 0) {
            hasilIscMaxHV = (lowV / highV) * iscMaxLV;
        }
        const resetStatus = iscMinHV > hasilIscMaxHV ? "Reset" : "Tidak Reset";

        rows += `
            <tr>
                <td>${i + 1}</td>
                <td>${page.trafoId || "0"}</td>
                <td>${resetStatus}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table class="recap-table">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Trafo ID</th>
                    <th>Reset / Tidak Reset</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// ===== Input Event Listeners =====
function setupInputListeners() {
    const numericInputs = [lowVoltageInput, highVoltageInput, iscMaxLVInput, iscMinHVInput];

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

    // Trafo ID allows any string
    trafoIdInput.addEventListener("input", calculate);
}

// ===== Init =====
function init() {
    setupInputListeners();
    renderPageTabs();
    loadPage(0);
    updateNavButtons();
}

init();
