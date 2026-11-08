import { Router } from "express";
import type {
  UsersChangePasswordParams,
  UsersCreateAddFundsRequestParams,
  UsersCreateParams,
  UsersLoginParams,
  UsersResetPasswordParams,
  UsersUpdateParams,
} from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { pickQuery, requiredString } from "../lib/params";

const router = Router();

router.get("/balances", async (_req, res, next) => {
  try {
    res.json(await namecheap.users.getBalances());
  } catch (error) {
    next(error);
  }
});

router.get("/pricing/:productType", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, [
      "productCategory",
      "promotionCode",
      "actionName",
      "productName",
    ]);
    res.json(await namecheap.users.getPricing({ ...params, productType: req.params.productType }));
  } catch (error) {
    next(error);
  }
});

router.get("/addFundsStatus/:tokenId", async (req, res, next) => {
  try {
    res.json(await namecheap.users.getAddFundsStatus({ tokenId: req.params.tokenId }));
  } catch (error) {
    next(error);
  }
});

// Body: { "paymentType": "Creditcard", "amount": 10, "returnUrl": "https://..." }
router.post("/addFundsRequest", async (req, res, next) => {
  try {
    res.json(
      await namecheap.users.createAddFundsRequest(req.body as UsersCreateAddFundsRequestParams),
    );
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    res.json(await namecheap.users.update(req.body as UsersUpdateParams));
  } catch (error) {
    next(error);
  }
});

// Secrets (passwords, reset codes) are accepted in the JSON body only, never in the query string.
// Body: { "oldPassword", "newPassword" } or { "resetCode", "newPassword" }
router.put("/password", async (req, res, next) => {
  try {
    res.json(await namecheap.users.changePassword(req.body as UsersChangePasswordParams));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.json(await namecheap.users.create(req.body as UsersCreateParams));
  } catch (error) {
    next(error);
  }
});

// Body: { "password" }
router.post("/login", async (req, res, next) => {
  try {
    res.json(await namecheap.users.login(req.body as UsersLoginParams));
  } catch (error) {
    next(error);
  }
});

router.post("/resetPassword", async (req, res, next) => {
  try {
    res.json(await namecheap.users.resetPassword(req.body as UsersResetPasswordParams));
  } catch (error) {
    next(error);
  }
});

export default router;
