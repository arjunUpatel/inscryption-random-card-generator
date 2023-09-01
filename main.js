const puppeteer = require("puppeteer");
const fs = require("fs");

const generateCard = async (name, num) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://generator.cards/");

  const menuItemList = await page.$$("section#options > section.menu");

  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  };

  // the name of the card will be input and the only non-random value
  const populateName = async (elemHandle, name) => {
    const targetField = await elemHandle.$("input");
    await targetField.type("" + name);
  };

  // card type can be input at the start, otherwise it is chosen at random
  const populateType = async (elemHandle) => {
    const typeList = ["common", "rare", "terrain", "rareterrain"];
    const targetField = await elemHandle.$("select");
    await targetField.click();
    await targetField.select(typeList[0]);
  };

  // always random
  const populateHealth = async (elemHandle) => {
    const targetField = await elemHandle.$("input");
    await targetField.click({ clickCount: 3 });
    await targetField.type("" + getRandomIntInclusive(1, 9));
  };

  // always random
  const populatePower = async (elemHandle) => {
    const targetField = await elemHandle.$("label > input[type=number]");
    await targetField.click({ clickCount: 3 });
    await targetField.type("" + getRandomIntInclusive(1, 9));
  };

  // always random
  // todo: generate cost based
  const populateCost = async (elemHandle) => {
    const blood = getRandomIntInclusive(0, 1);
    const costList = await elemHandle.$$("label");
    if (blood % 2 == 0) {
      const targetRadio = await costList[1].$("input[type=radio");
      await targetRadio.click();
      const targetField = await costList[1].$("input[type=number]");
      await targetField.click({ clickCount: 3 });
      await targetField.type("" + getRandomIntInclusive(1, 4));
    } else {
      const targetRadio = await costList[2].$("input[type=radio");
      await targetRadio.click();
      const targetField = await costList[2].$("input[type=number]");
      await targetField.click({ clickCount: 3 });
      await targetField.type("" + getRandomIntInclusive(1, 3));
    }
  };

  // randomly picks a primary sigil
  // todo: give option to set number of sigils, otherwise randomly selected - 4 max
  const populateSigil = async (elemHandle) => {
    const sigilList = [
      "icecube",
      "tristrike",
      "splitstrike",
      "reach",
      "tripleblood",
      "preventattack",
      "sacrificial",
      "flying",
      "guarddog",
      "drawant",
      "strafepush",
      "sharp",
      "drawcopyondeath",
      "submerge",
      "quadruplebones",
      "corpseeater",
      "tailonhit",
      "drawcopy",
      "whackamole",
      "tutor",
      "createdams",
      "evolve",
      "deathtouch",
      "strafe",
      "beesonhit",
      "drawrabbits",
      "madeofstone",
    ];

    const sigilSelect = await elemHandle.$("ol > li > select");
    await sigilSelect.click();
    await sigilSelect.select(
      sigilList[getRandomIntInclusive(0, sigilList.length - 1)]
    );
  };

  // fully randomly selected
  // todo: include and tune randomness for one eye
  const populatePortrait = async (elemHandle) => {
    const portraitList = await elemHandle.$$("label.portrait");
    const deathCardRadio = await portraitList[1].$("input[type=radio");
    await deathCardRadio.click();
    const deathCardOptions = await portraitList[1].$$("fieldset > label");
    const headOptions = [
      "chief",
      "enchantress",
      "gravedigger",
      "prospector",
      "robot",
      "settlerman",
      "settlerwoman",
      "wildling",
    ];
    const fiveOptions = ["0", "1", "2", "3", "4", "5"];
    const headSelect = await deathCardOptions[0].$("select");
    await headSelect.select(
      headOptions[getRandomIntInclusive(0, headOptions.length - 1)]
    );

    const eyesSelect = await deathCardOptions[1].$("select");
    await eyesSelect.select(
      "select",
      fiveOptions[getRandomIntInclusive(0, fiveOptions.length - 1)]
    );

    const mouthSelect = await deathCardOptions[2].$("select");
    await mouthSelect.select(
      "select",
      fiveOptions[getRandomIntInclusive(0, fiveOptions.length - 1)]
    );
  };

  const populate = async () => {
    await populateName(menuItemList[0], name);
    await populateType(menuItemList[1]);
    await populateHealth(menuItemList[2]);
    await populatePower(menuItemList[3]);
    await populateCost(menuItemList[4]);
    await populateSigil(menuItemList[5]);
    await populatePortrait(menuItemList[6]);
  };

  await populate();

  const generate = await page.$(
    "section.card-display div.button-menu > button"
  );
  await generate.click();

  await page.waitForSelector("section.card-display > img");
  let img = await page.$eval("section.card-display > img", (img) =>
    img.getAttribute("src")
  );

  img = img.substring(22);

  let buff = Buffer.from(img, "base64");
  let dir = "./images";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dir + "/" + num + ".png", buff);

  await browser.close();
};

const names = ["A", "B", "C", "D", "E"];

for (let i = 0; i < names.length; i++) {
  generateCard(names[i], i);
}
