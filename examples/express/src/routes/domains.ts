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
import { pickQuery, bodyOf } from "../util/params";

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
    res.json(
      await namecheap.domains.setContacts(
        bodyOf<DomainsSetContactsParams>(req, [
          "domainName",
          "registrant",
          "tech",
          "admin",
          "auxBilling",
        ]),
      ),
    );
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
    res.json(await namecheap.domains.check(bodyOf<DomainsCheckParams>(req, ["domainList"])));
  } catch (error) {
    next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    res.json(
      await namecheap.domains.create(
        bodyOf<DomainsCreateParams>(req, [
          "domainName",
          "years",
          "registrant",
          "tech",
          "admin",
          "auxBilling",
        ]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/reactivate", async (req, res, next) => {
  try {
    res.json(
      await namecheap.domains.reactivate(bodyOf<DomainsReactivateParams>(req, ["domainName"])),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/renew", async (req, res, next) => {
  try {
    res.json(
      await namecheap.domains.renew(bodyOf<DomainsRenewParams>(req, ["domainName", "years"])),
    );
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
    res.json(
      await namecheap.domains.setRegistrarLock(
        bodyOf<DomainsSetRegistrarLockParams>(req, ["domainName"]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
