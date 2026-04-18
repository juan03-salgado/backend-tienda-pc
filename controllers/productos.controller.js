import db from "../db.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

export const upload = multer({ storage });
const base_url = process.env.BASE_URL || "http://10.0.2.2:3000";

const urlImagen = (archivo) => {
    return archivo ? `${base_url}/uploads/${archivo}` : null;
};

const formatoProducto = (p) => ({
    ...p, imagenUrl: urlImagen(p.imagen), imagen: p.imagen
});

export const getProductos = async (req, res) => {
    try {
        const [resultado] = await db.query(`SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id`
    );
        const productos = resultado.map(formatoProducto);
        res.json(productos);

    } catch(error) {
        return res.status(500).json({ error: error.message });
    }  
};

export const getProductosId = async (req, res) => {
    try {
        const {id} = req.params;
        const [resultado] = await db.query(`SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        WHERE p.id = ?`, 
            [id]
        );

        if(resultado.length === 0){
            return res.status(404).json({ error: "Producto no encontrado"})
        };

        const producto = formatoProducto(resultado[0]);
        res.json(producto)
        
    } catch(error) {
        res.status(500).json({ error: error.message})
    }
};

export const crearProductos = async (req, res) => {
    try {
        const { nombre, descripcion, id_categoria, precio_unidad, unidades } = req.body;
        const imagen = req.file ? req.file.filename : null;

        if(!nombre || precio_unidad == null || unidades == null){
            return res.status(400).json({error: "Faltan campos requeridos"});
        }

        const [resultado] = await db.query("INSERT INTO productos (nombre, descripcion, id_categoria, precio_unidad, unidades, imagen) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, descripcion, id_categoria, precio_unidad, unidades, imagen]
        );

        res.json({id: resultado.insertId, nombre, descripcion, id_categoria, precio_unidad, unidades, imagen: urlImagen(imagen)});

    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

export const actualizarProductos = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, id_categoria, precio_unidad, unidades } = req.body;

        const [productoActual] = await db.query("SELECT * FROM productos WHERE id = ?",
            [id]
        );

        if(productoActual.length === 0){
            return res.status(404).json({ error: "Producto no encontrado"})
        };

        const producto = productoActual[0];
        let nuevaImagen = producto.imagen;

        if(req.file){
            nuevaImagen = req.file.filename;

            if(producto.imagen){
                const rutaVieja = path.join(process.cwd(), "uploads", producto.imagen);

                if(fs.existsSync(rutaVieja)){
                    fs.unlinkSync(rutaVieja);
                }
            }
        }

        await db.query("UPDATE productos SET nombre = ?, descripcion = ?, id_categoria = ?, precio_unidad = ?, unidades = ?, imagen = ? WHERE id = ?", 
            [nombre || producto.nombre, 
            descripcion || producto.descripcion, 
            id_categoria || producto.id_categoria, 
            precio_unidad ?? producto.precio_unidad,
            unidades ?? producto.unidades,
            nuevaImagen,
            id]
        );

        res.json({id, nombre, descripcion, id_categoria, precio_unidad, unidades, imagen: urlImagen(nuevaImagen)});

    } catch(error){
        res.status(500).json({ error: error.message });        
    }
};

export const eliminarProductos = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [producto] = await db.query("SELECT imagen FROM productos WHERE id = ?", 
            [id]
        );

        if(producto.length === 0){
            return res.status(404).json({ error: "Producto no encontrado"})
        };

        const imagen = producto[0].imagen;

        await db.query("DELETE FROM productos WHERE id = ?", [id]);

        if(imagen){
            const ruta = path.join(process.cwd(), "uploads", imagen);

            if(fs.existsSync(ruta)){
                fs.unlinkSync(ruta);
            }
        }

        res.json({message: "Producto eliminado con exito"});

    } catch(error) {
        res.status(500).json({error: error.message});        
    }
}