const pdf = require("pdf-parse");
const {
  generateInterviewReport,
  generateTailoredResumePdf,
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

async function interviewReport(req, res) {
  try {
    const pdfData = await pdf(req.file.buffer);
    const resumeContent = pdfData.text;

    const { selfDescription, jobDescription } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });

    res.status(201).json({
      message: "Interview Report Generated Successfully",
      interviewReport,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate interview report.",
    });
  }
}

async function getInterviewReportById(req, res) {
  try {
    const { interviewId } = req.params;

    const cleanId = interviewId.startsWith(":")
      ? interviewId.slice(1)
      : interviewId;

    const interviewSingleReport = await interviewReportModel.findOne({
      _id: cleanId,
    });

    if (!interviewSingleReport) {
      return res.status(404).json({
        message: "Invalid Report not found",
      });
    }

    res.status(200).json({
      message: "Interview Report Fetach Successfully!",
      interviewSingleReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch interview report." });
  }
}

async function getAllInterviewReport(req, res) {
  try {
    const interviewReport = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("jobDescription matchScore");

    res.status(200).json({
      message: "Interview Title Fetch",
      interviewReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch interview reports." });
  }
}

const generateResumePdfController = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const report = await interviewReportModel.findById(interviewId);

    if (!report) {
      return res.status(404).json({
        message: "Interview Report not found",
      });
    }

    const pdfBuffer = await generateTailoredResumePdf({
      resume: report.resume,
      selfDescription: report.selfDescription,
      jobDescription: report.jobDescription,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Resume.pdf"`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF ERROR ===>>");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  interviewReport,
  getInterviewReportById,
  getAllInterviewReport,
  generateResumePdfController,
};
