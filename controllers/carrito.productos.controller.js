import db from "../db.js";

export const getCarritoProducto = async (req, res) => {
    try{
        const [resultado] = await db.query(`SELECT c.id, c.cantidad, c.precio_total, c.id_carrito,
        JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'precio_unidad', p.precio_unidad, 'unidades', p.unidades, 
        'categoria', JSON_OBJECT('id', p.id_categoria, 'nombre', cat.nombre)
        ) AS producto
        FROM carrito_producto c
        INNER JOIN productos p ON c.id_producto = p.id
        LEFT JOIN categorias cat ON p.id_categoria = cat.id
    `);
        res.json(resultado);

    } catch(error){
        return res.status(500).json({ error: error.message });        
    }
};

export const getCarritoProductoId = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query(`SELECT c.id, c.cantidad, c.precio_total, c.id_carrito,
            JSON_OBJECT('id', p.id, 'nombre', p.nombre, 'precio_unidad', p.precio_unidad, 'id_categoria', p.id_categoria, 'categoria_nombre', cat.nombre, 'unidades', p.unidades)
            ) AS producto
            FROM carrito_producto c
            INNER JOIN productos p ON c.id_producto = p.id
            LEFT JOIN categorias cat ON p.id_categoria = cat.id
            WHERE c.id = ?`, 
            [id]
        );

        if(resultado.length === 0){
            return res.status(404).json({ error: "Producto en carrito no encontrado "});
        }
        res.json(resultado[0]);

    } catch(error){
        return res.status(500).json({ error: error.message });
    }
};

export const añadirProductoCarrito = async (req, res) => {
    try {
        const { id_producto, cantidad, id_carrito } = req.body;

        if(!cantidad || cantidad <= 0){
            return res.status(400).json({ error: "Cantidad invalida"})
        }

        const [existe] = await db.query("SELECT * FROM carrito_producto WHERE id_producto = ? AND id_carrito = ?",
            [id_producto, id_carrito]
        );

        const [producto] = await db.query("SELECT precio_unidad, unidades FROM productos WHERE id = ?", 
            [id_producto]
        );

        if(producto.length === 0){
            return res.status(404).json({ error: "Producto no encontrado"});
        }
        
        const [carrito] = await db.query("SELECT id FROM carrito WHERE id = ?",
            [id_carrito]
        );

        if (carrito.length === 0) {
            return res.status(404).json({ error: "Carrito no existe" });
        }

        if(producto[0].unidades < cantidad){
            return res.status(400).json({ error: "No hay suficientes unidades disponibles"})
        }

        //Aqui calculamos el precio total de la nueva cantidad
        const precio_unidad = producto[0].precio_unidad;

        //En caso de que el producto exista en el carrito, actualizamos precio_total y cantidad
        if(existe.length > 0){
            const nuevaCantidad = existe[0].cantidad + cantidad;
            const nuevo_precio = nuevaCantidad * precio_unidad;

            await db.query("UPDATE carrito_producto SET cantidad = ?, precio_total = ? WHERE id = ?",
               [nuevaCantidad, nuevo_precio, existe[0].id] 
            );

            return res.json({ message: "Producto existente en el carrito ha sido actualizado", id_producto, nuevaCantidad, nuevo_precio});
        
        } else {
            const precio_total = precio_unidad * cantidad;
            const [resultado] = await db.query("INSERT INTO carrito_producto (id_producto, cantidad, precio_total, id_carrito) VALUES (?, ?, ?, ?)",
                [id_producto, cantidad, precio_total, id_carrito]
            );

            return res.json({ id: resultado.insertId, id_producto, cantidad, precio_total, id_carrito, message: "Producto agregado al carrito"});
        }

    } catch(error) {
        res.status(500).json({ error: "Error al añadir al carrito"});
    }
};

export const actualizarCarritoProductos = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_producto, cantidad, id_carrito } = req.body;

        const [producto] = await db.query("SELECT precio_unidad FROM productos WHERE id = ?",
            [id_producto]
        );

        if(producto.length === 0){
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const precio_total = producto[0].precio_unidad * cantidad;

        const [resultado] = await db.query("UPDATE carrito_producto SET id_producto = ?, cantidad = ?, precio_total = ?, id_carrito = ? WHERE id = ?",
            [id_producto, cantidad, precio_total, id_carrito, id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Producto en carrito no encontrado"});
        }

        res.json({id_producto, cantidad, precio_total, id_carrito});

    } catch(error) {
        res.status(500).json({ error: "Error al actualizar el carrito"});   
    }
};

export const eliminarCarritoProductos = async (req, res) => {
    try {
        const { id } = req.params;

        const [productoCarrito] = await db.query("SELECT * FROM carrito_producto WHERE id = ?",
            [id]
        );

        if (productoCarrito.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }

        const item = productoCarrito[0];

        const [producto] = await db.query("SELECT unidades FROM productos WHERE id = ?",
            [item.id_producto]
        );

        if(producto.length === 0){
            return res.status(404).json({ error: "Producto no encontrado"});
        }

        const [resultado] = await db.query("DELETE FROM carrito_producto WHERE id = ?",
            [id]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Carrito no encontrado"})
        }

        res.json({ message: "Producto eliminado del carrito" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};