import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

const uri = process.env.MONGO_URI; // Usa la variable de entorno configurada en Render

const client = new MongoClient(uri);
let coleccion;

async function conectarDB() {
  try {
    await client.connect();
    const db = client.db("paecdiego"); // Cambia por el nombre de tu base
    coleccion = db.collection("residuos"); // Cambia por el nombre de tu colección
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
}
conectarDB();

// Alta
app.post("/alta", async (req, res) => {
  try {
    await coleccion.insertOne(req.body);
    res.redirect("/index.html");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al dar de alta");
  }
});

// Baja
app.post("/baja", async (req, res) => {
  try {
    await coleccion.deleteOne({ id_residuo: req.body.id_residuo });
    res.redirect("/index.html");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al dar de baja");
  }
});

// Actualizar
app.post("/actualizar", async (req, res) => {
  try {
    const id = req.body.id_residuo;
    const campo = req.body.campo;
    let valor = req.body.valor;

    if (!id || !campo || valor === undefined) {
      return res.status(400).send("Faltan datos para actualizar");
    }

    if (campo === "cantidad") {
      valor = parseFloat(valor);
      if (isNaN(valor)) {
        return res.status(400).send("Cantidad inválida");
      }
    }

    await coleccion.updateOne({ id_residuo: id }, { $set: { [campo]: valor } });

    res.redirect("/index.html");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar");
  }
});

// Visualizar
app.get("/api/residuos", async (req, res) => {
  try {
    const datos = await coleccion.find().toArray();
    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener datos");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

