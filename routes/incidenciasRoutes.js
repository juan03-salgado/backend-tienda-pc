import { Router } from "express";
import { getIncidencias, getIncidenciaId, añadirIncidencia, actualizarEstadoIncidencia, eliminarIncidencia } from "../controllers/incidencias.controller.js";

const router = Router();

router.get("/", getIncidencias);
router.get("/:id", getIncidenciaId);
router.post("/", añadirIncidencia);
router.put("/:id", actualizarEstadoIncidencia);
router.delete("/:id", eliminarIncidencia);

export default router;