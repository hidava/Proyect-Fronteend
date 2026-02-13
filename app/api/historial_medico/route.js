import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams;

    // Si piden la vista completa o filtrar por paciente/historial
    if (search.has('vista') || search.has('paciente_id') || search.has('historial_id')) {
      // historial_id: la vista no tiene id numérico, devolver desde tabla historial_medico
      if (search.has('historial_id')) {
        const id = search.get('historial_id');
        const [rows] = await pool.query(
          `SELECT h.id, h.motivo_consulta, h.diagnostico, h.tratamiento, h.imagen_url, h.imagen_name, h.pacientes_id_mascota, p.nombre AS paciente_nombre
           FROM historial_medico h
           LEFT JOIN pacientes p ON p.id_mascota = h.pacientes_id_mascota
           WHERE h.id = ?`,
          [id]
        );
        return NextResponse.json({ success: true, data: rows });
      }

      // paciente_id: intentar consultar la vista por cedula (propietarios_cedula en pacientes), si no, fallback
      if (search.has('paciente_id')) {
        const pacienteId = search.get('paciente_id');
        try {
          const [[pac]] = await pool.query('SELECT propietarios_cedula FROM pacientes WHERE id_mascota = ? LIMIT 1', [pacienteId]);
          const cedula = pac?.propietarios_cedula || pac?.cedula || null;
          if (cedula) {
            try {
              // Consultar explícitamente las tablas para garantizar que se incluya el id de historial
              const [rows] = await pool.query(
                `SELECT pro.cedula AS cedula,
                        pro.nombre AS nombre_propietario,
                        pro.apellido AS apellido_propietario,
                        pro.telefono AS telefono,
                        pro.direccion AS direccion,
                        pac.nombre AS nombre_mascota,
                        pac.especie AS especie,
                        pac.raza AS raza,
                        pac.edad AS edad,
                        pac.peso AS peso,
                        pac.altura AS altura,
                        h.id AS historial_id,
                        h.motivo_consulta AS motivo_consulta,
                        h.diagnostico AS diagnostico,
                        h.tratamiento AS tratamiento,
                        h.pacientes_id_mascota
                 FROM propietarios pro
                 JOIN pacientes pac ON pro.cedula = pac.propietarios_cedula
                 JOIN historial_medico h ON pac.id_mascota = h.pacientes_id_mascota
                 WHERE pro.cedula = ?
                 ORDER BY pac.nombre`,
                [cedula]
              );
              if (rows && rows.length > 0) return NextResponse.json({ success: true, data: rows });
            } catch (e) {
              console.error('Error consultando historial por cedula con JOIN:', e?.message || e);
            }
          }
        } catch (e) {
          console.error('No se pudo obtener cedula desde pacientes para paciente_id:', pacienteId, e?.message || e);
        }

        // Fallback a tabla historial_medico
        const [rows] = await pool.query(
          `SELECT h.id, h.motivo_consulta, h.diagnostico, h.tratamiento, h.imagen_url, h.imagen_name, h.pacientes_id_mascota, p.nombre AS paciente_nombre
           FROM historial_medico h
           LEFT JOIN pacientes p ON p.id_mascota = h.pacientes_id_mascota
           WHERE h.pacientes_id_mascota = ?
           ORDER BY h.id DESC`,
          [pacienteId]
        );
        return NextResponse.json({ success: true, data: rows });
      }

      // Si piden la vista sin filtros: intentar la vista completa, si falla fallback a la tabla
      try {
        const [rows] = await pool.query(
          `SELECT pro.cedula AS cedula,
            pro.nombre AS nombre_propietario,
            pro.apellido AS apellido_propietario,
            pro.telefono AS telefono,
            pro.direccion AS direccion,
            pac.nombre AS nombre_mascota,
            pac.especie AS especie,
            pac.raza AS raza,
            pac.edad AS edad,
            pac.peso AS peso,
            pac.altura AS altura,
            h.id AS historial_id,
            h.motivo_consulta AS motivo_consulta,
            h.diagnostico AS diagnostico,
            h.tratamiento AS tratamiento
           FROM propietarios pro
           JOIN pacientes pac ON pro.cedula = pac.propietarios_cedula
           JOIN historial_medico h ON pac.id_mascota = h.pacientes_id_mascota
           ORDER BY pac.nombre`
        );
        return NextResponse.json({ success: true, data: rows });
      } catch (e) {
        console.error('vista_historial_completo no disponible (sin filtros):', e?.message || e);
        const [rows] = await pool.query(
          `SELECT h.id, h.motivo_consulta, h.diagnostico, h.tratamiento, h.imagen_url, h.imagen_name, h.pacientes_id_mascota, p.nombre AS paciente_nombre
           FROM historial_medico h
           LEFT JOIN pacientes p ON p.id_mascota = h.pacientes_id_mascota
           ORDER BY h.id DESC`
        );
        return NextResponse.json({ success: true, data: rows });
      }
    }

    // Fallback general: listar historial_medico con nombre de paciente
    const [rows] = await pool.query(
      `SELECT h.id, h.motivo_consulta, h.diagnostico, h.tratamiento, h.pacientes_id_mascota, p.nombre AS paciente_nombre
       FROM historial_medico h
       LEFT JOIN pacientes p ON p.id_mascota = h.pacientes_id_mascota
       ORDER BY h.id DESC`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching historial_medico:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, motivo_consulta, diagnostico, tratamiento, imagen_url, imagen_name } = body || {};

    if (!id) return NextResponse.json({ error: 'El campo id es obligatorio para actualizar' }, { status: 400 });

    const allowed = { motivo_consulta, diagnostico, tratamiento, imagen_url, imagen_name };
    const fields = [];
    const values = [];

    for (const [k, v] of Object.entries(allowed)) {
      if (typeof v !== 'undefined') {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (fields.length === 0) return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });

    values.push(id);
    const query = `UPDATE historial_medico SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    // Intentar devolver la vista por cedula del propietario; si no, fallback a historial_medico
    try {
      const [[hrow]] = await pool.query('SELECT pacientes_id_mascota FROM historial_medico WHERE id = ? LIMIT 1', [id]);
      const pacientesId = hrow?.pacientes_id_mascota;
      if (pacientesId) {
        const [[pac]] = await pool.query('SELECT propietarios_cedula FROM pacientes WHERE id_mascota = ? LIMIT 1', [pacientesId]);
        const cedula = pac?.propietarios_cedula || pac?.cedula || null;
        if (cedula) {
          try {
              const [rows] = await pool.query(
                `SELECT pro.cedula AS cedula,
                    pro.nombre AS nombre_propietario,
                    pro.apellido AS apellido_propietario,
                    pro.telefono AS telefono,
                    pro.direccion AS direccion,
                    pac.nombre AS nombre_mascota,
                    pac.especie AS especie,
                    pac.raza AS raza,
                    pac.edad AS edad,
                    pac.peso AS peso,
                    pac.altura AS altura,
                    h.id AS historial_id,
                    h.motivo_consulta AS motivo_consulta,
                    h.diagnostico AS diagnostico,
                    h.tratamiento AS tratamiento
                 FROM propietarios pro
                 JOIN pacientes pac ON pro.cedula = pac.propietarios_cedula
                 JOIN historial_medico h ON pac.id_mascota = h.pacientes_id_mascota
                 WHERE pro.cedula = ?
                 ORDER BY pac.nombre`,
                [cedula]
              );
            if (rows) return NextResponse.json({ success: true, affectedRows: result.affectedRows, data: rows });
          } catch (e) {
            console.error('Error leyendo vista por cedula tras update:', e?.message || e);
          }
        }
      }
    } catch (e) {
      console.error('Error intentando devolver vista tras update:', e?.message || e);
    }

    const [rows] = await pool.query(
      `SELECT h.id, h.motivo_consulta, h.diagnostico, h.tratamiento, h.imagen_url, h.imagen_name, h.pacientes_id_mascota, p.nombre AS paciente_nombre
       FROM historial_medico h
       LEFT JOIN pacientes p ON p.id_mascota = h.pacientes_id_mascota
       WHERE h.id = ?`,
      [id]
    );

    return NextResponse.json({ success: true, affectedRows: result.affectedRows, data: rows });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error updating historial_medico:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { motivo_consulta, diagnostico, tratamiento, pacientes_id_mascota, imagen_url, imagen_name } = body || {};

    if (!motivo_consulta || !pacientes_id_mascota) {
      return NextResponse.json({ error: 'Motivo y paciente son obligatorios' }, { status: 400 });
    }

    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'historial_medico'",
      [process.env.DB_NAME || 'usuarios_db']
    );

    const colNames = new Set(cols.map(c => c.COLUMN_NAME));

    const hasImagenUrl = colNames.has('imagen_url');
    const hasImagenName = colNames.has('imagen_name');

    const fields = ['motivo_consulta', 'diagnostico', 'tratamiento', 'pacientes_id_mascota'];
    const values = [motivo_consulta, diagnostico || null, tratamiento || null, pacientes_id_mascota];

    if (hasImagenUrl && imagen_url) {
      fields.push('imagen_url');
      values.push(imagen_url);
    }
    if (hasImagenName && imagen_name) {
      fields.push('imagen_name');
      values.push(imagen_name);
    }

    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO historial_medico (${fields.join(',')}) VALUES (${placeholders})`;

    const [result] = await pool.query(query, values);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error saving historial_medico:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
