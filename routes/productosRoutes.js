import { Router } from "express";
import { getProductos, getProductosId, getProductosVendedor ,crearProductos, actualizarProductos, eliminarProductos, upload } from "../controllers/productos.controller.js";

const router = Router();

router.get("/", getProductos);
router.get("/:id", getProductosId);
router.get("/vendedor/:id", getProductosVendedor)
router.post("/", upload.single("imagen"), crearProductos);
router.put("/:id", upload.single("imagen"), actualizarProductos);
router.delete("/:id", eliminarProductos);

export default router;


