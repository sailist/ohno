import { createElement } from "@ohno-editor/core/helper/document";
import {
  IComponent,
  IContainer,
  IPlugin,
  OhNoClipboardData,
} from "@ohno-editor/core/system/base";
import { AnyBlock } from "@ohno-editor/core/system/block";
import { computePosition } from "@floating-ui/dom";
import "./style.css";
import { Page } from "@ohno-editor/core/system";
import { BlockRemove } from "../../commands";

export class Dragable implements IPlugin {
  root: HTMLElement;
  name: string = "dragable";
  parent?: Page;
  current?: AnyBlock;
  draged?: AnyBlock;
  constructor() {
    this.root = createElement("div", {
      className: "oh-is-dragable",
      textContent: "",
      style: { position: "absolute" },
    });
    this.root.draggable = true;
    this.root.addEventListener("dragstart", (event) => {
      console.log(event);
      if (event.dataTransfer && this.current) {
        const block = this.current;
        event.dataTransfer.setDragImage(this.current!.root, 0, 0);
        const text = block.toMarkdown();
        const html = block.toHTML();
        event.dataTransfer.setData("text/plain", text);
        event.dataTransfer.setData("text/html", html);
        const ohnoData: OhNoClipboardData = {
          data: block.serialize(),
          inline: false,
          context: {
            dragFrom: this.current.order,
          },
        };
        this.draged = block;
        const json = JSON.stringify(ohnoData);
        event.dataTransfer.setData("text/ohno", json);
      }
    });
    this.root.addEventListener("dragend", (e) => {
      e.preventDefault();
    });

    // this.root.addEventListener("mouseup", (e) => {
    //   debugger;
    // });
  }
  hook(): void {
    throw new Error("Method not implemented.");
  }
  destory(): void {
    throw new Error("Method not implemented.");
  }
  setParent(parent?: Page): void {
    this.parent = parent;
  }
  serialize(option?: any): string {
    throw new Error("Method not implemented.");
  }
  equals(component?: IComponent | undefined): boolean {
    throw new Error("Method not implemented.");
  }
  detach(): void {
    throw new Error("Method not implemented.");
  }

  span(block: AnyBlock, force?: boolean) {
    this.root.style.height = block.root.clientHeight + "px";
    if (this.current !== block || force) {
      this.current = block;
      computePosition(block.root, this.root, { placement: "left-start" }).then(
        ({ x, y }) => {
          // this.root.style.backgroundColor = "black";
          Object.assign(this.root.style, {
            left: `${x - 8}px`,
            top: `${y}px`,
          });
        }
      );
    }
  }
}