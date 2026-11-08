import { Router } from "express";
import type { UsersAddressCreateParams, UsersAddressUpdateParams } from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { numericParam } from "../lib/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.json(await namecheap.usersAddress.create(req.body as UsersAddressCreateParams));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    res.json(await namecheap.usersAddress.getList());
  } catch (error) {
    next(error);
  }
});

// Body: { "addressId": 123 }
router.post("/default", async (req, res, next) => {
  try {
    const addressId = numericParam(String(req.body?.addressId), "addressId");
    res.json(await namecheap.usersAddress.setDefault({ addressId }));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const addressId = numericParam(req.params.id, "id");
    res.json(await namecheap.usersAddress.getInfo({ addressId }));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const addressId = numericParam(req.params.id, "id");
    const body = req.body as Omit<UsersAddressUpdateParams, "addressId">;
    res.json(await namecheap.usersAddress.update({ ...body, addressId }));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const addressId = numericParam(req.params.id, "id");
    res.json(await namecheap.usersAddress.delete({ addressId }));
  } catch (error) {
    next(error);
  }
});

export default router;
