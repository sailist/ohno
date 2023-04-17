import { describe, expect, test } from "vitest";

import { createElement, getDefaultRange } from "@helper/document";

import { Page } from "@system/page";
import { FormatText } from "../../../src/contrib/commands/format";
import { addMarkdownHint, removeMarkdownHint } from "@helper/markdown";
import { normalizeRange, setRange } from "@system/range";
import { ValidNode, innerHTML, outerHTML } from "@helper/element";

function makeFakePage() {
  const page = new Page();
  const root = createElement("div");
  document.body.appendChild(root);
  page.render(root);
  page.blocks.first!.value.el.innerHTML = "Ohno World!";
  return page;
}

describe("FormatText", () => {
  test("<i>te|xt</i>", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    block.el.innerHTML = "<i>1234</i>";
    addMarkdownHint(block.el);
    expect(block.el.textContent).toBe("*1234*");
    block.setOffset({ start: 3 });
    // "<i>12|34</i>";

    const command = new FormatText({
      block,
      page,
      format: "b",
      offset: { start: 3 },
    });
    page.executeCommand(command);
    console.log(block.el.innerHTML);
    const clone = block.el.cloneNode(true) as HTMLElement;
    removeMarkdownHint(clone as ValidNode);
    expect(innerHTML(clone)).toBe("<i>12<b></b>34</i>");
    page.history.undo();
  });

  test("*[*text*]*", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    block.el.innerHTML = "<b>1234</b>";
    addMarkdownHint(block.el);
    expect(block.el.textContent).toBe("**1234**");

    const boldEl = block.el.firstChild!;
    const range = document.createRange();
    range.setStart(boldEl.firstChild!.firstChild!, 1);
    range.setEnd(boldEl.lastChild!.firstChild!, 1);
    setRange(range);

    expect(range.cloneContents().textContent!).toBe("*1234*");
    normalizeRange(block.el, range);
    setRange(range);
    page.root?.dispatchEvent(new InputEvent("formatBold"));
    // *[*text*]*
    // 需要先检测光标位于 span，并解决光标偏移的问题（通过 selectionchange？有这个事件吗？）
    // TODO
    // expect(block.el.textContent).toBe("1234");
  });

  test("[<b>text</b>]", () => {
    const page = makeFakePage();
    const block = page.findBlock("n")!;
    block.el.innerHTML = "<b>1234</b>";

    let command = new FormatText({
      block: block,
      offset: { start: 0, end: 6 },
      page: page,
      format: "b",
    });

    page.executeCommand(command);
    expect(block.el.textContent).toBe("1234");
    // [**1234**] -> [1234]
    // [**1234*]* / *[*1234**] -> [1234]
  });

  // remove
  test("<b>te|xt</b>", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    block.el.innerHTML = "<b>Ohno World!</b>";
    let command = new FormatText({
      block: block,
      offset: { start: 1 },
      page: page,
      format: "b",
    });

    page.executeCommand(command);
    expect(block.el.textContent).toBe("Ohno World!");
    const range = getDefaultRange();
    // **xx|x** -> [Ohno World!]
    expect(range.cloneContents().textContent).toBe("Ohno World!");
  });

  test("pl|ain", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    expect(block.el.textContent).toBe("Ohno World!");
    let command = new FormatText({
      block: block,
      offset: { start: 0 },
      page: page,
      format: "b",
    });

    page.executeCommand(command);
    expect(block.el.textContent).toBe("****Ohno World!");
    // **[ ]**Ohno World!
    const range = getDefaultRange();
    expect(range.cloneContents().textContent).toBe("");
  });

  test("|", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    block.el.childNodes.forEach((item) => {
      item.remove();
    });
    expect(block.el.textContent).toBe("");
    let command = new FormatText({
      block: block,
      offset: { start: 0 },
      page: page,
      format: "b",
    });

    page.executeCommand(command);
    expect(block.el.textContent).toBe("****");
    const range = getDefaultRange();
    // **[ ]**
    expect(range.cloneContents().textContent).toBe("");
  });

  test("<i>01[2</i>3]45", () => {
    const page = makeFakePage();
    let block = page.findBlock("n")!;
    block.el.innerHTML = "<i>012</i>345";
    let command = new FormatText({
      block: block,
      offset: { start: 3, end: 6 },
      page: page,
      format: "b",
    });

    // page.emit(command);
    // expect(block.el.textContent).toBe("*01****2*3**45");
    // const range = document.getSelection()?.getRangeAt(0)!;
    // // **xx|x** -> [Ohno World!]
    // expect(range.cloneContents().textContent).toBe("Ohno World!");
  });
});