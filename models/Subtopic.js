const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  subtopic_theme_id: {type: Types.ObjectId, ref: 'Theme'},
  subtopic_name: {type: String, required: true},
  subtopic_bg_image: {type: String, required: true},
  subtopic_text: {type: String, required: true},
  subtopic_map: {type: String, required: true},
})
module.exports = model('Subtopic', schema)