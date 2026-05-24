import { Router } from "express";
import { getNotificacionesUsuario, contarNoLeidas, marcarLeido, eliminarNotificacion} from "../controllers/notificaciones.controller.js";

const router = Router();

router.get("/usuario/:id", getNotificacionesUsuario);
router.get("/contador/:id", contarNoLeidas);
router.put("/leida/:id", marcarLeido);
router.delete("/:id", eliminarNotificacion);

export default router;