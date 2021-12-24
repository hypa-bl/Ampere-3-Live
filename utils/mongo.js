const mongoose = require ('mongoose');
const mongoPath = `mongodb+srv://hypa1:${process.env.MDBPASS}@amperedb.8y2am.mongodb.net/AmpereDB?retryWrites=true&w=majority`;

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  return mongoose;
}