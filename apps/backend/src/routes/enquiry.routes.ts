import { Router } from "express";

import { submitEnquiryController } from "../controllers/enquiry.controller";

// Create a router for customer enquiries.
const enquiryRouter = Router();

// POST /api/enquiries
enquiryRouter.post("/", submitEnquiryController);

export default enquiryRouter;
