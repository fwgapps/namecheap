import express from "express";
import domainsRouter from "./routes/domains";

const app = express();
app.use(express.json());

app.use("/domains", domainsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Namecheap API example running in: http://localhost:${PORT}`);
});
