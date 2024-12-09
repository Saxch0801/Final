// Importar dependencias
const express = require('express');
const mysql = require('mysql');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24// 1 dia
    }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'Pandini09',
  //  password: 'Oinotna123',
    password: 'n0m3l0',
    database: 'LaDesesperanza'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

// 1. Obtener todos los productos con el nombre de la categoría
app.get('/productos', (req, res) => {
    const query = `
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, p.imagen_url, c.nombre_categoria
        FROM Productos p
        INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener productos' });
        } else {
            res.json(results);
        }
    });
});

// 2. Obtener un producto por ID
app.get('/productos/:id', (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, p.imagen_url, c.nombre_categoria
        FROM Productos p
        INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el producto' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json(result[0]); // Esto ahora incluirá el nombre de la categoría
        }
    });
});

// 3. Agregar un nuevo producto
app.post('/addProductos', (req, res) => {
    const { nombre, descripcion, precio, stock, id_categoria, imagen_url, imagen } = req.body;
    console.log('Datos recibidos:', req.body); // Agrega esto para depurar
    const sql = 'INSERT INTO Productos (nombre, descripcion, precio, stock, id_categoria, imagen_url, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, descripcion, precio, stock, id_categoria, imagen_url, imagen], (err, result) => {
        if (err) {
            console.error('Error al agregar el producto:', err); // Agrega esto para ver el error
            res.status(500).json({ error: 'Error al agregar el producto' });
        } else {
            res.status(201).json({ message: 'Producto agregado', id: result.insertId });
        }
    });
});

// Obtener todas las categorías del producto
app.get('/categorias', (req, res) => {
    db.query('SELECT * FROM Categorias', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener categorías' });
        } else {
            res.json(results);
        }
    });
});


// 4. Actualizar un producto por ID
app.put('/updateProductos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio, stock, id_categoria, imagen_url, imagen } = req.body;
    const sql = 'UPDATE Productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?, imagen_url = ?, imagen = ? WHERE id_producto = ?';
    db.query(sql, [nombre, descripcion, precio, stock, id_categoria, imagen_url, imagen, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json({ message: 'Producto actualizado' });
        }
    });
});

// 5. Eliminar un producto por ID
app.delete('/deleteProductos/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM Productos WHERE id_producto = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar el producto' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json({ message: 'Producto eliminado' });
        }
    });
});

// 1. Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM Usuarios', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener usuarios' });
        } else {
            res.json(results);
        }
    });
});

// 2. Obtener un usuario por ID
app.get('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM Usuarios WHERE id_usuario = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el usuario' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.json(result[0]);
        }
    });
});

// 3. Agregar un nuevo usuario
app.post('/signupUsuario', (req, res) => {
    const { nombre_usuario, email, contraseña, rol } = req.body;
    const sql = 'INSERT INTO Usuarios (nombre_usuario, email, contraseña, rol) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre_usuario, email, contraseña, rol], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al agregar el usuario' });
        } else {
            res.status(201).json({ message: 'Usuario agregado', id: result.insertId });
        }
    });
});

// 4. Actualizar un usuario por ID
app.put('/updateUsuarios/:id', (req, res) => {
    const id = req.params.id;
    const { nombre_usuario, email, contraseña, rol } = req.body;
    const sql = 'UPDATE Usuarios SET nombre_usuario = ?, email = ?, contraseña = ?, rol = ? WHERE id_usuario = ?';
    db.query(sql, [nombre_usuario, email, contraseña, rol, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar el usuario' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.json({ message: 'Usuario actualizado' });
        }
    });
});

// 5. Eliminar un usuario por ID
app.delete('/deleteUsuarios/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM Usuarios WHERE id_usuario = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar el usuario' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.json({ message: 'Usuario eliminado' });
        }
    });
});

// Agregar un producto al carrito
app.post('/addToCart', (req, res) => {
    console.log('Datos recibidos:', req.body); // Verificar lo que llega al servidor
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Datos inválidos. Asegúrate de proporcionar id_producto y una cantidad válida.' });
    }
    // Obtener el ID del usuario desde la sesión
    const id_usuario = req.session.userId;

    // Validar que el usuario esté autenticado
    if (!id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validar datos del cuerpo
    if (!id_producto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Datos inválidos. Asegúrate de proporcionar id_producto y una cantidad válida.' });
    }

    // Verificar si el usuario tiene un carrito activo
    const queryCarritoActivo = `
        SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo'
    `;

    db.query(queryCarritoActivo, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al verificar el carrito activo:', err);
            return res.status(500).json({ error: 'Error al verificar el carrito activo' });
        }

        let id_carrito;

        if (results.length === 0) {
            // Crear un nuevo carrito si no existe uno activo
            const queryCrearCarrito = `
                INSERT INTO Carrito (id_usuario) VALUES (?)
            `;
            db.query(queryCrearCarrito, [id_usuario], (err, result) => {
                if (err) {
                    console.error('Error al crear el carrito:', err);
                    return res.status(500).json({ error: 'Error al crear el carrito' });
                }

                id_carrito = result.insertId; // ID del nuevo carrito
                agregarProductoAlCarrito(id_carrito);
            });
        } else {
            // Usar el carrito activo existente
            id_carrito = results[0].id_carrito;
            agregarProductoAlCarrito(id_carrito);
        }
    });

    // Función para agregar el producto al carrito
    function agregarProductoAlCarrito(id_carrito) {
        // Verificar si el producto ya está en el carrito
        const queryProductoEnCarrito = `
            SELECT cantidad FROM Detalles_Carrito WHERE id_carrito = ? AND id_producto = ?
        `;

        db.query(queryProductoEnCarrito, [id_carrito, id_producto], (err, results) => {
            if (err) {
                console.error('Error al verificar el producto en el carrito:', err);
                return res.status(500).json({ error: 'Error al verificar el producto en el carrito' });
            }

            if (results.length > 0) {
                // Incrementar la cantidad si el producto ya está en el carrito
                const nuevaCantidad = results[0].cantidad + cantidad;
                const queryActualizarCantidad = `
                    UPDATE Detalles_Carrito SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?
                `;

                db.query(queryActualizarCantidad, [nuevaCantidad, id_carrito, id_producto], (err) => {
                    if (err) {
                        console.error('Error al actualizar la cantidad del producto:', err);
                        return res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
                    }

                    res.status(200).json({ message: 'Cantidad del producto actualizada en el carrito' });
                });
            } else {
                // Agregar el producto como un nuevo registro en Detalles_Carrito
                const queryAgregarProducto = `
                    INSERT INTO Detalles_Carrito (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)
                `;

                db.query(queryAgregarProducto, [id_carrito, id_producto, cantidad], (err) => {
                    if (err) {
                        console.error('Error al agregar el producto al carrito:', err);
                        return res.status(500).json({ error: 'Error al agregar el producto al carrito' });
                    }

                    res.status(201).json({ message: 'Producto agregado al carrito' });
                });
            }
        });
    }
});

app.get('/getCart', (req, res) => {
    const id_usuario = req.session.userId;

    if (!id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener el carrito activo del usuario
    const queryCarritoActivo = `
        SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo'
    `;

    db.query(queryCarritoActivo, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al verificar el carrito activo:', err);
            return res.status(500).json({ error: 'Error al verificar el carrito activo' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontró un carrito activo para este usuario' });
        }

        const id_carrito = results[0].id_carrito;

        // Obtener los detalles del carrito (productos y cantidades)
        const queryDetallesCarrito = `
            SELECT 
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen_url,
                dc.cantidad
            FROM Detalles_Carrito dc
            JOIN Productos p ON dc.id_producto = p.id_producto
            WHERE dc.id_carrito = ?
        `;

        db.query(queryDetallesCarrito, [id_carrito], (err, detalles) => {
            if (err) {
                console.error('Error al obtener los detalles del carrito:', err);
                return res.status(500).json({ error: 'Error al obtener los detalles del carrito' });
            }

            if (detalles.length === 0) {
                return res.status(200).json({ 
                    id_carrito,
                    productos: [] 
                });
            }

            res.status(200).json({
                id_carrito,
                productos: detalles
            });
        });
    });
});

app.post('/updateCart', (req, res) => {
    const { id_producto, accion } = req.body;

    // Obtener el ID del usuario desde la sesión
    const id_usuario = req.session.userId;

    if (!id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Lógica para actualizar la cantidad del producto en el carrito
    let queryActualizarCantidad;
    if (accion === 'increment') {
        queryActualizarCantidad = `
            UPDATE Detalles_Carrito 
            SET cantidad = cantidad + 1 
            WHERE id_carrito = (SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo') 
            AND id_producto = ?
        `;
    } else if (accion === 'decrement') {
        queryActualizarCantidad = `
            UPDATE Detalles_Carrito 
            SET cantidad = cantidad - 1 
            WHERE id_carrito = (SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo') 
            AND id_producto = ?
        `;
        queryEliminarProducto = `
            DELETE FROM Detalles_Carrito 
            WHERE id_carrito = (SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo') 
            AND id_producto = ? 
            AND cantidad <= 0
        `;
    }
    
    db.query(queryActualizarCantidad, [id_usuario, id_producto], (err) => {
        if (err) {
            console.error('Error al actualizar la cantidad:', err);
            return res.status(500).json({ error: 'Error al actualizar la cantidad' });
        }
    
        // Intentar eliminar productos con cantidad 0
        if (accion === 'decrement') {
            db.query(queryEliminarProducto, [id_usuario, id_producto], (err) => {
                if (err) {
                    console.error('Error al eliminar el producto:', err);
                    return res.status(500).json({ error: 'Error al eliminar el producto' });
                }
                res.json({ success: true });
            });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/cartCount', (req, res) => {
    const userId = req.session.userId; // Suponiendo que el ID del usuario está en la sesión

    if (!userId) {
        return res.json({ count: 0 }); // Si no está autenticado, el carrito está vacío
    }

    const query = `
        SELECT SUM(cantidad) AS total
        FROM Detalles_Carrito 
        WHERE id_carrito = (
            SELECT id_carrito 
            FROM Carrito 
            WHERE id_usuario = ? AND estado = 'activo'
        )
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el total de productos del carrito:', err);
            return res.status(500).json({ error: 'Error al obtener el total de productos' });
        }

        const total = results[0].total || 0; // Si el carrito está vacío, el total es 0
        res.json({ count: total });
    });
});

