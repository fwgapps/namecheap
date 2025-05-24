import { Router } from "express";
import { UserProductType } from "@fwgapps/namecheap";

import namecheap from "../services/namecheap";

const router = Router();

router.get("/pricing/:productType", async (req, res) => {
  try {
    const { productType } = req.params;
    const params = req.query;

    const response = await namecheap.users.getPricing({
      ...params,
      productType: productType as UserProductType,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/balances", async (req, res) => {
  try {
    const response = await namecheap.users.getBalances();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const response = await namecheap.users.changePassword(oldPassword, newPassword);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/", async (req, res) => {
  try {
    const params = req.body;

    const response = await namecheap.users.update(params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/addFundsRequest/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const params = req.body;

    const response = await namecheap.users.createAddFundsRequest(username, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/addFundsStatus/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;

    const response = await namecheap.users.getAddFundsStatus(tokenId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const params = req.body;

    const response = await namecheap.users.create(params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    const response = await namecheap.users.login(password);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/resetPassword", async (req, res) => {
  try {
    const params = req.body;

    const response = await namecheap.users.resetPassword(params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
