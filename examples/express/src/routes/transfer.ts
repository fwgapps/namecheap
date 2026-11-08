import { Router } from "express";
import type { TransferCreateParams } from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { bodyObject, bodyOf, numericParam, pickQuery } from "../util/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.json(
      await namecheap.transfer.create(
        bodyOf<TransferCreateParams>(req, ["domainName", "years", "eppCode"]),
      ),
    );
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
    res.json(
      await namecheap.transfer.updateStatus({ transferID, resubmit: !!bodyObject(req).resubmit }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