app.post('/finalizarCompra', (req, res) => {
    const id_usuario = req.session.userId;

    if (!id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Lógica para vaciar el carrito
    const queryVaciarCarrito = `
        DELETE FROM Detalles_Carrito
        WHERE id_carrito = (SELECT id_carrito FROM Carrito WHERE id_usuario = ? AND estado = 'activo')
    `;

    db.query(queryVaciarCarrito, [id_usuario], (err) => {
        if (err) {
            console.error('Error al vaciar el carrito:', err);
            return res.status(500).json({ error: 'Error al vaciar el carrito' });
        }

        res.json({ success: true });
    });
});


// Ruta para manejar el inicio de sesión
app.post('/loginUsuario', (req, res) => {
    const { username, password } = req.body;

    // Verificar usuario en la base de datos
    db.query('SELECT * FROM Usuarios WHERE nombre_usuario = ? AND contraseña = ?', [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al iniciar sesión' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Guardar información del usuario en la sesión
        req.session.userId = results[0].id_usuario;
        req.session.username = results[0].nombre_usuario;

        res.json({ message: 'Inicio de sesión exitoso' });
    });
});

// Verificar si hay una sesión activa
app.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        // Responder con un estado de éxito
        res.json({ message: 'Sesión cerrada' });
    });
});

