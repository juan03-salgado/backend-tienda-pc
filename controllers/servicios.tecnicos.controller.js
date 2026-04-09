import db from "../db.js";

export const getServicios = async (req, res) => {
    try {
        const [resultado] = await db.query(`SELECT s.id, s.tipo_servicio, s.descripcion, s.fecha_solicitud, s.estado,
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id    
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
        JSON_OBJECT('id', u.id, 'nombre', u.nombre_user, 'email', u.email) AS usuario
        FROM servicios_tecnicos s
        INNER JOIN usuarios u ON s.id_usuario = u.id
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

export const crearServicio = async (req, res) => {
    try {
        const { id_usuario, tipo_servicio, descripcion, fecha_solicitud, estado } = req.body;

        if(!tipo_servicio || !descripcion){
            return res.status(400).json({ error: "Datos incompletos"});
        }

        const [resultado] = await db.query(`INSERT INTO servicios_tecnicos (id_usuario, tipo_servicio, descripcion, fecha_solicitud, estado) VALUES (?, ?, ?, NOW(), 'PENDIENTE')`,
            [id_usuario, tipo_servicio, descripcion]
        );

        res.json({ id: resultado.insertId, id_usuario, tipo_servicio, descripcion, fecha_solicitud, estado: "PENDIENTE"});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

export const actualizarEstadoServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ["PENDIENTE", "EN PROCESO", "FINALIZADO"];

        if(!estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado no valido"});
        }

        const [resultado] = await db.query("UPDATE servicios_tecnicos SET estado = ? WHERE id = ?",
            [estado, id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Servicio no encontrado"});
        }

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

