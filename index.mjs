import apiGet from "./apiGet.mjs";

const body = document.body;
const appTitle = "Twig";

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function setParticlesBackground(backgroundColor = "#000000") {
    // Create a container for particles
    const particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-js";
    particlesContainer.style.position = "fixed";
    particlesContainer.style.top = "0";
    particlesContainer.style.left = "0";
    particlesContainer.style.width = "100%";
    particlesContainer.style.height = "100%";
    particlesContainer.style.zIndex = "-1";
    particlesContainer.style.backgroundColor = backgroundColor;
    body.appendChild(particlesContainer);

    // Load particles.js library
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.onload = () => {
        // Configure and initialize particles.js
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 100,
                    density: { enable: true, value_area: 800 },
                },
                color: { value: "#4080c0" },
                shape: {
                    type: "polygon",
                    stroke: { width: 1, color: "#40a0e0" },
                    polygon: { nb_sides: 7 },
                },
                opacity: { value: 0.5, random: true },
                size: { value: 8, random: true },
                line_linked: {
                    enable: true,
                    distance: 100,
                    color: "#8fbfff",
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: true,
                },
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true,
                },
            },
            retina_detect: true,
        });
    };
    document.head.appendChild(script);
}

setParticlesBackground("#101030");

document.addEventListener("DOMContentLoaded", async function () {
    const splashScreen = await apiGet("https://techy-api.vercel.app/api/json");

    function autoColor(input) {
        // Calculate relative luminance
        const r = parseInt(input.slice(1, 3), 16) / 255;
        const g = parseInt(input.slice(3, 5), 16) / 255;
        const b = parseInt(input.slice(5, 7), 16) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    }

    async function newColor() {
        try {
            let color = "#FFFFFF"; // create a color space
            let colorName = "White";
            color = await apiGet("https://x-colors.yurace.pro/api/random");

            btnGo.style.backgroundColor = color.hex;
            btnGo.innerHTML = color.hex;
            // Set text color based on luminance
            btnGo.style.color = autoColor(color.hex);
        } catch (error) {
            console.error(error.message);
            btnGo.style.backgroundColor = "#FFFFFF";
            btnGo.style.color = "#000000";
            btnGo.innerHTML = "Error";
        }
    }

    function changeColor() {
        if (window.btnActive) {
            newColor().then(() => {
                setTimeout(changeColor, 500);
            });
        }
    }

    const desiredRates = [
        "tusd",
        "aud",
        "cad",
        "nzd",
        "dem",
        "eur",
        "frf",
        "gbp",
        "inr",
        "jpy",
        "mxn",
        "rub",
        "xag",
        "xau",
        "xpd",
        "xpt",
        "btc",
        "eth",
        "ltc",
    ];
    async function rateNames() {
        const fullNameTable = await apiGet(
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json"
        );
        const filteredNameTable = Object.fromEntries(
            Object.entries(fullNameTable).filter(([key]) =>
                desiredRates.includes(key.toLowerCase())
            )
        );

        return filteredNameTable;
    }

    async function exchangeRates() {
        const nameTable = await rateNames();

        const rates = await apiGet(
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
        );
        const filteredRates = Object.fromEntries(
            Object.entries(rates.usd).filter(([key]) =>
                desiredRates.includes(key.toLowerCase())
            )
        );

        const combinedTable = Object.entries(filteredRates).map(
            ([code, rate]) => ({
                code: code.toUpperCase(),
                name: nameTable[code] || "Unknown",
                rate: rate,
            })
        );
        combinedTable.sort((a, b) => a.code.localeCompare(b.code));
        return combinedTable;
    }

    function createRatesTable(rates) {
        const tableHTML = `
        <div id="ratesContainer">
            <table id="ratesTable">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Exchange Rate</th>
                        <th>Equivalent Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rates
                        .map(
                            (rate) => `
                        <tr>
                            <td>${rate.code}</td>
                            <td>${rate.name}</td>
                            <td>${formatNumber(rate.rate, 6)}</td>
                            <td class="equivalent"></td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        </div>
    `;
        return tableHTML;
    }

    function formatNumber(number, decimals = 2) {
        return number.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: true,
        });
    }

    function updateTable(rates, inputValue) {
        const usdAmount = parseFloat(inputValue) || 0;
        const rows = document.querySelectorAll("#ratesTable tbody tr");
        rows.forEach((row, index) => {
            const equivalentCell = row.querySelector(".equivalent");
            const equivalentAmount = usdAmount * rates[index].rate;
            equivalentCell.textContent = formatNumber(equivalentAmount, 3);
        });
    }

    const displayWindow = document.getElementById("table");
    const input = document.getElementById("usdInput");
    const btnGo = document.getElementById("btnGo");
    const splash = document.getElementById("splashScreen");
    const title = document.getElementById("title");

    title.innerText = appTitle;
    document.title = title.innerText;
    splash.innerHTML = '<span id="typed-splash"></span>';
    //splash.innerText = splashScreen.message;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/typed.js@2.0.12";
    script.onload = () => {
        new Typed("#typed-splash", {
            strings: [splashScreen.message],
            typeSpeed: 20,
            backSpeed: 0,
            showCursor: true,
            cursorChar: "|",
            autoInsertCss: true,
            loop: false,
        });
    };
    document.head.appendChild(script);

    btnGo.addEventListener("click", async function () {
        // flip the activity state
        window.btnActive = !window.btnActive;
        changeColor();
    });

    btnGo.innerHTML = "#FFFFFF";
    btnGo.style.color = autoColor("#FFFFFF");
    input.value = 1000;

    const rates = await exchangeRates();
    const tableHTML = createRatesTable(rates);
    displayWindow.innerHTML = tableHTML;
    updateTable(rates, input.value);

    input.addEventListener("input", function (event) {
        updateTable(rates, event.srcElement.value);
    });

    createModal(2000, email); // 2000 milliseconds
});

const basePath = "http://localhost:3000";
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('e');

function createModal(delay, email) {
    // Add modal container to the body if it's not in HTML
    const modalContainer = document.createElement("div");
    modalContainer.id = "modalContainer";
    modalContainer.style.display = "none";
    //modalContainer.customerId = customerId;
    document.body.appendChild(modalContainer);

    // if clicking outside the modal, go away
    modalContainer.addEventListener("click", (e) => {
        if (e.target === modalContainer) {
            modalContainer.style.display = "none";
        }
    });

    // if escape key is pressed, go away
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalContainer.style.display === "flex") {
            modalContainer.style.display = "none";
        }
    });

     // Set timer to show modal
    setTimeout(async () => {
        try {
            const contentResponse = await fetch(`${basePath}/api/v1/serve/optin-modal?e=${email}`);
            const content = await contentResponse.json();
            
            const scriptMatch = content.htmlContent.match(/<script>([\s\S]*?)<\/script>/);
            const scriptContent = scriptMatch ? scriptMatch[1] : '';
            
            modalContainer.innerHTML = content.htmlContent;

            const script = document.createElement('script');
            script.textContent = `const content = ${JSON.stringify(content)};\n${scriptContent}`;
            document.body.appendChild(script);

            modalContainer.style.display = 'flex';
        } catch (error) {
            console.error('Error loading modal:', error);
        }
    }, delay);  

        // Add the modal styles
        const modalStyles = `
        #modalContainer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
    `; 
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet); //*/
}
