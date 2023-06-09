import {
  getIntervalOfNodes,
  getIntervalFromRange,
  createRange,
  getValidAdjacent,
  setRange,
} from "@ohno-editor/core/system/functional";
import {
  AnyBlock,
  Command,
  CommandCallback,
  Page,
  Interval,
} from "@ohno-editor/core/system/types";

import { InlineSupport } from "@ohno-editor/core/system/inline";

import { removeActivate, removeHover } from "@ohno-editor/core/system/status";

export interface IBlockRemovePayload {
  page: Page;
  block: AnyBlock;
  label: HTMLLabelElement;
  intime?: {
    range: Range;
  };
}

export interface IBlockReplacePayload {
  page: Page;
  block: AnyBlock;
  old: HTMLLabelElement;
  label: HTMLLabelElement;
}

// export class IBlockSubmit extends Com

// 已经更改完了的 label 和 old
export class InlineSubmit extends Command<IBlockReplacePayload> {
  declare buffer: {
    current: HTMLLabelElement;
    label: HTMLLabelElement;
    old: HTMLLabelElement;
    offset: Interval;
  };

  onExecuteFn?: CommandCallback<IBlockReplacePayload> = ({ page }) => {
    const label = this.buffer.current;
    const plugin = page.getPlugin<InlineSupport>("inlinesupport");
    const manager = plugin.getInlineManager(label);
    this.payload.page.setLocation(getValidAdjacent(label, "afterend"));
    plugin.setHoveredInline("cursor");
    plugin.setHoveredInline("mouse");
    plugin.setActiveInline();
    removeHover(label);
    removeActivate(label);
  };

  onUndoFn: CommandCallback<IBlockReplacePayload> = ({ page }) => {
    const label = this.buffer.current;
    const plugin = page.getPlugin<InlineSupport>("inlinesupport");
    const manager = plugin.getInlineManager(label);
    this.payload.page.setLocation(getValidAdjacent(label, "afterend"));
    plugin.setHoveredInline("cursor");
    plugin.setHoveredInline("mouse");
    plugin.setActiveInline();
    removeHover(label);
    removeActivate(label);
  };

  execute(): void {
    const { block, label, old } = this.payload;
    // clone 是为了防止删除时 current（在 document 上的 element）消失
    if (this.buffer.offset) {
      const { offset, label } = this.buffer!;
      const range = getIntervalFromRange(block.root, {
        start: offset.start,
        end: offset.start + 2,
      })!;
      range.deleteContents();
      range.insertNode(label);
      this.buffer = {
        ...this.buffer,
        current: label,
        label: label.cloneNode(true) as HTMLLabelElement,
      };
    } else {
      const offset = getIntervalOfNodes(block.root, label);
      this.buffer = {
        ...this.buffer,
        current: label,
        label: label.cloneNode(true) as HTMLLabelElement,
        old: old.cloneNode(true) as HTMLLabelElement,
        offset: offset,
      };
    }
  }

  undo(): void {
    const { block } = this.payload;
    const { old, offset } = this.buffer!;
    const range = getIntervalFromRange(block.root, {
      start: offset.start,
      end: offset.start + 2,
    })!;
    range.deleteContents();
    range.insertNode(old);
    this.buffer.current = old;
    this.buffer.old = old.cloneNode(true) as HTMLLabelElement;
  }
}

export class IBlockRemove extends Command<IBlockRemovePayload> {
  declare buffer: {
    current: HTMLLabelElement;
    label: HTMLLabelElement;
    start: number;
    index: number;
  };

  // onExecuteFn?: CommandCallback<IBlockRemovePayload> = ({ block }) => {
  //   block.setOffset({ ...this.buffer.offset, end: undefined });
  // };

  onUndoFn?: CommandCallback<IBlockRemovePayload> = (
    { page, block },
    { index, start }
  ) => {
    page.setLocation(block.getLocation(start + 2, index)!);
  };

  // onUndoFn?: CommandCallback<IBlockRemovePayload> = ({ page, block }) => {
  //   const label = this.buffer.current;
  //   page.activateInline(label);
  //   block.setRange(createRange(label, 0));
  // };
  constructor(payload: IBlockRemovePayload) {
    super(payload);
    const { block, label } = this.payload;
    const index = block.findEditableIndex(label);

    const bias = block.getBias([label, 0]) - 1;
    this.buffer = {
      current: label,
      label: label.cloneNode(true) as HTMLLabelElement,
      start: bias,
      index,
    };
  }

  execute(): void {
    const { block } = this.payload;
    const { start, index } = this.buffer;

    if (start !== undefined) {
      const label = block.getLocation(start + 1, index)![0] as HTMLLabelElement;
      label.remove();
    }
  }
  undo(): void {
    const { block } = this.payload;
    const { label, start, index } = this.buffer!;
    const startLoc = block.getLocation(start, index)!;
    const range = createRange(...startLoc);
    range.insertNode(label);
    this.buffer.current = label;
    this.buffer.label = label.cloneNode(true) as HTMLLabelElement;
  }
}
