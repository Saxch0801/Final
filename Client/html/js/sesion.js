// Verificar si hay una sesión activa
fetch('/session')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            // Redirigir a la página de productos si la sesión está activa
            window.location.href = '/';
        } else {
        }
    })
    .catch(error => console.error('Error al verificar la sesión:', error));
