const express = require("express");
const { authUser } = require("../middleware/auth.middleware");
const { interviewReport, getInterviewReportById, getAllInterviewReport, generateResumePdfController } = require("../controllers/interviewReport.controller");
const upload = require("../middleware/file.middleware");



const interviewRouter = express.Router();


interviewRouter.post("/",authUser , upload.single("resumeFile") ,interviewReport);

interviewRouter.get("/:interviewId", authUser, getInterviewReportById)

interviewRouter.get("/", authUser, getAllInterviewReport)

// interviewRouter.get(
//   "/generate-pdf/:interviewId",
//   authUser,
//   generateResumePdfController
// );
 
interviewRouter.get(
    "/generate-pdf/:interviewId",
    authUser,
    generateResumePdfController
);

module.exports = interviewRouter;
