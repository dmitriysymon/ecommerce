const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const db = require("../config/db"); // Файл з підключенням до MySQL

dotenv.config();

const app = express();

// Налаштування сесій
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Конфігурація Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Перевіряємо, чи користувач є в базі
        let [user] = await db.query("SELECT * FROM user WHERE google_id = ?", [id]);

        if (!user) {
          // Якщо немає, додаємо в базу
          await db.query("INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)", [
            id,
            displayName,
            email,
          ]);
          [user] = await db.query("SELECT * FROM users WHERE google_id = ?", [id]);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Серіалізація користувача
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const [user] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  done(null, user);
});

// Маршрути для аутентифікації
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000/login",
  })
);

app.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:3000");
});

module.exports = app;
