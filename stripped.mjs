const apiPath = "https://api.ourvibrant.com";
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('e');

const body = document.body;

document.addEventListener("DOMContentLoaded", async function () {
    createModal(1000, email); // 2000 milliseconds
});

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
            const contentResponse = await fetch(`${apiPath}/api/v1/serve/optin-modal?e=${email}`);
            const content = await contentResponse.json();
            // script
            const scriptMatch = content.htmlContent.match(/<script>([\s\S]*?)<\/script>/);
            const scriptContent = scriptMatch ? scriptMatch[1] : '';
            const script = document.createElement('script');
            script.textContent = `const content = ${JSON.stringify(content)};\n${scriptContent}`;
            // style
            const styleMatch = content.htmlContent.match(/<style>([\s\S]*?)<\/style>/);
            const styles = styleMatch ? styleMatch[1] : '';
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            // body
            const bodyMatch = content.htmlContent.match(/<body>([\s\S]*?)<\/body>/);
            const bodyContent = bodyMatch ? bodyMatch[1] : '';
            modalContainer.innerHTML = bodyContent;

            document.head.appendChild(styleSheet);
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