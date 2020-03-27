module.exports = function api(req, res, next) {
  console.log(req.params.node);
  res.write("Hello world!");
  res.end();
}
