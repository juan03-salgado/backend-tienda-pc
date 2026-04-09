import db from "../db.js";

export const getClientes = async (req, res) => {
    try{
        const [resultado] = await db.query(`SELECT c.id, c.nombre, c.direccion, c.telefono, c.id_user,
            ca.id AS id_carrito, r.nombre_rol
            FROM clientes c
            LEFT JOIN carrito ca ON ca.id_cliente = c.id
            LEFT JOIN usuarios u ON u.id = c.id_user
            LEFT JOIN rol r ON r.id = u.id_rol
        `);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });     
    }
};

export const getClienteId = async (req, res) => {
    try {
        const {id} = req.params;
        const [resultado] = await db.query("SELECT * FROM clientes WHERE id = ?", 
        [id]
    );

        if (resultado.length === 0){
            return res.status(404).json({ error : "cliente no encontrado"})
        }
        res.json(resultado[0]);

    } catch (error){
        res.status(500).json({ error: error.message})
    }
};

export const crearCliente = async (req, res) => {
    try {
        const { nombre, direccion, telefono, id_user } = req.body;
        const [resultado] = await db.query("INSERT INTO clientes (nombre, direccion, telefono, id_user) VALUES (?, ?, ?, ?)",
        [nombre, direccion, telefono, id_user]
    );
        res.json({ id: resultado.insertId, nombre, direccion, telefono, id_user});

    } catch (error) {
        res.status(500).json({ error: error.message})

    }
};

export const actualizarCliente = async(req, res) => {
    try {
        const {id} = req.params;
        const { nombre, direccion, telefono, id_user } = req.body;

        const [resultado] = await db.query("UPDATE clientes SET nombre = ?, direccion = ?, telefono = ?, id_user = ? WHERE id = ?",
        [nombre, direccion, telefono, id_user, id]
    )

    if(resultado.affectedRows === 0){
        return res.status(404).json({ error : "cliente no encontrado"})
    }
    res.json({id, nombre, direccion, telefono, id_user})

    } catch (error){
        res.status(500).json({ error: error.message})
    }
};

export const eliminarCliente = async(req, res) => {
    try {
        const {id} = req.params;

        const [clientes] = await db.query("SELECT id_user FROM clientes WHERE id = ?", [id]);

        if(clientes.length === 0) {
            return res.status(404).json({error: "Cliente no encontrado"});
        } 

        const id_user = clientes[0].id_user;

        await db.query(`DELETE dc FROM detalle_compra dc INNER JOIN compras_realizadas cr ON dc.id_compra = cr.id
        INNER JOIN carrito c ON cr.id_carrito = c.id WHERE c.id_cliente = ?`, [id]);

        await db.query(`DELETE cr FROM compras_realizadas cr INNER JOIN carrito c ON cr.id_carrito = c.id
        WHERE c.id_cliente = ?`, [id]);

        await db.query(`DELETE FROM carrito_producto WHERE id_carrito IN 
        (SELECT id FROM carrito WHERE id_cliente = ?)`, [id]);

        await db.query("DELETE FROM carrito WHERE id_cliente = ?", [id]);
        await db.query("DELETE FROM clientes WHERE id = ?", [id]);
        await db.query("DELETE FROM usuarios WHERE id = ?", [id_user]);

        res.json({message: "Cliente y usuario eliminados correctamente"});
        
    } catch (error){
        res.status(500).json({error: error.message});
    }
};