const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const users = [
  { username: "alice", password: "password123", id: 1 },
  { username: "bob", password: "password456", id: 2 },
];

function calculateRiskScore(ipAddress, deviceType) {
  let riskScore = 0;

  if (ipAddress !== "127.0.0.1") {
    riskScore += 50;
  }

  if (deviceType === "unknown") {
    riskScore += 30;
  }

  const randomRisk = Math.random(); // risk score
  if (randomRisk > 0.7) {
    riskScore += 50; // High random risk
  }

  return riskScore;
}

function triggerMFA(username) {
  return `MFA triggered for ${username}: Please verify using your authentication method.`;
}

app.post("/login", (req, res) => {
  const { username, password, ipAddress, deviceType } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const riskScore = calculateRiskScore(ipAddress, deviceType);
  console.log(`Risk Score for ${username}: ${riskScore}`);

  // if the risk score is high, trigger MFA
  if (riskScore > 60) {
    const mfaMessage = triggerMFA(username);
    return res
      .status(200)
      .json({ message: "Login successful, but MFA required.", mfaMessage });
  }

  res.status(200).json({ message: "Login successful", userId: user.id });
});

app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});
