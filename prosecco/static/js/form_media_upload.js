const form = document.getElementById('uploadForm');
const responseDiv = document.getElementById('response');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        responseDiv.classList.remove('is-hidden', 'is-danger', 'is-success');

        if (data.success) {
            responseDiv.classList.add('is-success');
            responseDiv.textContent = data.message || 'Upload realizado com sucesso!';

            setTimeout(() => {
                if (window.carregarMidias) {
                    window.carregarMidias();
                }
                form.reset();
            }, 1000);
        } else {
            responseDiv.classList.add('is-danger');
            responseDiv.textContent = data.error || 'Erro no upload.';
            hideMessage();
        }
    } catch (err) {
        responseDiv.classList.remove('is-hidden', 'is-success');
        responseDiv.classList.add('is-danger');
        responseDiv.textContent = 'Erro ao enviar o formulário.';
        hideMessage();
    }

    function hideMessage() {
        setTimeout(() => {
            responseDiv.classList.add('is-hidden');
        }, 5000);
    }

});