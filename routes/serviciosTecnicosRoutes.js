import { Router } from "express";
import { getServicios, getServicioId, getServiciosUsuario, getServiciosVendedor, crearServicio, actualizarEstadoServicio, eliminarServicio } from "../controllers/servicios.tecnicos.controller.js";

const router = Router();

router.get("/", getServicios);
router.get("/cliente/:id", getServiciosUsuario);
router.get("/vendedor/:id", getServiciosVendedor);
router.get("/:id", getServicioId);
router.post("/", crearServicio);
router.put("/:id", actualizarEstadoServicio);
router.delete("/:id", eliminarServicio);

export default router;

