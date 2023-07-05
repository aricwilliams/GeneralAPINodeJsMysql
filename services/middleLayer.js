const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM roomiehaven.listings
    LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
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
  getMultiple,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
};
