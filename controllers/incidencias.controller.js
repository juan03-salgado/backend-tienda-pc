import db from "../db.js"

export const getIncidencias = async (req, res) => {
    try {
        const [resultado] = await db.query(`SELECT i.id, i.descripcion, i.fecha_reporte, i.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'categoria', c.nombre) AS producto
        FROM incidencias i
        INNER JOIN usuarios u ON i.id_usuario = u.id
        INNER JOIN productos p ON i.id_producto = p.id
        INNER JOIN categorias c ON p.id_categoria = c.id
        ORDER BY i.id DESC     
    `);
        res.json(resultado);

    } catch(error){
        return res.status(500).json({ error: error.message });
    }
};

export const getIncidenciaId = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(`SELECT i.id, i.descripcion, i.fecha_reporte, i.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'categoria', c.nombre) AS producto
        FROM incidencias i
        INNER JOIN usuarios u ON i.id_usuario = u.id
        INNER JOIN productos p ON i.id_producto = p.id
        INNER JOIN categorias c ON p.id_categoria = c.id
        WHERE i.id = ?
    `, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({ error: "Incidencia no encontrada" });
        }

        res.json(resultado[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getIncidenciasCliente = async (req, res) => {
    try {
        const {id} = req.params;

        const [resultado] = await db.query(`SELECT i.id, i.descripcion, i.fecha_reporte, i.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'precio_unidad', p.precio_unidad,'categoria', 
        JSON_OBJECT('id', c.id, 'nombre', c.nombre)
        ) AS producto
        FROM incidencias i
        INNER JOIN usuarios u ON i.id_usuario = u.id
        INNER JOIN productos p ON i.id_producto = p.id
        INNER JOIN categorias c ON p.id_categoria = c.id
        WHERE i.id_usuario = ?
        ORDER BY i.id DESC
    `, [id]);

        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const getIncidenciasVendedor = async (req, res) => {
    try {
        const {id} = req.params;

        const [resultado] = await db.query(`
            SELECT i.id, i.descripcion, i.fecha_reporte, i.estado,
            JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario,
            JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'categoria', c.nombre) AS producto
            FROM incidencias i
            INNER JOIN usuarios u ON i.id_usuario = u.id
            INNER JOIN productos p ON i.id_producto = p.id
            INNER JOIN categorias c ON p.id_categoria = c.id
            WHERE p.id_vendedor = ?
            ORDER BY i.id DESC
        `, [id]);

        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const añadirIncidencia = async (req, res) => {
    try {
        const {id_usuario, id_producto, descripcion} = req.body;

        if(!descripcion){
            return res.status(400).json({ error: "La descripción es obligatoria"});
        }

        const [resultado] = await db.query("INSERT INTO incidencias (id_usuario, id_producto, descripcion, fecha_reporte, estado) VALUES (?, ?, ?, NOW(), 'PENDIENTE')",
            [id_usuario, id_producto, descripcion]
        );

        res.json({ id: resultado.insertId, id_usuario, id_producto, descripcion, estado: "PENDIENTE"});

    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

export const actualizarEstadoIncidencia = async (req, res) => {
    try {
        const {id} = req.params;
        const { estado, mensaje } = req.body;

        const estadosValidos = ["PENDIENTE", "EN PROCESO", "RESUELTA"];

        if(!estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado no valido"});
        }

        const [actual] = await db.query("SELECT estado, id_usuario FROM incidencias WHERE id = ?",
            [id]
        );

        if(actual.length == 0){
            return res.status(404).json({ error: "Incidencia no encontrada"});
        }

        if(actual[0].estado === estado){
            return res.json({ message: "El estado ya es el mismo"});
        }

        await db.query("UPDATE incidencias SET estado = ? WHERE id = ?",
            [estado, id]
        );
        
        await db.query("INSERT INTO notificaciones (id_usuario, mensaje, leido, fecha) VALUES (?, ?, 0, NOW())",
            [actual[0].id_usuario, mensaje || `Tu incidencia ahora está en estado ${estado}`]
        );

        res.json({ message: "Estado actualizado correctamente", estado});

    } catch(error){
        return res.status(500).json({ error: error.message });
    }
};

export const eliminarIncidencia = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("DELETE FROM incidencias WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Incidencia no encontrada"});
        }

        res.json({ message: "Incidencia eliminada con exito"});

    } catch(error){
        return res.status(500).json({ error: error.message });
    }
};

