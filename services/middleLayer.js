const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getApiKey(req, res) {
  try {
    // SQL query to get the next available API key
    const sql = `
      SELECT apiKey, userCalled
      FROM autotubeguru.apikey
      WHERE userCalled < 99
      ORDER BY userCalled ASC
      LIMIT 1
    `;

    // Execute the query
    const result = await db.query(sql);

    if (result.length === 0) {
      res.status(404).json({ message: "No more resources available" });
    } else {
      const apiKey = result[0].apiKey;
      const userCalled = result[0].userCalled;

      // Increment the userCalled count by one
      const updatedUserCalled = userCalled + 1;

      // Update the userCalled count in the database
      const updateSql = `
        UPDATE autotubeguru.apikey
        SET userCalled = ?
        WHERE apiKey = ?
      `;

      await db.query(updateSql, [updatedUserCalled, apiKey]);

      res.json({ apiKey, userCalled: updatedUserCalled });
    }
  } catch (err) {
    console.error("Error fetching API key:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  ///
  const rows = await db.query(
    `SELECT * FROM roomiehaven.alllistings`
    // LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    // meta,
  };
}
async function getNextApiKey() {
  try {
    // SQL query to get the next available API key
    const sql = `
      SELECT id, apiKey, userCalled
      FROM autotubeguru.apikey
      WHERE userCalled < 99
      LIMIT 1
    `;

    // Execute the query
    const result = await db.query(sql);

    if (result.length === 0) {
      return null; // No more resources available
    } else {
      return result[0];
    }
  } catch (err) {
    throw err; // Throw the error to be caught in the calling function
  }
}

async function increaseUserCalled(id) {
  try {
    // Fetch the current userCalled count from the database
    const currentApiKey = await db.query(
      `SELECT userCalled FROM autotubeguru.apikey WHERE id = ?`,
      [id]
    );

    // Increment the userCalled count by one
    const updatedUserCalled = currentApiKey[0].userCalled + 1;

    // Update the userCalled count in the database
    await db.query(
      `UPDATE autotubeguru.apikey SET userCalled = ? WHERE id = ?`,
      [updatedUserCalled, id]
    );

    return updatedUserCalled;
  } catch (err) {
    throw err; // Throw the error to be caught in the calling function
  }
}
async function getYoutubeSearch(apiKey, searchQuery) {
  try {
    const part = "snippet";
    const q = searchQuery; // Use the user's search query

    const apiUrl = `https://youtube.googleapis.com/youtube/v3/search?part=${part}&q=${encodeURIComponent(
      q
    )}&key=${apiKey}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data from YouTube API");
    }

    const data = await response.json();
    const videoIds = data.items.map((item) => item.id.videoId); // Extract videoIds from the search results
    if (videoIds === null || videoIds === undefined) {
      res.status(404).json({ message: "No Video IDs!" });
    }
    // Make another API call to fetch additional information for each video
    const videoDetailsPromises = videoIds.map((videoId) =>
      getVideoDetails(apiKey, videoId)
    );
    const videoDetails = await Promise.all(videoDetailsPromises);
    if (videoDetails === null || videoDetails === undefined) {
      res.status(404).json({ message: "No Video details!" });
    }
    // Combine the search results and video details into a single response
    const resultsWithDetails = data.items.map((item, index) => ({
      videoId: videoIds[index],
      snippet: item.snippet,
      videoDetails: videoDetails[index],
    }));
    if (resultsWithDetails === null || resultsWithDetails === undefined) {
      res.status(404).json({ message: "No final details!" });
    }
    return { searchResults: resultsWithDetails };
  } catch (err) {
    throw err; // Throw the error to be caught in the calling function
  }
}
async function getSubCount(channelId, apiKey) {
  try {
    const part = "statistics";

    const apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=${part}&id=${channelId}&key=${apiKey}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data from YouTube API");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw err; // Throw the error to be caught in the calling function
  }
}

async function getVideoDetails(apiKey, videoId) {
  try {
    const part = "statistics";

    const apiUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=${part}&id=${videoId}&key=${apiKey} `;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data from YouTube API");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw err; // Throw the error to be caught in the calling function
  }
}
// CREATE
async function createListing(listing) {
  const result = await db.query(
    `INSERT INTO listings (address, beds, baths, price) 
    VALUES ('${listing.address}', ${listing.beds}, ${listing.baths}, ${listing.price})`
  );

  let message = "Error in creating listing";

  if (result.affectedRows) {
    message = "Listing created successfully";
  }

  return { message };
}

// READ
async function getListingById(id) {
  const result = await db.query(`SELECT * FROM listings WHERE id = ${id}`);

  if (result.length) {
    return result[0];
  } else {
    return null;
  }
}

// UPDATE
async function updateApiKey(id, apiKey, userCalled) {
  apiKey = apiKey !== undefined ? apiKey : null;
  userCalled = userCalled !== undefined ? userCalled : null;

  const updateSql = `
    UPDATE autotubeguru.apikey
    SET apiKey = ?, userCalled = ?
    WHERE id = ?
  `;

  const result = await db.query(updateSql, [apiKey, userCalled, id]);

  let message = "Error in updating API key";

  if (result.affectedRows) {
    message = "API key updated successfully";
  }

  return { message };
}

///////
async function updateListing(id, listing) {
  const result = await db.query(
    `UPDATE listings 
    SET address = '${listing.address}', beds = ${listing.beds}, baths = ${listing.baths}, price = ${listing.price}
    WHERE id = ${id}`
  );

  let message = "Error in updating listing";

  if (result.affectedRows) {
    message = "Listing updated successfully";
  }

  return { message };
}

// DELETE
async function deleteListing(id) {
  const result = await db.query(`DELETE FROM listings WHERE id = ${id}`);

  let message = "Error in deleting listing";

  if (result.affectedRows) {
    message = "Listing deleted successfully";
  }

  return { message };
}

module.exports = {
  getApiKey,
  getNextApiKey,
  increaseUserCalled,
  getYoutubeSearch,
  getSubCount,
  getVideoDetails,
  getMultiple,
  createListing,
  getListingById,
  updateApiKey,
  updateListing,
  deleteListing,
};
