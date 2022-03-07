const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  // breed: {type: Types.ObjectId, ref: 'Breed'},
  theme_name: {type: String, required: true},
  theme_bg_image: {type: String, required: true},
})
module.exports = model('Theme', schema)