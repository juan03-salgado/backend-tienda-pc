import db from "../db.js";

export const getNotificacionesUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY id DESC",
            [id]
        );
        res.json(resultado)

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const contarNoLeidas = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("SELECT COUNT(*) AS total FROM notificaciones WHERE id_usuario = ? AND leido = 0",
            [id]
        );

        res.json(resultado[0]);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const marcarLeido = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("UPDATE notificaciones SET leido = 1 WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Notificación no encontrada" });
        }

        res.json({ message: "Notificación marcada como leída" });

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export const eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("DELETE FROM notificaciones WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Notificación no encontrada" });
        }

        res.json({ message: "Notificación eliminada con éxito" });

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}