const cheerio = require("cheerio");

const { replace } = require("lodash/fp");

const isPlainText = (elem) => typeof elem === "string" && !elem.startsWith("<");

const startsWithLink = (elem) =>
  typeof elem === "string" && elem.startsWith("<a");

const getInnerHTML = (elem) =>
  isPlainText(elem) || startsWithLink(elem) ? elem : cheerio(elem).html();

const removeDash = (elem) => replace(/-/g, "_", elem);

const unescapePiping = (value) => replace(/&apos;/g, `&#39;`, value);

const getInnerHTMLWithPiping = (elem) => {
  if (!elem) {
    return;
  }

  if (elem.text) {
    elem.text = unescapePiping(getInnerHTML(elem.text));
    return elem;
  }
  return unescapePiping(getInnerHTML(elem));
};

const getText = (elem) => (isPlainText(elem) ? elem : cheerio(elem).text());

const description = (elem) => ({ description: getInnerHTMLWithPiping(elem) });

const title = (elem) => ({ title: getInnerHTMLWithPiping(elem) });

const list = (elem) => ({
  list: cheerio(elem)
    .find("li")
    .map((i, li) => getInnerHTMLWithPiping(li))
    .toArray(),
});

const mapElementToObject = (elem) => {
  switch (elem.name) {
    case "p":
      return description(elem);
    case "h2":
      return title(elem);
    case "ul":
      return list(elem);
  }
};

const parseContent = (html) => {
  if (!html) {
    return;
  }

  const text = html.text ? html.text : html;
  const content = cheerio(text)
    .filter((i, elem) => getInnerHTML(elem) !== "")
    .map((i, elem) => mapElementToObject(elem))
    .toArray();

  if (!content.length) {
    return;
  }
  return content;
};

module.exports = {
  getInnerHTML,
  getInnerHTMLWithPiping,
  getText,
  parseContent,
  removeDash,
  unescapePiping,
};
