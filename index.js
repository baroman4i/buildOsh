const fs = require("fs");
const express = require("express");
const path = require("path");
const multiparty = require("multiparty");
const dotenv = require("dotenv");
var mv = require("mv"); 
let themes = JSON.parse(fs.readFileSync("localData.json"));
dotenv.config();
const app = express();
const port = 5000;
app.use(express.static('build'));
app.use(express.json());

app.get("/", (req, res) => res.sendFile(path.resolve('build/index.html')));
app.get("/arr", (req, res) =>
  res.json((themes = JSON.parse(fs.readFileSync("localData.json"))))
);

async function writeData(data) {
  data = JSON.stringify(data);
  // try {
    
  // } catch (err) {
  //   console.error(err);
  // }
  await new Promise((resolve, reject) => {
    fs.writeFile("localData.json", data, "utf8", async (err) => {
      if (err) console.error(err);
      else {
        themes = data
        await resolve(data)
      }
    });
  })
  return themes
}

async function deleteFile(filePath, dirPath) {
  fs.access(dirPath, (error) => {
    if (error) {
      console.log(error);
      return 200;
    } else {
      try {
        fs.unlinkSync(filePath.toString());
        return 200;
      } catch (err) {
        console.error(err);
        return 404;
      }
    }
  });
}

async function changeDirectory(prevPath, newPath) {
  await mv(prevPath, newPath, { mkdirp: true }, function (err) {
    if (err) throw err;
    console.log("File uploaded and moved!\n");
  });
}

app.post("/image", async function (req, res) {
  const form = new multiparty.Form();
  await form.parse(req, async function (err, fields, files) {
    console.log(files);
    const el = JSON.parse(fields.element[0]);
    let currentTheme = [];
    let data = [];
    const uniqueId = Date.now();
    if (fields.type[0] === "sub") {
      currentTheme = themes.filter(
        (theme) => theme.subtopics.some((sub) => sub.id === el.id) === true
      );
      data = themes.map((theme) =>
        theme.id === currentTheme[0].id
          ? {
              ...theme,
              subtopics: theme.subtopics.map((topic) =>
                topic.id === el.id
                  ? {
                      ...topic,
                      img: `img/${currentTheme[0].id}/${
                        uniqueId + files.img[0].originalFilename
                      }`.toString(),
                    }
                  : topic
              ),
            }
          : theme
      );
    } else if (fields.type[0] === "content") {
      const parent = JSON.parse(fields.parent[0]);
      currentTheme = themes.filter(
        (theme) => theme.subtopics.some((sub) => sub.id === parent.id) === true
      );
      data = themes.map((theme) =>
        theme.id === currentTheme[0].id
          ? {
              ...theme,
              subtopics: theme.subtopics.map((topic) =>
                topic.id === parent.id
                  ? {
                      ...topic,
                      content: topic.content.map((c) =>
                        c.text === el.text || c.img === el.img
                          ? {
                              ...c,
                              img: `img/${currentTheme[0].id}/${
                                uniqueId + files.img[0].originalFilename
                              }`.toString(),
                            }
                          : c
                      ),
                    }
                  : topic
              ),
            }
          : theme
      );
      console.log(data[2].subtopics[1].content);
    } else if (fields.type[0] === "theme") {
      currentTheme = themes.filter((theme) => theme.id === el.id);
      data = themes.map((theme) =>
        theme.id === el.id
          ? {
              ...theme,
              backgroundImage: `img/${theme.id}/${
                uniqueId + files.img[0].originalFilename
              }`.toString(),
            }
          : theme
      );
    }
    try {
      await writeData(data);
      themes = data;
      const newpath = path.join(
        path.dirname(__dirname),
        "/client/public/img/",
        `${currentTheme[0].id}`,
        uniqueId + files.img[0].originalFilename
      );
      await changeDirectory(files.img[0].path, newpath);
    } finally {
      res.status(201).json({ message: "Image was saved", array: themes });
    }
  });
});

app.post("/delsub", function (req, res) {
  const sub = req.body.sub;
  deleteFile(path.join(__dirname, "/..", "/client/public/", sub.img));
  sub.content.forEach((c) => {
    deleteFile(path.join(__dirname, "/..", "/client/public/", c.img));
  });
  console.log("Images was successfully deleted");
});

app.post("/login", function (req, res) {
  const pass = req.body.pass;
  const locPass = process.env.pass;
  console.log(pass, locPass);
  locPass == pass ? res.json(true) : res.json(false);
  res.end();
});

app.post("/newarray", async function (req, res) {
  try {
    const newarray = await writeData(req.body);
    console.log("newarray was successfully saved", newarray);
    res.json(newarray);
  } catch (err) {
    console.log(err);
  }
});

app.post("/deltheme", async function (req, res) {
  try {
    await writeData(req.body.array);
    if (
      fs.existsSync(
        path.join(path.dirname(__dirname), "/client/public/img/", req.body.id)
      )
    ) {
      fs.rmSync(
        path.join(path.dirname(__dirname), "/client/public/img/", req.body.id),
        { recursive: true, force: true }
      );
      console.log("Theme was successfully deleted");
    }
    res.json(themes);
  } catch (err) {
    console.error(err);
    res.json(themes);
  }
});

app.post("/delimage", async (req, res) => {
  const imagePath = req.body.img;
  try {
    const status = await deleteFile(
      path.join(__dirname, "/..", "/client/public/", `${imagePath}`),
      path.join(
        __dirname,
        "/..",
        "/client/public/",
        `${imagePath.split("/")[0]}`
      )
    );
    res.status(status).json({ message: "Image was saved" });
  } catch (e) {
    // console.error(e);
    res.status(300).json({ message: "Image was saved" });
  }
});

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  } catch (err) {
    console.log(err);
  }
};
start();
