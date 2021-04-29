const express = require("express");
const { startDatabase } = require("./database/mongo");
const { insertAd, getAds, deleteAd, updateAd } = require("./database/ads");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();

app.get("/", async (req, res) => {
  res.send(await getAds());
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-me78dapz.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: "My App",
  issuer: `https://dev-me78dapz.us.auth0.com/`,
  algorithms: ["RS256"],
});

app.use(checkJwt);

app.post("/", async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({ message: "New ad inserted." });
});

app.delete("/:id", async (req, res) => {
  await deleteAd(req.params.id);
  res.send({ message: "Ad removed." });
});

app.put("/:id", async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);
  res.send({ message: "Ad updated." });
});

startDatabase().then(async () => {
  await insertAd({ title: "Hello, now from the in-memory database!" });

  app.listen(3001, async () => {
    console.log("listening on port 3001");
  });
});
