const express = require("express"),
  bodyParser = require("body-parser"),
  path = require("path"),
  app = express(),
  port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const { streamText } = require("ai");
const { openai } = require("@ai-sdk/openai");

const asyncWrapper = require("./utils/asyncWrapper");
const flightsRoutes = require("./routes/flights.routes");

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    const result = streamText({
      model: openai("gpt-4o"),
      prompt: "Invent a new holiday and describe its traditions.",
    });

    console.log(result);

    result.pipeDataStreamToResponse(res);
  })
);

app.use("/api", flightsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
