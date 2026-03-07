document.addEventListener("DOMContentLoaded", () => {

    const toggleButton = document.getElementById("toggle-contrast");
    const message = document.getElementById("screen-reader-message");
    const colorblindSelect = document.getElementById("colorblind-mode");
    const ttsButton = document.getElementById("toggle-tts");
    const btnAumentar = document.getElementById("aumentar-fonte");
    const btnDiminuir = document.getElementById("diminuir-fonte");

    const FONTE_MIN = 80;
    const FONTE_MAX = 150;
    const FONTE_PASSO = 10;
    const FONTE_PADRAO = 100;

    /* =========================
       UTILITÁRIO: localStorage seguro
    ========================= */

    function savePreference(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("localStorage indisponível:", e);
        }
    }

    function loadPreference(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage indisponível:", e);
            return null;
        }
    }

    /* =========================
       UTILITÁRIO: anúncio para leitores de tela
    ========================= */

    function announce(text) {
        if (!message) return;
        message.textContent = text;
        setTimeout(() => {
            message.textContent = "";
        }, 1500);
    }

    /* =========================
       ALTO CONTRASTE
    ========================= */

    if (toggleButton) {

        const savedContrast = loadPreference("high-contrast");
        if (savedContrast === "true") {
            document.body.classList.add("high-contrast");
            toggleButton.setAttribute("aria-pressed", "true");
            toggleButton.textContent = "Desativar Alto Contraste";
        }

        toggleButton.addEventListener("click", () => {
            const isPressed = toggleButton.getAttribute("aria-pressed") === "true";

            document.body.classList.toggle("high-contrast");
            toggleButton.setAttribute("aria-pressed", String(!isPressed));

            toggleButton.textContent = isPressed
                ? "Ativar Alto Contraste"
                : "Desativar Alto Contraste";

            announce(isPressed
                ? "Modo alto contraste desativado"
                : "Modo alto contraste ativado"
            );

            savePreference("high-contrast", String(!isPressed));
        });
    }

    /* =========================
       SIMULADOR DALTONISMO
    ========================= */

    if (colorblindSelect) {

        const savedMode = loadPreference("colorblind-mode");
        if (savedMode && savedMode !== "normal") {
            document.documentElement.classList.add(savedMode);
            colorblindSelect.value = savedMode;
        }

        colorblindSelect.addEventListener("change", () => {
            document.documentElement.classList.remove(
                "protanopia",
                "deuteranopia",
                "tritanopia"
            );

            const mode = colorblindSelect.value;

            if (mode !== "normal") {
                document.documentElement.classList.add(mode);
            }

            const modeLabels = {
                normal: "Visão normativa ativada",
                protanopia: "Simulação de protanopia ativada",
                deuteranopia: "Simulação de deuteranopia ativada",
                tritanopia: "Simulação de tritanopia ativada"
            };

            announce(modeLabels[mode] || "Modo visual alterado");
            savePreference("colorblind-mode", mode);
        });
    }

    /* =========================
       AUDIODESCRIÇÃO (TTS)
    ========================= */

    if (ttsButton && "speechSynthesis" in window) {

        function getConteudoPrincipal() {
            const main = document.getElementById("main-content");
            return main ? main.innerText : document.body.innerText;
        }

        function iniciarLeitura() {
            speechSynthesis.cancel();

            const fala = new SpeechSynthesisUtterance(getConteudoPrincipal());
            fala.lang = "pt-BR";
            fala.rate = 0.95;

            fala.onstart = () => {
                ttsButton.textContent = "⏹ Parar leitura";
                ttsButton.setAttribute("aria-pressed", "true");
                ttsButton.setAttribute("aria-label", "Parar leitura em voz alta");
                announce("Leitura em voz alta iniciada");
            };

            fala.onend = () => {
                ttsButton.textContent = "🔊 Ouvir conteúdo";
                ttsButton.setAttribute("aria-pressed", "false");
                ttsButton.setAttribute("aria-label", "Ativar leitura em voz alta do conteúdo");
                announce("Leitura em voz alta concluída");
            };

            fala.onerror = () => {
                ttsButton.textContent = "🔊 Ouvir conteúdo";
                ttsButton.setAttribute("aria-pressed", "false");
                ttsButton.setAttribute("aria-label", "Ativar leitura em voz alta do conteúdo");
                announce("Erro ao iniciar leitura");
            };

            speechSynthesis.speak(fala);
        }

        function pararLeitura() {
            speechSynthesis.cancel();
            ttsButton.textContent = "🔊 Ouvir conteúdo";
            ttsButton.setAttribute("aria-pressed", "false");
            ttsButton.setAttribute("aria-label", "Ativar leitura em voz alta do conteúdo");
            announce("Leitura em voz alta interrompida");
        }

        ttsButton.addEventListener("click", () => {
            const isReading = ttsButton.getAttribute("aria-pressed") === "true";
            isReading ? pararLeitura() : iniciarLeitura();
        });

        window.addEventListener("beforeunload", () => {
            speechSynthesis.cancel();
        });

    } else if (ttsButton) {
        ttsButton.style.display = "none";
    }

    /* =========================
       CONTROLE DE FONTE
    ========================= */

    if (btnAumentar && btnDiminuir) {

        // ✅ CORRIGIDO: conversão explícita para número com fallback seguro
        let tamanhoFonte = parseInt(loadPreference("tamanhoFonte"), 10) || FONTE_PADRAO;

        function aplicarFonte(tamanho) {
            document.body.style.fontSize = tamanho + "%";
            savePreference("tamanhoFonte", tamanho);

            // ✅ ADICIONADO: desabilita botões nos limites para feedback visual e semântico
            btnAumentar.disabled = tamanho >= FONTE_MAX;
            btnDiminuir.disabled = tamanho <= FONTE_MIN;

            announce(`Tamanho de fonte: ${tamanho}%`);
        }

        // Aplica preferência salva ao carregar
        aplicarFonte(tamanhoFonte);

        btnAumentar.addEventListener("click", () => {
            if (tamanhoFonte < FONTE_MAX) {
                tamanhoFonte += FONTE_PASSO;
                aplicarFonte(tamanhoFonte);
            }
        });

        btnDiminuir.addEventListener("click", () => {
            if (tamanhoFonte > FONTE_MIN) {
                tamanhoFonte -= FONTE_PASSO;
                aplicarFonte(tamanhoFonte);
            }
        });
    }

});