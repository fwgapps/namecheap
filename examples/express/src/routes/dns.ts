import { Router } from "express";
import type {
  DnsSetCustomParams,
  DnsSetDefaultParams,
  DnsSetEmailForwardingParams,
  DnsSetHostsParams,
} from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { requiredString } from "../lib/params";

const router = Router();

router.post("/default", async (req, res, next) => {
  try {
    res.json(await namecheap.dns.setDefault(req.body as DnsSetDefaultParams));
  } catch (error) {
    next(error);
  }
});

// Body: { "sld", "tld", "nameservers": "ns1.example.com,ns2.example.com" }
router.post("/custom", async (req, res, next) => {
  try {
    res.json(await namecheap.dns.setCustom(req.body as DnsSetCustomParams));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const sld = requiredString(req.query, "sld");
    const tld = requiredString(req.query, "tld");
    res.json(await namecheap.dns.getList({ sld, tld }));
  } catch (error) {
    next(error);
  }
});

router.get("/hosts", async (req, res, next) => {
  try {
    const sld = requiredString(req.query, "sld");
    const tld = requiredString(req.query, "tld");
    res.json(await namecheap.dns.getHosts({ sld, tld }));
  } catch (error) {
    next(error);
  }
});

// Replaces the whole zone: records that are not listed are deleted.
router.post("/hosts", async (req, res, next) => {
  try {
    res.json(await namecheap.dns.setHosts(req.body as DnsSetHostsParams));
  } catch (error) {
    next(error);
  }
});

router.get("/emailForwarding", async (req, res, next) => {
  try {
    const domainName = requiredString(req.query, "domainName");
    res.json(await namecheap.dns.getEmailForwarding({ domainName }));
  } catch (error) {
    next(error);
  }
});

// Body: { "domainName", "forwards": [{ "mailBox", "forwardTo" }] }
router.post("/emailForwarding", async (req, res, next) => {
  try {
    res.json(await namecheap.dns.setEmailForwarding(req.body as DnsSetEmailForwardingParams));
  } catch (error) {
    next(error);
  }
});

export default router;
