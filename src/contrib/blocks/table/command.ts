import { AnyBlock } from "@/system/block";
import { Command } from "@/system/history";
import { Page } from "@/system/page";
import { Table } from "./block";

export interface TableChangePayload {
  page: Page;
  block: Table;
  index: number;
  axis: "row" | "column";
}

export class TableChange extends Command<TableChangePayload> {
  execute(): void {
    const { block, index, axis } = this.payload;
    if (axis === "row") {
      block.addRow(index);
    } else {
      block.addColumn(index);
    }
  }
  undo(): void {
    const { block, index, axis } = this.payload;
    if (axis === "row") {
      block.removeRow(index);
    } else {
      block.removeColummn(index);
    }
  }
}
