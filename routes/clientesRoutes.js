import { Router } from "express";
import { getClientes, getClienteId, crearCliente, actualizarCliente, eliminarCliente } from "../controllers/clientes.controller.js";

const router = Router();

router.get("/", getClientes);
router.get("/:id", getClienteId);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

export default router;