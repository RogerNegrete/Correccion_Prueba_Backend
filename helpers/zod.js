import { z } from "zod";

export const validarArticulo = (data) => {
  const schema = z.object({
    id: z.string().optional(),
    nombre: z.string(),
    edad: z.string(),
    seguro: z.string(),
    alcolico: z.string(),
    lentes: z.string(),
    enfermedad: z.string()
  });

  return schema.safeParse(data);
};

export const validarParcial = (data) => {
  const schema = z.object({
    nombre: z.string().optional(),
    edad: z.string().optional(),
    seguro: z.string().optional(),
    alcolico: z.string().optional(),
    lentes: z.string().optional(),
    enfermedad: z.string().optional()
  });

  return schema.safeParse(data);
};

export const validarUsuario = (usuario) => usuarioSchema.safeParse(usuario);
export const validarCliente = (cliente) => clienteSchema.safeParse(cliente);
