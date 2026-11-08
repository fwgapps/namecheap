import { Router } from "express";
import type {
  SslActivateParams,
  SslCreateParams,
  SslEditDcvMethodParams,
  SslReissueParams,
  SslRenewParams,
} from "@fwgapps/namecheap";
import namecheap from "../services/namecheap";
import { numericParam, pickQuery, requiredString } from "../lib/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.json(await namecheap.ssl.create(req.body as SslCreateParams));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const params = pickQuery(req.query, ["listType", "searchTerm", "sortBy"], ["page", "pageSize"]);
    res.json(await namecheap.ssl.getList(params));
  } catch (error) {
    next(error);
  }
});

// The CSR is sent in the body (it is long and multi-line): POST, read-only on the API side.
router.post("/parseCsr", async (req, res, next) => {
  try {
    const { csr, certificateType } = req.body as { csr: string; certificateType?: string };
    res.json(
      await namecheap.ssl.parseCSR({ csr, ...(certificateType ? { certificateType } : {}) }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/approverEmails/:domain", async (req, res, next) => {
  try {
    const certificateType = requiredString(req.query, "certificateType");
    res.json(
      await namecheap.ssl.getApproverEmailList({ domainName: req.params.domain, certificateType }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/info/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    res.json(await namecheap.ssl.getInfo({ certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/activate/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const body = req.body as Omit<SslActivateParams, "certificateID">;
    res.json(await namecheap.ssl.activate({ ...body, certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/resendApproverEmail/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    res.json(await namecheap.ssl.resendApproverEmail({ certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/resendFulfillmentEmail/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    res.json(await namecheap.ssl.resendFulfillmentEmail({ certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/renew/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const body = req.body as Omit<SslRenewParams, "certificateID">;
    res.json(await namecheap.ssl.renew({ ...body, certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/reissue/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const body = req.body as Omit<SslReissueParams, "certificateID">;
    res.json(await namecheap.ssl.reissue({ ...body, certificateID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "numberOfSansToAdd": 2 }
router.post("/purchaseMoreSans/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const numberOfSansToAdd = numericParam(
      String(req.body?.numberOfSansToAdd),
      "numberOfSansToAdd",
    );
    res.json(await namecheap.ssl.purchaseMoreSans({ certificateID, numberOfSansToAdd }));
  } catch (error) {
    next(error);
  }
});

router.post("/dcvMethod/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const body = req.body as Record<string, string>;
    res.json(
      await namecheap.ssl.editDCVMethod({ ...body, certificateID } as SslEditDcvMethodParams),
    );
  } catch (error) {
    next(error);
  }
});

router.delete("/certificate/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const certificateType = requiredString(req.query, "certificateType");
    res.json(await namecheap.ssl.revokeCertificate({ certificateID, certificateType }));
  } catch (error) {
    next(error);
  }
});

export default router;
