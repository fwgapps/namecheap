import { Router } from "express";
import { WhoIsListType } from "@fwgapps/namecheap";

import namecheap from "../services/namecheap";

const router = Router();

router.put("/email", async (req, res) => {
  try {
    const { whoIsGuardId } = req.body;
    const response = await namecheap.domainPrivacy.changeEmailAddress(whoIsGuardId);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/enable/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { forwardedToEmail } = req.body;

    const response = await namecheap.domainPrivacy.enable(+id, forwardedToEmail);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/disable/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await namecheap.domainPrivacy.disable(+id);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { listType, page, pageSize } = req.query;

    const response = await namecheap.domainPrivacy.getList({
      listType: listType as WhoIsListType,
      page: +(page ?? 1),
      pageSize: +(pageSize ?? 10),
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/renew/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { year, promotionCode } = req.body;

    const response = await namecheap.domainPrivacy.renew(id, year, promotionCode);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
