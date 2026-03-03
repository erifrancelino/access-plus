const toggleButton = document.getElementById("toggle-contrast");

toggleButton.addEventListener("click", function () {
    document.body.classList.toggle("high-contrast");

    const isPressed = toggleButton.getAttribute("aria-pressed") === "true";
    toggleButton.setAttribute("aria-pressed", !isPressed);

    toggleButton.textContent = isPressed
        ? "Ativar Alto Contraste"
        : "Desativar Alto Contraste";
});
