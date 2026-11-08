import { Router } from "express";
import type {
  DomainsCheckParams,
  DomainsCreateParams,
  DomainsReactivateParams,
  DomainsRenewParams,
  DomainsSetContactsParams,
  DomainsSetRegistrarLockParams,
} from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { pickQuery } from "../lib/params";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, ["listType", "searchTerm", "sortBy"], ["page", "pageSize"]);
    res.json(await namecheap.domains.getList(params));
  } catch (error) {
    next(error);
  }
});

router.get("/tld", async (_req, res, next) => {
  try {
    res.json(await namecheap.domains.getTldList());
  } catch (error) {
    next(error);
  }
});

router.get("/contacts/:domainName", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.getContacts({ domainName: req.params.domainName }));
  } catch (error) {
    next(error);
  }
});

router.post("/contacts", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.setContacts(req.body as DomainsSetContactsParams));
  } catch (error) {
    next(error);
  }
});

router.get("/info/:domainName", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, ["hostName"]);
    res.json(await namecheap.domains.getInfo({ domainName: req.params.domainName, ...params }));
  } catch (error) {
    next(error);
  }
});

// Body: { "domainList": "example.com,example.net" }
router.post("/check", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.check(req.body as DomainsCheckParams));
  } catch (error) {
    next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.create(req.body as DomainsCreateParams));
  } catch (error) {
    next(error);
  }
});

router.post("/reactivate", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.reactivate(req.body as DomainsReactivateParams));
  } catch (error) {
    next(error);
  }
});

router.post("/renew", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.renew(req.body as DomainsRenewParams));
  } catch (error) {
    next(error);
  }
});

router.get("/registrarLock/:domainName", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.getRegistrarLock({ domainName: req.params.domainName }));
  } catch (error) {
    next(error);
  }
});

router.post("/registrarLock", async (req, res, next) => {
  try {
    res.json(await namecheap.domains.setRegistrarLock(req.body as DomainsSetRegistrarLockParams));
  } catch (error) {
    next(error);
  }
});

export default router;
