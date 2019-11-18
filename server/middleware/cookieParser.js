const parseCookies = (req, res, next) => {
  if (req.headers.cookie) {
    return req.headers.cookie;
  } else {
    req.headers.cookie = {};
    // console.log(req.headers.cookie);
    // console.log(req.headers);
  }
};

module.exports = parseCookies;