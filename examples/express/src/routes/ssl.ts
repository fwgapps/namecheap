import { Router } from "express";
import { SSLListType, SSLListSortBy, SSLType } from "@fwgapps/namecheap";

import namecheap from "../services/namecheap";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const params = req.body;
    const response = await namecheap.ssl.create(params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { listType, page, pageSize, sortBy } = req.query;

    const response = await namecheap.ssl.getList({
      listType: listType as SSLListType,
      page: +(page || 1),
      pageSize: +(pageSize || 10),
      sortBy: sortBy as SSLListSortBy,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/csr/:csr", async (req, res) => {
  try {
    const { csr } = req.params;
    const { certificateType } = req.query;

    const response = await namecheap.ssl.parseCSR(csr, certificateType as SSLType);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/approverEmails/:domain", async (req, res) => {
  try {
    const { domain } = req.params;
    const { certificateType } = req.query;

    const response = await namecheap.ssl.getApproverEmailList(domain, certificateType as SSLType);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/activate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;

    const response = await namecheap.ssl.activate(+id, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/resendApproverEmail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await namecheap.ssl.resendApproverEmail(+id);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/info/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await namecheap.ssl.getInfo(+id);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/renew/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;

    const response = await namecheap.ssl.renew(+id, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/reissue/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;

    const response = await namecheap.ssl.reissue(+id, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/resendFulfillmentEmail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await namecheap.ssl.resendFulfillmentEmail(+id);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/purchaseMoreSANS/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { numberOfSANSToAdd } = req.body;

    const response = await namecheap.ssl.purchaseMoreSANS(+id, numberOfSANSToAdd);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/certificate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { certificateType } = req.query;

    const response = await namecheap.ssl.revokeCertificate(+id, certificateType as SSLType);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/dcvMethod/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;

    const response = await namecheap.ssl.editDCVMethod(+id, params);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
