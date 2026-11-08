import express from "express";
import domainsRouter from "./routes/domains";
import dnsRouter from "./routes/dns";
import nsRouter from "./routes/ns";
import sslRouter from "./routes/ssl";
import transferRouter from "./routes/transfer";
import usersRouter from "./routes/users";
import usersAddressRouter from "./routes/userAddress";
import whoisRouter from "./routes/whois";
import { errorHandler, notFound } from "./middleware/errors";

const app = express();
app.use(express.json());

app.use("/domains", domainsRouter);
app.use("/dns", dnsRouter);
app.use("/ns", nsRouter);
app.use("/transfer", transferRouter);
app.use("/ssl", sslRouter);
app.use("/users", usersRouter);
app.use("/usersAddress", usersAddressRouter);
app.use("/whois", whoisRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
// The example has no authentication: listen on the loopback interface only. Set HOST to
// expose it deliberately (for example behind your own authenticating proxy).
const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`Namecheap API example running in: http://${HOST}:${PORT}`);
});
