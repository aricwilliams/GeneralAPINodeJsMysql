const express = require("express");
const router = express.Router();
const listings = require("../services/middleLayer");

/**
 * @swagger
 * /listings/getalllistings:
 *   get:
 *     summary: Get programming languages
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.get("/getalllistings", async function (req, res, next) {
  try {
    res.json(await listings.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting programming languages `, err.message);
    next(err);
  }
});

/**
 * @swagger
 * /listings/getonelisting/{id}:
 *   get:
 *     summary: Get a listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.get("/getonelisting/:id", async function (req, res, next) {
  try {
    res.json(await listings.getListingById(req.params.id));
  } catch (err) {
    console.error(`Error while getting listing by ID`, err.message);
    next(err);
  }
});

/**
 * @swagger
 * /listings/addlisting:
 *   post:
 *     summary: Add a listing
 *     parameters:
 *       - in: body
 *         name: listing
 *         description: Listing object
 *         schema:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             beds:
 *               type: integer
 *             baths:
 *               type: integer
 *             price:
 *               type: number
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.post("/addlisting", async function (req, res, next) {
  try {
    const { address, beds, baths, price } = req.body;
    const newListing = {
      address,
      beds,
      baths,
      price,
    };
    res.json(await listings.createListing(newListing));
  } catch (err) {
    console.error(`Error while creating a listing`, err.message);
    next(err);
  }
});

/**
 * @swagger
 * /listings/editlisting/{id}:
 *   put:
 *     summary: Update a programming language
 *     parameters:
 *       - in: body
 *         name: listing
 *         description: Listing object
 *         schema:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             beds:
 *               type: integer
 *             baths:
 *               type: integer
 *             price:
 *               type: number
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.put("/editlisting/:id", async function (req, res, next) {
  try {
    res.json(await listings.updateListing(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating programming language`, err.message);
    next(err);
  }
});

/**
 * @swagger
 * /listings/deletelisting/{id}:
 *   delete:
 *     summary: Delete a programming language
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.delete("/deletelisting/:id", async function (req, res, next) {
  try {
    res.json(await listings.deleteListing(req.params.id));
  } catch (err) {
    console.error(`Error while deleting programming language`, err.message);
    next(err);
  }
});

module.exports = router;
