const express = require("express");
const router = express.Router();
const listings = require("../services/middleLayer");

/**
 * @swagger
 * /listings/getapikey:
 *   get:
 *     summary: Get the next available API key
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.get("/getapikey/:search", async function (req, res, next) {
  try {
    // Add your code for fetching the next available API key here
    const nextApiKey = await listings.getNextApiKey();
    // Check if the retrieved apiKey is null or undefined
    if (nextApiKey === null || nextApiKey === undefined) {
      res.status(404).json({ message: "No more resources to make this call." });
    } else {
      // Update userCalled for the retrieved apiKey
      await listings.increaseUserCalled(nextApiKey.id);

      // Check if userCalled is 99, then fetch the next apiKey and update it recursively
      if (nextApiKey.userCalled === 99) {
        await updateNextApiKey(nextApiKey.id);
      }
      const searchResults = await listings.getYoutubeSearch(
        nextApiKey.apiKey,
        req.params.search
      );
      if (!searchResults || !searchResults.searchResults) {
        res.status(404).json({ message: "No data" });
      }

      const resultsWithChannelIds = await Promise.all(
        searchResults.searchResults.map(async (item) => {
          const channelId = item.snippet.channelId;
          const subCount = await listings.getSubCount(
            channelId,
            nextApiKey.apiKey
          );
          return {
            channelId: channelId,
            subCount: subCount,
            result: item,
          };
        })
      );

      res.json(resultsWithChannelIds);
    }
  } catch (err) {
    console.error(
      `Error while getting the next available API key`,
      err.message
    );
    next(err);
  }
});

// Helper function to recursively update the next apiKey if userCalled is 99
async function updateNextApiKey(id) {
  alert(id);
  const nextApiKey = await listings.getNextApiKey(id);
  if (nextApiKey === null || nextApiKey === undefined) {
    return; // No more resources to make this call
  }

  await listings.increaseUserCalled(nextApiKey.id);

  if (nextApiKey.userCalled === 99) {
    await updateNextApiKey(nextApiKey.id);
  }
}

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
 * /listings/updateapikey:
 *   put:
 *     summary: Update API Key
 *     parameters:
 *       - in: body
 *         name: apiKeyData
 *         description: API Key data object
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             apiKey:
 *               type: string
 *             createdAt:
 *               type: string
 *             userCalled:
 *               type: integer
 *             timeUsed:
 *               type: integer
 *             timeUsedEnd:
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
router.put("/updateapikey", async function (req, res, next) {
  try {
    const { id, apiKey, userCalled } = req.body;
    res.json(await listings.updateApiKey(id, apiKey, userCalled));
  } catch (err) {
    console.error(`Error while updating API key`, err.message);
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
