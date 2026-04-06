// ===== OCR Ground Module =====
// State management for multi-page ground relay calculation

function createBlankPage() {
    return {
        relayId: "",
        iscLG: "",
        primCT: "",
        sekCT: "",
        iset: "",
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
const iscLGInput = document.getElementById("isc-lg");
const primCTInput = document.getElementById("prim-ct");
const sekCTInput = document.getElementById("sek-ct");
const isetInput = document.getElementById("iset");
const timeDelayInput = document.getElementById("time-delay");

// Result display elements
const result10IscLG = document.getElementById("res-10-isc-lg");
const result50IscLG = document.getElementById("res-50-isc-lg");
const result10In = document.getElementById("res-10-in");
const resultIpickup = document.getElementById("res-ipickup");
const result50In = document.getElementById("res-50-in");

// ===== Calculations =====
function calculate() {
    const iscLG = parseFloat(iscLGInput.value) || 0;
    const primCT = parseFloat(primCTInput.value) || 0;
    const isetVal = parseFloat(isetInput.value) || 0;

    const val10IscLG = 0.1 * iscLG;
    const val50IscLG = 0.5 * iscLG;

    result10IscLG.textContent = val10IscLG.toFixed(2);
    result50IscLG.textContent = val50IscLG.toFixed(2);

    result10In.textContent = primCT !== 0 ? (val10IscLG / primCT).toFixed(4) : "0";
    resultIpickup.textContent = primCT !== 0 ? (isetVal / primCT).toFixed(4) : "0";
    result50In.textContent = primCT !== 0 ? (val50IscLG / primCT).toFixed(4) : "0";
}

// ===== Save / Load Page Data =====
function saveCurrentPage() {
    const page = pages[currentPageIndex];
    page.relayId = relayIdInput.value;
    page.iscLG = iscLGInput.value;
    page.primCT = primCTInput.value;
    page.sekCT = sekCTInput.value;
    page.iset = isetInput.value;
    page.timeDelay = timeDelayInput.value;
}

function loadPage(index) {
    const page = pages[index];
    relayIdInput.value = page.relayId;
    iscLGInput.value = page.iscLG;
    primCTInput.value = page.primCT;
    sekCTInput.value = page.sekCT;
    isetInput.value = page.iset;
    timeDelayInput.value = page.timeDelay;
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

        // Add separator line between tabs (not after last)
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
                    <label>Isc LG (A)<span class="required">*</span></label>
                    <input type="text" value="${page.iscLG}" readonly>
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
        </div>

        <!-- Iset & Time Delay -->
        <div class="calc-card">
            <div class="input-row">
                <div class="input-group">
                    <label>Iset (A)<span class="required">*</span></label>
                    <input type="text" value="${page.iset}" readonly>
                </div>
                <div class="input-group">
                    <label>Time Delay<span class="required">*</span></label>
                    <input type="text" value="${page.timeDelay}" readonly>
                </div>
            </div>
        </div>
    `;
}

// ===== Input Event Listeners =====
function setupInputListeners() {
    const numericInputs = [iscLGInput, primCTInput, sekCTInput, isetInput, timeDelayInput];

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
    setupInputListeners();
    renderPageTabs();
    loadPage(0);
    updateNavButtons();
}

init();
