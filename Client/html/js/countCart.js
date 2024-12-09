document.addEventListener('DOMContentLoaded', function () {
    actualizarContadorCarrito();
});

function actualizarContadorCarrito() {
    fetch('/cartCount', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = data.count; // Actualiza el contador
        }
    })
    .catch(error => {
        console.error('Error al actualizar el contador del carrito:', error);
    });
}
