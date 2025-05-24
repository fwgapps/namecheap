import express from "express";
import domainsRouter from "./routes/domains";
import dnsRouter from "./routes/dns";
import nsRouter from "./routes/ns";
import sslRouter from "./routes/ns";
import transferRouter from "./routes/ssl";
import usersRouter from "./routes/users";
import usersAddressRouter from "./routes/userAddress";
import whoisRouter from "./routes/whois";

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Namecheap API example running in: http://localhost:${PORT}`);
});
