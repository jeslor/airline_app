const express = require("express");
const asyncWrapper = require("../utils/asyncWrapper");
const router = express.Router();

router.get("/airlines", getAirlines);
