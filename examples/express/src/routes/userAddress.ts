import { Router } from "express";
import namecheap from "../services/namecheap";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const params = req.body;

    const response = await namecheap.usersAddress.create(params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await namecheap.usersAddress.delete(+id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await namecheap.usersAddress.getInfo(+id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await namecheap.usersAddress.getList();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/default", async (req, res) => {
  try {
    const { addressId } = req.body;

    const response = await namecheap.usersAddress.setDefault(addressId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;

    const response = await namecheap.usersAddress.update(+id, params);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
