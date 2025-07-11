document.addEventListener('DOMContentLoaded', function () {
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    const userPassphraseInput = document.getElementById('userPassphrase');
    const userTypeSelect = document.getElementById('userType');
    const criarContaBtn = document.getElementById('criarContaBtn');
    const feedbackMessageP = document.getElementById('feedbackMessage');


    criarContaBtn.addEventListener('click', async function () {

        const name = userNameInput.value;
        const email = userEmailInput.value;
        const password = userPassphraseInput.value;
        const u_type = userTypeSelect.value;

  
        feedbackMessageP.textContent = '';
        feedbackMessageP.className = 'mt-3';


        if (!name || !email || !password) {
            feedbackMessageP.textContent = 'Por favor, preencha todos os campos de cadastro (Nome, Email, Senha).';
            feedbackMessageP.classList.add('has-text-danger');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
             feedbackMessageP.textContent = 'Por favor, insira um endereco de email valido.';
             feedbackMessageP.classList.add('has-text-danger');
             return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('u_type', u_type);

        try {
            const response = await fetch('/adm/user/new', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                feedbackMessageP.textContent = 'Conta de usuario criada com sucesso!';
                feedbackMessageP.classList.add('has-text-success');
                userNameInput.value = '';
                userEmailInput.value = '';
                userPassphraseInput.value = '';
                userTypeSelect.value = 'user';
            } else {

                let errorMessage = `Falha no cadastro da conta: ${response.status}`;
                if (result && result.error) {
                    errorMessage += ` - ${result.error}`;
                }
                feedbackMessageP.textContent = errorMessage;
                feedbackMessageP.classList.add('has-text-danger');
            }
        } catch (error) {
            console.error('Erro na requisicao:', error);
            feedbackMessageP.textContent = 'Falha na conexao com o servidor de cadastro.';
            feedbackMessageP.classList.add('has-text-danger');
        }
    });
});