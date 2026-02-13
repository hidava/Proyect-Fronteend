-- 1) Eliminar duplicados (mantener la fila con menor id_mascota)
DELETE p1 FROM pacientes p1
INNER JOIN pacientes p2
  ON LOWER(TRIM(p1.nombre)) = LOWER(TRIM(p2.nombre))
  AND p1.propietarios_cedula = p2.propietarios_cedula
  AND p1.id_mascota > p2.id_mascota;

-- 2) Añadir columna generada normalizada (si MySQL >= 5.7 / 8)
ALTER TABLE pacientes ADD COLUMN nombre_norm VARCHAR(255) GENERATED ALWAYS AS (LOWER(TRIM(nombre))) STORED;

-- 3) Crear índice/constraint único sobre (propietarios_cedula, nombre_norm)
ALTER TABLE pacientes ADD CONSTRAINT unique_patient_owner UNIQUE KEY unique_patient_owner (propietarios_cedula, nombre_norm);

-- Nota: Si tu versión de MySQL no soporta GENERATED ... STORED, puedes crear y mantener
-- manualmente la columna `nombre_norm` y llenarla con UPDATE, seguido de un trigger o
-- procedimiento para mantenerla sincronizada. Si quieres, te doy la versión alternativa.
