const express = require("express");
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

const port: number = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
//criamos um midlleware para poder servir o documento dentro de alguma rota da aplicação
app.use("/docs" , swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.put("/movies/:id", async (req: any, res: any) => {
  const id = Number(req.params.id);

  try{
  const movie = await prisma.movie.findUnique({ where: { id } });

  if (!movie) return res.status(404).send({message: `Filme não encontrado`})

  const data = {...req.body };
  data.release_date = data.realease_date ? new Date(data.release_date) : undefined;
  
  await prisma.movie.update({
    where: {
      id,
    },
    data: data
  });
  }catch(erro){
    return res.status(500).send({message: 'Falha ao atualizar o registro do Filme'})
  }

  res.status(200).send("Informação alterada com sucesso");
});

app.delete("/movies/:id" , async (req: any , res: any) => {
  const id = Number(req.params.id);
  
  try{
  const movie = await prisma.movie.findUnique({ where: { id }})

  if (!movie) return res.status(404).send({message: `Filme não encontrado`})

  await prisma.movie.delete({where: { id }});
  }catch(error){
    return res.status(500).send({message: `Não foi possível remover o filme.`})
  }

  res.status(200).send({message: `O filme foi de base`});
})

app.get("/movies/:genreName" , async (req: any , res: any) => {
  const genreName = String(req.params.genreName);

  try{
  const moviesFilteredByName = await prisma.movie.findMany({
    include:{
      genres: true,
      languages: true
    },
    where: {
      genres: {
        name: {
          equals: genreName,
          mode: "insensitive"
        }
      }
    }
  })

  res.status(200).send(moviesFilteredByName)

  }catch(error){
    return res.status(500).send({message: `Falha ao filtrar pelo gênero selecionado, tente novamente!`})
  }

})

app.listen(port, () => {
  console.log(`Servidor sendo executando em http://localhost:${port}`);
});
