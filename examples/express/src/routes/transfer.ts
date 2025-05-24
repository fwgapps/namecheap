import { Router } from "express";
import { DomainTransferListType, DomainTransferSortBy } from "@fwgapps/namecheap";

import namecheap from "../services/namecheap";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { domain, ...params } = req.body;
    const response = await namecheap.domainsTransfer.create(domain, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await namecheap.domainsTransfer.getStatus(+id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { resubmit } = req.body;

    const response = await namecheap.domainsTransfer.updateStatus(+id, !!resubmit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { listType, page, pageSize, sortBy } = req.query;

    const response = await namecheap.domainsTransfer.getList({
      listType: listType as DomainTransferListType,
      page: +(page || 1),
      pageSize: +(pageSize || 10),
      sortBy: sortBy as DomainTransferSortBy,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
