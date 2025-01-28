const express = require("express");
import { PrismaClient } from "@prisma/client";

const port: number = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_: any, res: any) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genres: true,
      languages: true,
    },
  });
  res.json(movies);
});

app.post("/movies", async (req: any, res: any) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  try {
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });

    if (movieWithSameTitle) {
      return res
        .status(409)
        .send(`Já existe um filme cadastrado com este título.`);
    }

    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        realese_date: new Date(release_date),
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Falha ao cadastrar um filme." });
  }

  res.status(201).send();
});

app.listen(port, () => {
  console.log(`Servidor sendo executando em http://localhost:${port}`);
});
