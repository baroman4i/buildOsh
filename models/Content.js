const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  content_subtopic_id: {type: Types.ObjectId, ref: 'Subtopic'},
  content_text: {type: String, required: true},
  content_img: {type: String, required: true},
  content_panorama: {type: String, required: false},
  content_video: {type: String, required: false},
})
module.exports = model('Content', schema)