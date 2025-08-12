console.log("Hello from script.js!");

// Example of DOM manipulation
document.addEventListener('DOMContentLoaded', (event) => {
    const p = document.querySelector('p');
    p.textContent = "This text was changed by script.js.";
});
