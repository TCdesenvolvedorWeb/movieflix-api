const express = require("express");
import { PrismaClient } from "@prisma/client";

const port: number = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (req: any, res: any) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genres: true,
      languages: true,
    }
  });
  res.json(movies);
});

app.listen(port, () => {
  console.log(`Servidor sendo executando em http://localhost:${port}`);
});
