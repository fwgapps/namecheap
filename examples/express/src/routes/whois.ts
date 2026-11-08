import { Router } from "express";
import namecheap from "../services/namecheap";
import { numericParam, pickQuery } from "../lib/params";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, ["listType"], ["page", "pageSize"]);
    res.json(await namecheap.whoisGuard.getList(params));
  } catch (error) {
    next(error);
  }
});

// Body: { "whoisguardID": 123 }
router.put("/email", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(String(req.body?.whoisguardID), "whoisguardID");
    res.json(await namecheap.whoisGuard.changeEmailAddress({ whoisguardID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "forwardedToEmail": "me@example.com" }
router.put("/enable/:id", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(req.params.id, "id");
    const forwardedToEmail = String(req.body?.forwardedToEmail ?? "");
    res.json(await namecheap.whoisGuard.enable({ whoisguardID, forwardedToEmail }));
  } catch (error) {
    next(error);
  }
});

router.delete("/disable/:id", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(req.params.id, "id");
    res.json(await namecheap.whoisGuard.disable({ whoisguardID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "years": 1, "promotionCode": "optional" }
router.post("/renew/:id", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(req.params.id, "id");
    const years = numericParam(String(req.body?.years ?? 1), "years");
    const promotionCode = req.body?.promotionCode;
    res.json(
      await namecheap.whoisGuard.renew({
        whoisguardID,
        years,
        ...(typeof promotionCode === "string" ? { promotionCode } : {}),
      }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
