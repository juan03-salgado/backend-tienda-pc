import { Router } from "express";
import { getCarritoProducto, getCarritoProductoId, añadirProductoCarrito, actualizarCarritoProductos, eliminarCarritoProductos } from "../controllers/carrito.productos.controller.js";

const router = Router();

router.get("/", getCarritoProducto);
router.get("/:id", getCarritoProductoId);
router.post("/", añadirProductoCarrito);
router.put("/:id", actualizarCarritoProductos);
router.delete("/:id", eliminarCarritoProductos);

export default router;
