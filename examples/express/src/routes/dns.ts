import { Router } from "express";
import namecheap from "../services/namecheap";

const router = Router();

router.post("/default", async (req, res) => {
  try {
    const { sld, tld } = req.body;
    const response = await namecheap.domainsDns.setDefault(sld, tld);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/custom", async (req, res) => {
  try {
    const { sld, tld, nameservers } = req.body;
    const response = await namecheap.domainsDns.setCustom(sld, tld, nameservers);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { sld, tld } = req.query;

    if (typeof sld !== "string" || typeof tld !== "string") {
      res.status(400).json({ error: "Missing or invalid sld/tld parameters" });
      return;
    }

    const response = await namecheap.domainsDns.getList(sld, tld);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/hosts", async (req, res) => {
  try {
    const { sld, tld } = req.query;

    if (typeof sld !== "string" || typeof tld !== "string") {
      res.status(400).json({ error: "Missing or invalid sld/tld parameters" });
      return;
    }

    const response = await namecheap.domainsDns.getHosts(sld, tld);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/emailForwarding", async (req, res) => {
  try {
    const { domainName } = req.query;

    if (typeof domainName !== "string") {
      res.status(400).json({ error: "Missing or invalid domainName parameters" });
      return;
    }

    const response = await namecheap.domainsDns.getEmailForwarding(domainName);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/emailForwarding", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;

    const response = await namecheap.domainsDns.setEmailForwarding(domainName, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/hosts", async (req, res) => {
  try {
    const { sld, tld, ...params } = req.body;

    const response = await namecheap.domainsDns.setHosts(sld, tld, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
