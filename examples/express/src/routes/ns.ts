import { Router } from "express";
import type { NsCreateParams, NsUpdateParams } from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { requiredString } from "../lib/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.json(await namecheap.ns.create(req.body as NsCreateParams));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const sld = requiredString(req.query, "sld");
    const tld = requiredString(req.query, "tld");
    const nameserver = requiredString(req.query, "nameserver");
    res.json(await namecheap.ns.getInfo({ sld, tld, nameserver }));
  } catch (error) {
    next(error);
  }
});

// Body: { "sld", "tld", "nameserver", "oldIP", "ip" }
router.put("/", async (req, res, next) => {
  try {
    res.json(await namecheap.ns.update(req.body as NsUpdateParams));
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const sld = requiredString(req.query, "sld");
    const tld = requiredString(req.query, "tld");
    const nameserver = requiredString(req.query, "nameserver");
    res.json(await namecheap.ns.delete({ sld, tld, nameserver }));
  } catch (error) {
    next(error);
  }
});

export default router;
