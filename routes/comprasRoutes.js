import { Router } from "express";
import { getCompras, getComprasId, getComprasCliente, getComprasVendedor, realizarCompra, eliminarCompra, actualizarEstadoCompra } from "../controllers/compras.controller.js";

const router = Router();

router.get("/", getCompras);
router.get("/:id", getComprasId);
router.get("/cliente/:id", getComprasCliente);
router.get("/vendedor/:id", getComprasVendedor);
router.post("/", realizarCompra);
router.put("/:id", actualizarEstadoCompra);
router.delete("/:id", eliminarCompra);

export default router;