app.get('/isAdmin', (req, res) => {
    if (req.session.userId) {
        db.query('SELECT rol FROM Usuarios WHERE id_usuario = ?', [req.session.userId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al verificar rol' });
            }
            if (results[0]?.rol === 'admin') {
                return res.json({ isAdmin: true });
            }
            res.json({ isAdmin: false });
        });
    } else {
        res.json({ isAdmin: false });
    }
});

app.use(logger('dev'));

app.use(express.json());
// Servir archivos estáticos desde la carpeta client/html
app.use(express.static(path.join(process.cwd(), 'Client', 'html')));
app.use(express.static(path.join(process.cwd(), 'Client')));
// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'index.html'));
});
//ruta login
app.get('/login', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'login.html'));
});
//ruta registro
app.get('/signup', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'signup.html'));
});
//ruta contacto
app.get('/contacto', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'contacto.html'));
});
//ruta nosotros
app.get('/nosotros', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'nosotros.html'));
});
//ruta productos
app.get('/pagina-productos', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'productos.html'));
});
//ruta producto
app.get('/ver_producto', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'ver_producto.html'));
});
//ruta carrito
app.get('/carrito', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'carrito.html'));
});
app.get('/compraFinalizada', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'html', 'compraFinalizada.html'));
});
// Manejo de errores en rutas no encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(process.cwd(),'Client', 'html', 'error404.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
