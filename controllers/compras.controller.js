import db from "../db.js"

export const getCompras = async (req, res) => {
    try{
        const [resultado] = await db.query(`SELECT cr.id AS id_compra, cr.id_carrito, cr.referencia_pago, cr.fecha_compra, cr.estado, cl.nombre AS cliente,
        JSON_ARRAYAGG(
            JSON_OBJECT('id_producto', p.id, 'producto', p.nombre, 'cantidad', dc.cantidad, 'precio_total', dc.precio_total)
        ) AS productos
        FROM compras_realizadas cr
        INNER JOIN carrito c ON cr.id_carrito = c.id
        INNER JOIN clientes cl ON c.id_cliente = cl.id
        INNER JOIN detalle_compra dc ON dc.id_compra = cr.id
        INNER JOIN productos p ON dc.id_producto = p.id
        GROUP BY cr.id, cr.id_carrito, cl.nombre, cr.referencia_pago, cr.fecha_compra, cr.estado
        ORDER BY cr.id DESC
`);
        res.json(resultado);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const getComprasId = async (req, res) => {
    try {
        const {id} = req.params;
        const [resultado] = await db.query(`SELECT cr.id AS id_compra, cr.id_carrito, cr.referencia_pago, cr.fecha_compra, cr.estado, cl.nombre AS cliente,
        JSON_ARRAYAGG(
            JSON_OBJECT('id_producto', p.id, 'producto', p.nombre, 'cantidad', dc.cantidad, 'precio_total', dc.precio_total)
        ) AS productos
        FROM compras_realizadas cr
        INNER JOIN carrito c ON cr.id_carrito = c.id
        INNER JOIN clientes cl ON c.id_cliente = cl.id
        INNER JOIN detalle_compra dc ON dc.id_compra = cr.id
        INNER JOIN productos p ON dc.id_producto = p.id
        WHERE cr.id = ?
        GROUP BY cr.id, cr.id_carrito, cl.nombre, cr.referencia_pago, cr.fecha_compra, cr.estado
    `, [id]);

        if(resultado.length === 0){
            return res.status(404).json({ error: "Compra no encontrada" });
        }

        res.json(resultado[0]);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const realizarCompra = async (req, res) => {
    try {
        const { id_carrito } = req.body;

        const [productosCarrito] = await db.query(`SELECT cp.id_producto, cp.cantidad, cp.precio_total, p.nombre, p.precio_unidad, p.unidades
        FROM carrito_producto cp
        INNER JOIN productos p ON cp.id_producto = p.id
        WHERE cp.id_carrito = ?
    `, [id_carrito]);

        if(productosCarrito.length === 0){
            return res.status(400).json({ error: "El carrito esta vacio"});
        }

        for(const p of productosCarrito){
            if(p.cantidad > p.unidades){
                return res.status(400).json({ error: `No hay unidades suficientes para ${p.nombre}`});
            }
        }

        const referenciaPago = `REF-${Date.now()}`;

        const [compra] = await db.query("INSERT INTO compras_realizadas (id_carrito, referencia_pago, fecha_compra, estado) VALUES (?, ?, NOW(), 'COMPLETADA')",
            [id_carrito, referenciaPago]
        );

        const id_compra = compra.insertId;

        for(const p of productosCarrito){
            await db.query("INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_total) VALUES (?, ?, ?, ?)",
                [id_compra, p.id_producto, p.cantidad, p.precio_total]
            );

            await db.query("UPDATE productos SET unidades = unidades - ? WHERE id = ?", 
                [p.cantidad, p.id_producto]
            );
        }

        await db.query("DELETE FROM carrito_producto WHERE id_carrito = ?", 
            [id_carrito]
        );

        res.json({ message: "Compra realizada con exito", id_compra, referenciaPago, estado: "PENDIENTE", productos: productosCarrito})

    } catch(error){
        return res.status(500).json({ error: error.message})
    }
};

export const actualizarEstadoCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ["PENDIENTE", "COMPLETADA", "CANCELADA"];

        if(!estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado no valido"})
        }

        const [resultado] = await db.query("UPDATE compras_realizadas SET estado = ? WHERE id = ?",
            [estado, id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Compra no encontrada"});
        }

        res.json({ message: "Estado actualizado", estado});

    } catch(error){
        return res.status(500).json({ error: error.message});
    }
};

export const eliminarCompra = async (req, res) => {
    try {
        const {id} = req.params;

        await db.query("DELETE FROM detalle_compra WHERE id_compra = ?", [id]);

        const [resultado] = await db.query("DELETE FROM compras_realizadas WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Compra no encontrada"});
        }

        res.json({ message: "Compra eliminada con exito"});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

