-- Script para crear la base de datos y tabla de propietarios (usuarios)
-- Este script asegura que la estructura de la base de datos sea correcta

CREATE DATABASE IF NOT EXISTS usuarios_db;
USE usuarios_db;

-- Tabla de propietarios (usuarios del sistema)
CREATE TABLE IF NOT EXISTS propietarios (
    cedula VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de pacientes (mascotas)
CREATE TABLE IF NOT EXISTS pacientes (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad INT,
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    propietarios_cedula VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propietarios_cedula) REFERENCES propietarios(cedula) ON DELETE CASCADE,
    INDEX idx_propietarios_cedula (propietarios_cedula)
);

-- Añadir columna normalizada para evitar duplicados (opcional, solo si tu MySQL >= 5.7)
-- ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nombre_norm VARCHAR(255) GENERATED ALWAYS AS (LOWER(TRIM(nombre))) STORED;
-- ALTER TABLE pacientes ADD CONSTRAINT IF NOT EXISTS unique_patient_owner UNIQUE KEY (propietarios_cedula, nombre_norm);

-- Tabla de historial médico
CREATE TABLE IF NOT EXISTS historial_medico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motivo_consulta TEXT NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    pacientes_id_mascota INT NOT NULL,
    imagen_url VARCHAR(255),
    imagen_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pacientes_id_mascota) REFERENCES pacientes(id_mascota) ON DELETE CASCADE,
    INDEX idx_pacientes_id_mascota (pacientes_id_mascota)
);
