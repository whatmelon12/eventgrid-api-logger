const fs = require("fs");
const camelcaseKeys = require("camelcase-keys");
const bodyParser = require("body-parser");
const app = require("express")();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  let body = camelcaseKeys(req.body, { exclude: ["_id"], deep: true });
  req.body = body;

  next();
});

app.post("/events", (req, res) => {
  if (Array.isArray(req.body)) {
    req.body.forEach(event => {
      switch (event.eventType) {
        case "Microsoft.EventGrid.SubscriptionValidationEvent":
          return res.send({ ValidationResponse: event.data.validationCode });
        default:
          fs.writeFileSync(
            `${process.cwd()}/events/${event.eventType ||
              "rnd"}_${Date.now()}.json`,
            JSON.stringify(event)
          );
          return res.send();
      }
    });
  }
});

app.get("/", (req, res) =>
  res.send("Health check for Event Grid listener API")
);

app.listen(port);
