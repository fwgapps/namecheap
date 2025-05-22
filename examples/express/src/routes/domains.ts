import { Router } from "express";
import namecheap from "../services/namecheap";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const response = await namecheap.domains.getList();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/contacts/:domainName", async (req, res) => {
  try {
    const response = await namecheap.domains.getContacts(req.params.domainName);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;
    const response = await namecheap.domains.create(domainName, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/tld", async (req, res) => {
  try {
    const response = await namecheap.domains.getTldList();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;
    const response = await namecheap.domains.setContacts(domainName, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/check", async (req, res) => {
  try {
    const { domains } = req.body;
    const response = await namecheap.domains.check(domains);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/reactivate", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;
    const response = await namecheap.domains.reactivate(domainName, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/renew", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;
    const response = await namecheap.domains.renew(domainName, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/registrarLock/:domainName", async (req, res) => {
  try {
    const response = await namecheap.domains.getRegistrarLock(req.params.domainName);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/registrarLock", async (req, res) => {
  try {
    const { domainName, ...params } = req.body;
    const response = await namecheap.domains.setRegistrarLock(domainName, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/info/:domainName", async (req, res) => {
  try {
    const domain = req.params.domainName;
    const hostName = req.query.hostname as string | undefined;

    const response = await namecheap.domains.getInfo(domain, { hostName });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
