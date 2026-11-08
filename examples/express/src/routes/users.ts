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
import { BadRequestError } from "../middleware/errors";
import { bodyOf, bodyString, optionalBodyString, pickQuery } from "../util/params";

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
      await namecheap.users.createAddFundsRequest(
        bodyOf<UsersCreateAddFundsRequestParams>(req, ["paymentType", "amount", "returnUrl"]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    res.json(
      await namecheap.users.update(
        bodyOf<UsersUpdateParams>(req, [
          "firstName",
          "lastName",
          "address1",
          "city",
          "stateProvince",
          "zip",
          "country",
          "emailAddress",
          "phone",
        ]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

// Secrets (passwords, reset codes) are accepted in the JSON body only, never in the query string.
// Body: { "oldPassword", "newPassword" } or { "resetCode", "newPassword" }
router.put("/password", async (req, res, next) => {
  try {
    const newPassword = bodyString(req, "newPassword");
    const oldPassword = optionalBodyString(req, "oldPassword");
    const resetCode = optionalBodyString(req, "resetCode");
    if ((oldPassword === undefined) === (resetCode === undefined)) {
      throw new BadRequestError("Send exactly one body field: oldPassword or resetCode");
    }
    const params: UsersChangePasswordParams =
      oldPassword !== undefined
        ? { oldPassword, newPassword }
        : { resetCode: resetCode!, newPassword };
    res.json(await namecheap.users.changePassword(params));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.json(
      await namecheap.users.create(
        bodyOf<UsersCreateParams>(req, [
          "newUserName",
          "newUserPassword",
          "emailAddress",
          "firstName",
          "lastName",
          "acceptTerms",
          "city",
          "stateProvince",
          "zip",
          "country",
          "phone",
        ]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

// Body: { "password" }
router.post("/login", async (req, res, next) => {
  try {
    res.json(await namecheap.users.login(bodyOf<UsersLoginParams>(req, ["password"])));
  } catch (error) {
    next(error);
  }
});

router.post("/resetPassword", async (req, res, next) => {
  try {
    res.json(
      await namecheap.users.resetPassword(
        bodyOf<UsersResetPasswordParams>(req, ["findBy", "findByValue"]),
      ),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
