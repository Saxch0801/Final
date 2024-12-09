-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS LaDesesperanza ;
USE LaDesesperanza;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado') DEFAULT 'empleado',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS Categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS Productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_categoria INT,
    id_usuario INT, -- Usuario que agregó o actualizó el producto
    imagen_url VARCHAR(255), -- URL de la imagen
    imagen LONGBLOB, -- Imagen en formato BLOB
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla de Carrito
CREATE TABLE IF NOT EXISTS Carrito (
    id_carrito INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,  -- Usuario al que pertenece el carrito
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'finalizado') DEFAULT 'activo',
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla de Detalles_Carrito (relación muchos a muchos entre Carrito y Productos)
CREATE TABLE IF NOT EXISTS Detalles_Carrito (
    id_carrito INT,
    id_producto INT,
    cantidad INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_carrito, id_producto),
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100)
);

-- Tabla de Productos_Proveedores (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS Productos_Proveedores (
    id_producto INT,
    id_proveedor INT,
    costo_unitario DECIMAL(10, 2),
    tiempo_entrega INT,
    PRIMARY KEY (id_producto, id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre_cliente VARCHAR(100) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(15),
    email VARCHAR(100)
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS Pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT,
    id_usuario INT, -- Usuario que gestionó el pedido
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_pedido VARCHAR(20),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla de Detalles_Pedido
CREATE TABLE IF NOT EXISTS Detalles_Pedido (
    id_pedido INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS Facturas (
    id_factura INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT,
    id_usuario INT, -- Usuario que generó la factura
    fecha_factura DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

