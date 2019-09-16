module.exports = async function(context) {
  context.aggressive = false;

  context.entry = {
    dingtalk: "./src/index.js"
  };
};
