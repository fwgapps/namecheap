import { Router } from "express";
import type {
  SslActivateParams,
  SslCreateParams,
  SslEditDcvMethodParams,
  SslReissueParams,
  SslRenewParams,
} from "@fwgapps/namecheap";
import { BadRequestError } from "../middleware/errors";
import namecheap from "../services/namecheap";
import {
  bodyNumber,
  bodyOf,
  bodyString,
  optionalBodyString,
  numericParam,
  pickQuery,
  requiredString,
} from "../util/params";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    bodyString(req, "type");
    bodyNumber(req, "years");
    res.json(await namecheap.ssl.create(bodyOf<SslCreateParams>(req, ["years", "type"])));
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
    const csr = bodyString(req, "csr");
    const certificateType = optionalBodyString(req, "certificateType");
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
    bodyString(req, "csr");
    bodyString(req, "adminEmailAddress");
    const body = bodyOf<Omit<SslActivateParams, "certificateID">>(req, [
      "csr",
      "adminEmailAddress",
    ]);
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
    bodyNumber(req, "years");
    bodyString(req, "sslType");
    const body = bodyOf<Omit<SslRenewParams, "certificateID">>(req, ["years", "sslType"]);
    res.json(await namecheap.ssl.renew({ ...body, certificateID }));
  } catch (error) {
    next(error);
  }
});

router.post("/reissue/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    bodyString(req, "csr");
    const body = bodyOf<Omit<SslReissueParams, "certificateID">>(req, ["csr"]);
    res.json(await namecheap.ssl.reissue({ ...body, certificateID }));
  } catch (error) {
    next(error);
  }
});

// Body: { "numberOfSansToAdd": 2 }
router.post("/purchaseMoreSans/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const numberOfSansToAdd = bodyNumber(req, "numberOfSansToAdd");
    res.json(await namecheap.ssl.purchaseMoreSans({ certificateID, numberOfSansToAdd }));
  } catch (error) {
    next(error);
  }
});

router.post("/dcvMethod/:id", async (req, res, next) => {
  try {
    const certificateID = numericParam(req.params.id, "id");
    const dcvMethod = optionalBodyString(req, "dcvMethod");
    const dnsNames = optionalBodyString(req, "dnsNames");
    const dcvMethods = optionalBodyString(req, "dcvMethods");
    let params: SslEditDcvMethodParams;
    if (dcvMethod !== undefined && dnsNames === undefined && dcvMethods === undefined) {
      params = { certificateID, dcvMethod };
    } else if (dcvMethod === undefined && dnsNames !== undefined && dcvMethods !== undefined) {
      params = { certificateID, dnsNames, dcvMethods };
    } else {
      throw new BadRequestError("Provide either dcvMethod, or both dnsNames and dcvMethods");
    }
    res.json(await namecheap.ssl.editDCVMethod(params));
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
