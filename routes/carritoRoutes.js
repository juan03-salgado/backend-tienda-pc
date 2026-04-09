import { Router } from "express";
import { getCarrito, getCarritoId, crearCarrito, actualizarCarrito, eliminarCarrito } from "../controllers/carrito.controller.js";

const router = Router();

router.get("/", getCarrito);
router.get("/:id", getCarritoId);
router.post("/", crearCarrito);
router.put("/:id", actualizarCarrito);
router.delete("/:id", eliminarCarrito);

export default router;
