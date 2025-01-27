const express = require("express");

const port: number = 3000;
const app = express();

app.get("/movies", (req: any, res: any) => {
  res.send("Listagem de filmes");
});

app.listen(port, () => {
  console.log(`Servidor sendo executando em http://localhost:${port}`);
});