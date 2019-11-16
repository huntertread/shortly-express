const parseCookies = (req, res, next) => {
  // bring in the header for the request
  return Model.get(req.body.header)
  // parse the header and filter out the cookie
  // reassign the cookie as a cookie property on the request object
  .then((cookie) => {
    console.log(cookie);
  })
};

module.exports = parseCookies;