import express from 'express';
import cors from 'cors';
import { validarArticulo, validarParcial } from './helpers/zod.js';
import { clientes } from './datos/persona.js';

const app = express();
const PORT = process.env.PORT || 3001; // Cambia a 3001 u otro puerto disponible

// Configuración explícita de CORS
app.use(cors({
  origin: 'https://correccion-prueba-frontend.vercel.app'
}));
app.use(express.json());

// Array para almacenar items en memoria
let items = [];
let nextId = 1;

const calcularCostoSeguro = (datos) => {
  const costoBase = datos.seguro === 'A' ? 1200 : 950;
  let costoTotal = costoBase;

  // Cargos adicionales
  if (datos.alcolico === 'si') costoTotal += costoBase * 0.10;
  if (datos.lentes === 'si') costoTotal += costoBase * 0.05;
  if (datos.enfermedad === 'si') costoTotal += costoBase * 0.05;
  
  // Cargo por edad
  if (parseInt(datos.edad) > 40) {
    costoTotal += costoBase * 0.20;
  } else {
    costoTotal += costoBase * 0.10;
  }

  return costoTotal;
};

// Inicializar items con datos de clientes
items = clientes.map(cliente => ({
    ...cliente,
    costoTotal: calcularCostoSeguro(cliente)
}));
// Calcular nextId en función del máximo ID en persona.js y asignarlo +1
nextId = Math.max(...items.map(item => Number(item.id))) + 1;
console.log(`Se asignará el siguiente ID: ${nextId}`);

app.get('/api/items', (req, res) => {
  try {
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const validacion = validarArticulo(req.body);
    if (!validacion.success) {
      return res.status(400).json({ error: validacion.error });
    }
    
    const costoCalculado = calcularCostoSeguro(validacion.data);
    const nuevoItem = {
      id: String(nextId++),
      ...validacion.data,
      costoTotal: costoCalculado
    };
    items.push(nuevoItem);
    res.status(201).json(nuevoItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/items/buscar', (req, res) => {
  try {
    const termino = req.query.termino?.toLowerCase() || '';
    // Si el término es numérico, buscar coincidencia exacta en id; de lo contrario, búsqueda parcial en los demás campos
    const itemsFiltrados = !isNaN(termino)
      ? items.filter(item => item.id === termino)
      : items.filter(item => 
          item.nombre.toLowerCase().includes(termino) ||
          item.edad.toString().includes(termino) ||
          item.seguro.toLowerCase().includes(termino) ||
          item.alcolico.toLowerCase().includes(termino) ||
          item.lentes.toLowerCase().includes(termino) ||
          item.enfermedad.toLowerCase().includes(termino)
        );
    res.json(itemsFiltrados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.route('/api/items/:id')
  .get((req, res) => {
    try {
      const item = items.find(item => item.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Item no encontrado' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  .put((req, res) => {
    try {
      const validacion = validarParcial(req.body);
      if (!validacion.success) {
        return res.status(400).json({ error: validacion.error });
      }

      const index = items.findIndex(item => item.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Item no encontrado' });
      
      const itemActualizado = { ...items[index], ...validacion.data };
      itemActualizado.costoTotal = calcularCostoSeguro(itemActualizado);
      items[index] = itemActualizado;
      res.json(itemActualizado);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  })
  .delete((req, res) => {
    try {
      const index = items.findIndex(item => item.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Item no encontrado' });
      
      items.splice(index, 1);
      res.json({ mensaje: 'Item eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});