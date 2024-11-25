const express = require("express");
const session = require("express-session");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// testing data
const users = {
  testuser: {
    username: "testuser",
    password: "password123",
    mfaSecret: null,
  },
};

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "testingwithmohit",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/", (req, res) => {
  if (req.isAuthenticated) {
    res.send(
      `<h1>Welcome, ${req.session.username}</h1><a href="/logout">Logout</a>`
    );
  } else {
    res.send(`
      <h1>Login</h1>
      <form action="/login" method="POST">
        <label for="username">Username: </label><input type="text" name="username" required /><br/>
        <label for="password">Password: </label><input type="password" name="password" required /><br/>
        <button type="submit">Login</button>
      </form>
    `);
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (user && user.password === password) {
    req.session.username = username;
    if (user.mfaSecret === null) {
      return res.redirect("/mfa-setup");
    }
    return res.redirect("/mfa-verify");
  }

  res.send(
    '<h1>Invalid credentials, try again.</h1><a href="/">Back to Login</a>'
  );
});

// totp
app.get("/mfa-setup", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/");
  }

  const user = users[req.session.username];
  const secret = speakeasy.generateSecret({ name: "MyApp" });
  user.mfaSecret = secret.base32;
  qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) {
      return res.status(500).send("Error generating QR code");
    }

    res.send(`
      <h1>Scan this QR Code with your Google Authenticator or Authy app</h1>
      <img src="${dataUrl}" alt="QR Code" /><br/>
      <p>Alternatively, you can manually enter the secret: <strong>${secret.base32}</strong></p>
      <br/>
      <a href="/mfa-verify">Proceed to Verify MFA</a>
    `);
  });
});

app.get("/mfa-verify", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/");
  }

  const user = users[req.session.username];
  if (!user.mfaSecret) {
    return res.redirect("/");
  }

  res.send(`
    <h1>Enter the code from your authenticator app</h1>
    <form action="/mfa-verify" method="POST">
      <input type="text" name="token" placeholder="Enter MFA Token" required /><br/>
      <button type="submit">Verify</button>
    </form>
  `);
});

app.post("/mfa-verify", (req, res) => {
  const { token } = req.body;
  const user = users[req.session.username];
  const secret = user.mfaSecret;

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
  });

  if (verified) {
    res.send('<h1>MFA Verification Successful!</h1><a href="/">Go to Home</a>');
  } else {
    res.send(
      '<h1>Invalid MFA Code. Try Again.</h1><a href="/mfa-verify">Retry</a>'
    );
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
