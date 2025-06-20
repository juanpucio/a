import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

// Conexión MongoDB
const uri = "mongodb+srv://juanpa:juan@cluster0.xsmb3yf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let coleccion;

async function conectarDB() {
  try {
    await client.connect();
    const db = client.db("paecdiego");
    coleccion = db.collection("residuos");
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
}
conectarDB();

// Alta
app.post("/alta", async (req, res) => {
  await coleccion.insertOne(req.body);
  res.redirect("/index.html");
});

// Baja por ID
app.post("/baja", async (req, res) => {
  await coleccion.deleteOne({ id_residuo: req.body.id_residuo });
  res.redirect("/index.html");
});

// Actualizar
app.post("/actualizar", async (req, res) => {
  const id = req.body.id_residuo;
  const campo = req.body.campo;

  let nuevosDatos = {};

  if (campo === "todo") {
    nuevosDatos = {
      tipo: req.body.tipo,
      cantidad: req.body.cantidad,
      responsable: req.body.responsable,
      ubicacion: req.body.ubicacion,
      fecha: req.body.fecha,
      estado: req.body.estado,
    };
  } else {
    nuevosDatos[campo] = campo === "cantidad" ? parseFloat(req.body.valor) : req.body.valor;
  }

  await coleccion.updateOne({ id_residuo: id }, { $set: nuevosDatos });
  res.redirect("/index.html");
});

// Visualizar (API)
app.get("/api/residuos", async (req, res) => {
  const datos = await coleccion.find().toArray();
  res.json(datos);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
