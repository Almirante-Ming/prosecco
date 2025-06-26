async function Login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const response = await fetch('/login/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: usuario, passphrase: senha })
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = data.redirect_url;
    } else {
        document.getElementById("mensagem").innerHTML = data.error;
    }
}