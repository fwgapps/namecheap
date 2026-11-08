import { Router } from "express";
import namecheap from "../services/namecheap";
import { bodyNumber, bodyObject, bodyString, numericParam, pickQuery } from "../util/params";

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
    const whoisguardID = bodyNumber(req, "whoisguardID");
    res.json(await namecheap.whoisGuard.changeEmailAddress({ whoisguardID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "forwardedToEmail": "me@example.com" }
router.put("/enable/:id", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(req.params.id, "id");
    const forwardedToEmail = bodyString(req, "forwardedToEmail");
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

// Billed call. Body: { "years": 1, "promotionCode": "optional" }; years is required.
router.post("/renew/:id", async (req, res, next) => {
  try {
    const whoisguardID = numericParam(req.params.id, "id");
    const years = bodyNumber(req, "years");
    const promotionCode = bodyObject(req).promotionCode;
    res.json(
      await namecheap.whoisGuard.renew({
        whoisguardID,
        years,
        ...(typeof promotionCode === "string" && promotionCode !== "" ? { promotionCode } : {}),
      }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
