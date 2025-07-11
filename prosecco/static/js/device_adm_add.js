document.addEventListener("DOMContentLoaded", function () {
    const cadastrarTelaBtn = document.getElementById("cadastrarTelaBtn");
    const feedbackMessage = document.getElementById("deviceFeedbackMessage");

    cadastrarTelaBtn.addEventListener("click", async function () {
        const ip = document.getElementById("deviceIp").value.trim();
        const locale = document.getElementById("deviceLocale").value.trim();
        const group = document.getElementById("deviceGroup").value.trim();
        const user = document.getElementById("deviceUser").value;

        if (!ip || !locale || !group || !user) {
            feedbackMessage.textContent = "Por favor, preencha todos os campos de cadastro.";
            feedbackMessage.style.color = "red";
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append("ip", ip);
            formData.append("locale", locale);
            formData.append("group", group);
            formData.append("user", user);

            const response = await fetch("/adm/device/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });

            const result = await response.json();

            if (response.ok) {
                feedbackMessage.textContent = "Dispositivo de exibicao cadastrado com sucesso!";
                feedbackMessage.style.color = "green";
                document.getElementById("deviceIp").value = "";
                document.getElementById("deviceLocale").value = "";
                document.getElementById("deviceGroup").value = "";
                document.getElementById("deviceUser").value = "";
            } else {
                feedbackMessage.textContent = `Falha no cadastro: ${result.error || 'Erro desconhecido no servidor.'}`;
                feedbackMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Erro ao cadastrar tela:", error);
            feedbackMessage.textContent = "Falha na conexao com o servidor de cadastro.";
            feedbackMessage.style.color = "red";
        }
    });
});