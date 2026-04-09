import db from '../db.js';

export const getUsuarios = async(req, res) => {
    try {
        const [resultado] = await db.query('SELECT * FROM usuarios');
        res.json(resultado);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
};

export const getUsuariosId = async(req, res) => {
    try {
        const {id} = req.params;
        const [resultado] = await db.query('SELECT * FROM usuarios WHERE id = ?', 
        [id]
    );
        if(resultado.length === 0){
            return res.status(404).json({error: "Usuario no encontrado"});
        }
        res.json(resultado[0]);

    } catch(error) {
        res.status(500).json({error: error.message})
    }
};

export const crearUsuario = async(req, res) => {
    try{
        const { nombre_user, email, contrasena, id_rol } = req.body;

        if(!nombre_user || !email || !contrasena){
            return res.status(400).json({error: "Faltan campos requeridos"});
        }

        const [resultado] = await db.query("INSERT INTO usuarios (nombre_user, email, contrasena, id_rol) VALUES (?, ?, ?, ?)", 
            [nombre_user, email, contrasena, id_rol || 3]            
        );

        const usuarioId = resultado.insertId;

        const [cliente] = await db.query("INSERT INTO clientes (nombre, direccion, telefono, id_user) VALUES (?, ?, ?, ?)",
            [nombre_user, "", "", usuarioId]            
        );

        const clienteId = cliente.insertId;
        await db.query("INSERT INTO carrito (id_cliente) VALUES (?)", 
            [clienteId]
        );

        return res.json({ id: resultado.insertId, nombre_user, email, contrasena, id_rol: id_rol || 3, clienteId});

    } catch(error){
        res.status(500).json({error: error.message});   
    }
};

export const actualizarUsuario = async(req, res) => {
    try{
        const {id} = req.params;
        const { nombre_user, email, contrasena, id_rol } = req.body;

        const [usuarioActual] = await db.query("SELECT * FROM usuarios WHERE id = ?",
            [id]
        );

        const usuario = usuarioActual[0];
        const nuevaContrasena = contrasena && contrasena.trim() !== "" ? contrasena : usuario.contrasena;

        const [resultado] = await db.query("UPDATE usuarios SET nombre_user = ?, email = ?, contrasena = ?, id_rol = ? WHERE id = ?", 
           [nombre_user, email, nuevaContrasena, id_rol, id] 
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Usuario no encontrado"})
        }
        res.json({id, nombre_user, email, contrasena: nuevaContrasena, id_rol})

    } catch(error){
        res.status(500).json({error: error.message});
    }
};

export const eliminarUsuario = async(req, res) => {
    try{
        const { id } = req.params;
        
        const [clientes] = await db.query("SELECT id FROM clientes WHERE id_user = ?", [id]);
        const clienteId = clientes.length > 0 ? clientes[0].id : null

        if(clienteId){
            await db.query(`DELETE dc FROM detalle_compra dc INNER JOIN compras_realizadas cr ON dc.id_compra = cr.id
            INNER JOIN carrito c ON cr.id_carrito = c.id WHERE c.id_cliente = ?`, [clienteId]);
        
            await db.query(`DELETE cr FROM compras_realizadas cr INNER JOIN carrito c ON cr.id_carrito = c.id WHERE c.id_cliente = ?`,
                [clienteId]                
            );

            await db.query(`DELETE FROM carrito_producto WHERE id_carrito IN (SELECT id FROM carrito WHERE id_cliente = ?)`, 
                [clienteId]
            );

            await db.query("DELETE FROM carrito WHERE id_cliente = ?", [clienteId]);

            await db.query("DELETE FROM clientes WHERE id = ?", [clienteId]);
        }

        const [resultado] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: "Usuario no encontrado"});
        }

        res.json({ message: "Usuario y cliente eliminados correctamente"});

    } catch(error){
        res.status(500).json({ error: error.message }); 
    }
};

export const loginUsuario = async(req, res) => {
    try {
        const {nombre_user, contrasena} = req.body;

        if(!nombre_user || !contrasena){
            return res.status(400).json({error: "Faltan credenciales"})
        }

        if(nombre_user === "User_admin" && contrasena === "Secret_password"){
            return res.status(200).json({
              message: "Login exitoso",
              usuario: {
                id: 1,
                nombre_user: nombre_user,
                contrasena: contrasena,
                email: "admin@gmail.com",
                id_rol: 1
              } 
            })
        };

        const [resultado] = await db.query("SELECT * FROM usuarios WHERE nombre_user = ? AND contrasena = ?",
            [nombre_user, contrasena]
        );

        if(resultado.length === 0){
            return res.status(404).json({ error: "El usuario no existe"})
        }

        const usuario = resultado[0];

        if(usuario.id_rol === 3){
            const [cliente] = await db.query("SELECT id FROM clientes WHERE id_user = ?", 
               [usuario.id] 
            );

            const clienteId = cliente.length > 0 ? cliente[0].id: null;

            if(clienteId){
                const [carrito] = await db.query("SELECT id FROM carrito WHERE id_cliente = ?", 
                    [clienteId]
                );
                usuario.id_carrito = carrito.length > 0 ? carrito[0].id : null;
            } else {
                usuario.id_carrito = null;
            }
        }

        res.json({ message: "Login exitoso", usuario});
        
    } catch(error){
        res.status(500).json({ error: error.message });
    }
}

