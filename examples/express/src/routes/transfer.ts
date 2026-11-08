import { Router } from "express";
import type { TransferCreateParams } from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { numericParam, pickQuery } from "../lib/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.json(await namecheap.transfer.create(req.body as TransferCreateParams));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, ["listType", "searchTerm", "sortBy"], ["page", "pageSize"]);
    res.json(await namecheap.transfer.getList(params));
  } catch (error) {
    next(error);
  }
});

router.get("/status/:id", async (req, res, next) => {
  try {
    const transferID = numericParam(req.params.id, "id");
    res.json(await namecheap.transfer.getStatus({ transferID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "resubmit": true }
router.put("/status/:id", async (req, res, next) => {
  try {
    const transferID = numericParam(req.params.id, "id");
    res.json(await namecheap.transfer.updateStatus({ transferID, resubmit: !!req.body?.resubmit }));
  } catch (error) {
    next(error);
  }
});

export default router;
