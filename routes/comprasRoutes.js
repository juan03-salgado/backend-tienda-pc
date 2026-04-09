import { Router } from "express";
import { getCompras, getComprasId, realizarCompra, eliminarCompra, actualizarEstadoCompra } from "../controllers/compras.controller.js";

const router = Router();

router.get("/", getCompras);
router.get("/:id", getComprasId);
router.post("/", realizarCompra);
router.put("/:id", actualizarEstadoCompra);
router.delete("/:id", eliminarCompra);

export default router;