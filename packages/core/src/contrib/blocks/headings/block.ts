import {
  ChildrenPayload,
  createElement,
} from "@ohno-editor/core/helper/document";
import { BlockSerializedData } from "@ohno-editor/core/system/base";
import { Block, BlockInit } from "@ohno-editor/core/system/block";
import { clipRange } from "@ohno-editor/core/system/range";
import "./style.css";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingsInit extends BlockInit {
  level: HeadingLevel;
  children?: ChildrenPayload;
}

export class Headings extends Block<HeadingsInit> {
  constructor(init?: HeadingsInit) {
    init = init || { level: 2 };
    init.el = createElement(`h${init.level}`, {
      attributes: {},
      children: init.children,
    });

    super("headings", init);
  }

  public get head(): string {
    return "#".repeat(this.init.level) + " ";
  }

  toMarkdown(range?: Range | undefined): string {
    if (!range || range.collapsed) {
      return this.head + (this.inner.textContent || "");
    }
    const innerRange = clipRange(this.inner, range);
    if (innerRange) {
      return this.head + innerRange.cloneContents().textContent;
    }
    return "";
  }

  serialize(option?: any): BlockSerializedData<HeadingsInit> {
    const init = { level: this.init.level, children: this.inner.innerHTML };
    return [{ type: this.type, init }];
  }
}
