const { mongoose } = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema(
  {
    Question: {
      type: String,
      required: [true, "Technical questions is required!!"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required!!"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required!!"],
    },
  },
  {
    _id: false,
  },
);

const behavioralQuestionSchema = new mongoose.Schema(
  {
    Question: {
      type: String,
      required: [true, "Technical questions is required!!"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required!!"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required!!"],
    },
  },
  {
    _id: false,
  },
);

const skillGap = new mongoose.Schema(
  {
    skills: {
      type: String,
      required: [true, "Skills is required!!"],
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
  },
  {
    _id: false,
  },
);

const preparationPlan = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, "Day is required!!"],
  },
  foucus: {
    type: String,
    required: [true, "Focus is required!!"],
  },
  task: [
    {
      type: String,
      required: [true, "Task is required!!"],
    },
  ],
});

const interviewReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job Title is Required!!"],
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required!!"],
    },
    resume: {
      type: String,
    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    technicalQuestionSchema: [technicalQuestionSchema],
    behavioralQuestionSchema: [behavioralQuestionSchema],
    skillGap: [skillGap],
    preparationPlan: [preparationPlan],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  },
);

const interviewReportModel = mongoose.model(
  "interviewReport",
  interviewReportSchema,
);

module.exports = interviewReportModel;
