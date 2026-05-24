import db from "../db.js";

export const getServicios = async (req, res) => {
    try {
        const [resultado] = await db.query(`SELECT s.id, s.tipo_servicio, s.descripcion, s.fecha_solicitud, s.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre) AS producto
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id
        LEFT JOIN productos p ON s.id_producto = p.id
        ORDER BY s.id DESC
    `);
        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const getServicioId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [resultado] = await db.query(`SELECT s.id, s.tipo_servicio, s.descripcion, s.fecha_solicitud, s.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre) AS producto
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id
        LEFT JOIN productos p ON s.id_producto = p.id
        WHERE s.id = ?
        `, [id]);

        if(resultado.length === 0){
            return res.status(404).json({ error: "Servicio no encontrado"});
        }

        res.json(resultado[0]);
            
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const getServiciosUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(`SELECT s.id, s.tipo_servicio, s.descripcion, s.fecha_solicitud, s.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre) AS producto
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id
        LEFT JOIN productos p ON s.id_producto = p.id
        WHERE s.id_usuario = ?
        ORDER BY s.id DESC
        `, [id]);

        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const getServiciosVendedor = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(`SELECT s.id, s.tipo_servicio, s.descripcion, s.fecha_solicitud, s.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre) AS producto
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id
        INNER JOIN productos p ON s.id_producto = p.id
        WHERE p.id_vendedor = ?
        ORDER BY s.id DESC
        `, [id]);

        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const crearServicio = async (req, res) => {
    try {
        const { id_usuario, id_producto, tipo_servicio, descripcion } = req.body;

        if(!id_usuario || !id_producto || !tipo_servicio || !descripcion){
            return res.status(400).json({ error: "Datos incompletos"});
        }

        const [resultado] = await db.query(`INSERT INTO servicios_tecnicos (id_usuario, id_producto, tipo_servicio, descripcion, fecha_solicitud, estado) VALUES (?, ?, ?, ?, NOW(), 'PENDIENTE')`,
            [id_usuario, id_producto, tipo_servicio, descripcion]
        );

        res.json({ id: resultado.insertId, id_usuario, id_producto, tipo_servicio, descripcion});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

export const actualizarEstadoServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, mensaje } = req.body;

        const estadosValidos = ["PENDIENTE", "EN PROCESO", "FINALIZADO"];

        if(!estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado no valido"});
        }

        const [actual] = await db.query("SELECT estado, id_usuario FROM servicios_tecnicos WHERE id = ?",
            [id]
        );

        if(actual.length === 0){
            return res.status(404).json({ error: "Servicio no encontrado"});
        }

        if(actual[0].estado === estado){
            return res.json({ message: "El estado ya es el mismo"});
        }

        await db.query("UPDATE servicios_tecnicos SET estado = ? WHERE id = ?",
            [estado, id]
        );

        await db.query(`INSERT INTO notificaciones (id_usuario, mensaje, leido, fecha) VALUES (?, ?, 0, NOW())`,
            [actual[0].id_usuario, mensaje || `Tu solicitud ahora está en estado: ${estado}`]
        );

        res.json({ message: "Estado actualizado", estado});

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarServicio = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("DELETE FROM servicios_tecnicos WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            res.status(404).json({ error: "Servicio no encontrado"});
        }

        res.json({ message: "Servicio eliminado con exito"});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

