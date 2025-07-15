let drugData = {};

// Fetch drug data from drugs.json
fetch('/drug.json')
    .then(response => response.json())
    .then(data => {
        drugData = data;
        populateDrugDropdown();
    })
    .catch(error => console.error("Error loading drug data:", error));

// Populate drug dropdown
function populateDrugDropdown() {
    const drugSelect = document.getElementById("drug");
    Object.keys(drugData).forEach(drug => {
        let option = document.createElement("option");
        option.value = drug;
        option.textContent = drug;
        drugSelect.appendChild(option);
    });
}

// Convert weight between kg and lb
function convertWeight(unit) {
    let weightKg = document.getElementById("weightKg");
    let weightLb = document.getElementById("weightLb");

    if (unit === "kg") {
        weightLb.value = weightKg.value ? (weightKg.value * 2.20462).toFixed(2) : "";
    } else {
        weightKg.value = weightLb.value ? (weightLb.value * 0.453592).toFixed(2) : "";
    }
}

function calculateDosage() {
    const weight = parseFloat(document.getElementById("weightKg").value);
    const concentration = parseFloat(document.getElementById("concentration").value);
    const selectedDrug = document.getElementById("drug").value;
    const selectedSpecies = document.getElementById("species").value;
    const resultText = document.getElementById("result");
    const infoCard = document.getElementById("infoCard");

    if (!weight || !concentration || !selectedDrug || !selectedSpecies) {
        resultText.textContent = "Please fill all fields correctly!";
        resultText.style.color = "red";
        infoCard.style.display = "none";
        return;
    }

    let doseRate;
    const customDoseToggle = document.getElementById("customDoseToggle");
    const customDoseRateInput = document.getElementById("customDoseRate");

    if (customDoseToggle && customDoseToggle.checked) {
        doseRate = parseFloat(customDoseRateInput.value);
        if (isNaN(doseRate)) {
            resultText.textContent = "Please enter a valid custom dose rate.";
            resultText.style.color = "red";
            infoCard.style.display = "none";
            return;
        }
    } else {
        const doseRateRaw = drugData[selectedDrug].doseRate[selectedSpecies] ?? drugData[selectedDrug].doseRate.all;
        doseRate = parseFloat(doseRateRaw);
        if (isNaN(doseRate)) {
            resultText.textContent = "Dose rate unavailable for selected species.";
            resultText.style.color = "red";
            infoCard.style.display = "none";
            return;
        }
    }

    const mgRequired = weight * doseRate;
    const mlRequired = mgRequired / concentration;

    let routeType = drugData[selectedDrug].routeType;
    if (typeof routeType === "string") {
        routeType = [routeType.toLowerCase()];
    } else if (Array.isArray(routeType)) {
        routeType = routeType.map(r => r.toLowerCase());
    } else {
        routeType = [];
    }

    if (routeType.includes("oral")) {
        resultText.textContent = `Required Dose: ${mlRequired.toFixed(2)} tabs (${mgRequired.toFixed(2)} mg)`;
    } else if (routeType.includes("injection")) {
        resultText.textContent = `Required Dose: ${mlRequired.toFixed(2)} mL (${mgRequired.toFixed(2)} mg)`;
    } else {
        resultText.textContent = `Required Dose: ${mlRequired.toFixed(2)} units (${mgRequired.toFixed(2)} mg)`;
    }

    resultText.style.color = "black";

    document.getElementById("drugName").textContent = selectedDrug;
    document.getElementById("reaction").textContent = drugData[selectedDrug].reaction;
    document.getElementById("doseRate").textContent = doseRate;
    document.getElementById("calculatedMg").textContent = mgRequired.toFixed(2);
    document.getElementById("ageRestrictions").textContent = drugData[selectedDrug].ageRestrictions;
    document.getElementById("administrationRoute").textContent = drugData[selectedDrug].administrationRoute;

    infoCard.style.display = "block";
}


window.addEventListener("load", () => {
    const toggle = document.getElementById("customDoseToggle");
    const group = document.getElementById("customDoseGroup");

    if (toggle && group) {
        toggle.addEventListener("change", function () {
            group.style.display = this.checked ? "flex" : "none";
        });
    }
});

