// Verificar si hay una sesión activa
fetch('/session')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            // Ocultar enlaces de inicio de sesión y registro
            document.getElementById('loginLink').style.display = 'none';
            document.getElementById('signupLink').style.display = 'none';
            // Mostrar el enlace de cerrar sesión
            document.getElementById('logoutLink').style.display = 'block';
            document.getElementById('cartLink').style.display = 'block';
        }
    })
    .catch(error => console.error('Error al verificar la sesión:', error));
