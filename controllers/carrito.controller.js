import db from "../db.js"

export const getCarrito = async (req, res) => {
    try {
        const [resultado] = await db.query(`SELECT c.id, c.id_cliente,
        JSON_OBJECT('id', cli.id,'nombre', cli.nombre, 'direccion', cli.direccion, 'telefono', cli.telefono, 'rol', u.id_rol) AS cliente
        FROM carrito c
        INNER JOIN clientes cli ON c.id_cliente = cli.id
        INNER JOIN usuarios u ON cli.id_user = u.id
    `,);
        res.json(resultado);

    } catch(error) {
        res.status(500).json({error: error.message})
    }
};

export const getCarritoId = async (req, res) => {
    try {
        const {id} = req.params;
        const [resultado] = await db.query(`SELECT c.id, c.id_cliente,
        JSON_OBJECT('id', cli.id, 'nombre', cli.nombre, 'direccion', cli.direccion, 'telefono', cli.telefono, 'rol', u.id_rol) AS cliente
        FROM carrito c
        INNER JOIN clientes cli ON c.id_cliente = cli.id
        INNER JOIN usuarios u ON cli.id_user = u.id
        WHERE c.id = ?
    `, [id]);

        if(resultado.length === 0){
            return res.status(404).json({ error: "Carrito no encontrado"});
        }

        res.json(resultado[0]);

    } catch(error){
        res.status(500).json({ error: error.message});
    }
};

export const crearCarrito = async (req, res) => {
    try {
        const { id_cliente } = req.body;
        const [resultado] = await db.query("INSERT INTO carrito (id_cliente) VALUES (?)",
            [id_cliente]
        );

        res.json({ id: resultado.insertId, id_cliente});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

export const actualizarCarrito = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_cliente } = req.body; 

        const [resultado] = await db.query("UPDATE carrito SET id_cliente = ? WHERE id = ?",
            [id_cliente, id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Carrito no encontrado"})
        };

        res.json({id_cliente})

    } catch(error){
        res.status(500).json({ error: error.message}) 
    }
};

export const eliminarCarrito = async(req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query("DELETE FROM carrito WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Carrito no encontrado "})
        }

        res.json({ message: "Carrito eliminado con exito"});

    } catch (error){
        res.status(500).json({ error: error.message });
    }
};