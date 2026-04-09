import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
dotenv.config();
import usuariosRoutes from "./routes/usuariosRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import productosRoutes from "./routes/productosRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import carritoProductosRoutes from "./routes/carritoProductosRoutes.js";
import comprasRoutes from "./routes/comprasRoutes.js";
import incidenciasRoutes from "./routes/incidenciasRoutes.js";
import serviciosTecnicosRoutes from "./routes/serviciosTecnicosRoutes.js";

const app = express();

app.use(cors({
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

app.use("/usuarios", usuariosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/productos", productosRoutes);
app.use("/carrito", carritoRoutes);
app.use("/productosCarrito", carritoProductosRoutes);
app.use("/compras", comprasRoutes);
app.use("/incidencias", incidenciasRoutes);
app.use("/servicios", serviciosTecnicosRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

    