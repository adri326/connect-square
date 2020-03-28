module.exports = function api(settings) {
  return function(req, res, next) {
    console.log(req.params.node);
    res.write("Hello world!");
    res.end();
  }
}
