import { Router } from "express";
import namecheap from "../services/namecheap";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { sld, tld, nameserver, ip } = req.body;
    const response = await namecheap.domainsNs.create(sld, tld, nameserver, ip);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { sld, tld, nameserver } = req.query;

    if (typeof sld !== "string" || typeof tld !== "string" || typeof nameserver !== "string") {
      res.status(400).json({ error: "Missing or invalid sld/tld/nameserver parameters" });
      return;
    }

    const response = await namecheap.domainsNs.delete(sld, tld, nameserver);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { sld, tld, nameserver } = req.query;

    if (typeof sld !== "string" || typeof tld !== "string" || typeof nameserver !== "string") {
      res.status(400).json({ error: "Missing or invalid sld/tld/nameserver parameters" });
      return;
    }

    const response = await namecheap.domainsNs.getInfo(sld, tld, nameserver);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { sld, tld, nameserver, ip, oldIp } = req.body;

    const response = await namecheap.domainsNs.update(sld, tld, nameserver, ip, oldIp);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
