const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMagicLink = async (email, token) => {
  const magicLink = `http://localhost:3000/authenticate?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Magic Link",
    text: `Click the link to log in: ${magicLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Magic link sent!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

app.post("/request-magic-link", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  await sendMagicLink(email, token);

  res.json({ message: "Magic link sent to your email!" });
});

app.get("/authenticate", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    res.json({ message: "Authenticated successfully!", user: decoded });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
