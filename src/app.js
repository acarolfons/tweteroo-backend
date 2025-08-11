import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const userSchema = joi.object({
  username: joi.string().min(3).required(),
  avatar: joi.string().uri().required(),
});

const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required(),
});

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

const connectToDB = async () => {
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("Conexão com o MongoDB estabelecida com sucesso!");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err.message);
  }
};
connectToDB();

app.post("/sign-up", async (req, res) => {
  const { username, avatar } = req.body;

  const validation = userSchema.validate(
    { username, avatar },
    { abortEarly: false }
  );

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }
  try {
    const existingUser = await db.collection("users").findOne({ username });
    if (!existingUser) {
      await db.collection("users").insertOne({ username, avatar });
      return res.status(201).send("Usuário cadastrado com sucesso!");
    }
    // Caso o usuario ja exista, nao ha necessidade de criar um novo
    res.status(200).send("Bem-vindo de volta!");
  } catch (err) {
    res.status(500).send("Erro ao salvar usuário!");
    console.error(err);
  }
});

app.get("/tweets", async (req, res) => {
  try {
    // Ordena os tweets por ID decrescente para que os mais recentes apareçam primeiro.
    const tweets = await db
      .collection("tweets")
      .find()
      .sort({ _id: -1 })
      .toArray();

    const tweetsComAvatar = [];

    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      const user = await db
        .collection("users")
        .findOne({ username: tweet.username });

      tweetsComAvatar.push({
        _id: tweet._id,
        username: tweet.username,
        tweet: tweet.tweet,
        avatar: user ? user.avatar : null,
      });
    }

    res.json(tweetsComAvatar);
  } catch (err) {
    res.status(500).send("Erro ao buscar tweets.");
    console.error(err);
  }
});

app.delete("/tweets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db
      .collection("tweets")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send("Tweet não encontrado!");
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).send("Erro ao deletar tweet.");
    console.error(err);
  }
});

app.put("/tweets/:id", async (req, res) => {
  const { id } = req.params;
  const { username, tweet } = req.body;

  const validation = tweetSchema.validate(
    { username, tweet },
    { abortEarly: false }
  );

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }

  try {
    const result = await db
      .collection("tweets")
      .updateOne({ _id: new ObjectId(id) }, { $set: { username, tweet } });
    if (result.matchedCount === 0) {
      return res.status(404).send("Tweet não encontrado.");
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).send("Erro ao atualizar tweet.");
    console.error(err);
  }
});

app.post("/tweets", async (req, res) => {
  const { tweet, username } = req.body;

  const validation = tweetSchema.validate(
    { username, tweet },
    { abortEarly: false }
  );

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }

  try {
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(401).send("Usuário não encontrado.");
    }

    await db.collection("tweets").insertOne({ tweet, username });
    res.status(201).send("Tweet criado com sucesso!");
  } catch (err) {
    res.status(500).send("Erro ao enviar tweet.");
    console.error(err);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 5000}`);
});